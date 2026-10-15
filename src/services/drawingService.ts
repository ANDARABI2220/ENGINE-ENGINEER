import { Drawing, GeneralNote, DrawingSeries } from '../types';
import { INITIAL_DRAWINGS } from '../data/initialDrawings';
import { INITIAL_NOTES } from '../data/initialNotes';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

const STORAGE_DRAWINGS_KEY = 'afghanabuild_drawings_cache';
const STORAGE_NOTES_KEY = 'afghanabuild_notes_cache';

export class DrawingService {
  private static drawings: Drawing[] = [];
  private static notes: GeneralNote[] = [];

  static initialize(): { drawings: Drawing[]; notes: GeneralNote[] } {
    try {
      const cachedD = localStorage.getItem(STORAGE_DRAWINGS_KEY);
      const cachedN = localStorage.getItem(STORAGE_NOTES_KEY);

      this.drawings = cachedD ? JSON.parse(cachedD) : INITIAL_DRAWINGS;
      this.notes = cachedN ? JSON.parse(cachedN) : INITIAL_NOTES;
    } catch {
      this.drawings = INITIAL_DRAWINGS;
      this.notes = INITIAL_NOTES;
    }
    return { drawings: this.drawings, notes: this.notes };
  }

  static getDrawings(): Drawing[] {
    if (this.drawings.length === 0) {
      this.initialize();
    }
    return this.drawings;
  }

  static getDrawingsBySeries(series: DrawingSeries): Drawing[] {
    return this.getDrawings().filter(d => d.series === series);
  }

  static getNotes(): GeneralNote[] {
    if (this.notes.length === 0) {
      this.initialize();
    }
    return this.notes;
  }

  static getDrawingByCode(code: string): Drawing | undefined {
    return this.getDrawings().find(d => d.code === code);
  }

  static getNoteByCode(code: string): GeneralNote | undefined {
    return this.getNotes().find(n => n.code === code);
  }

  static getNotesForDrawing(drawingCode: string): GeneralNote[] {
    const drawing = this.getDrawingByCode(drawingCode);
    if (!drawing) return [];

    return this.getNotes().filter(note =>
      (drawing.linkedNoteIds && drawing.linkedNoteIds.includes(note.code)) ||
      (note.linkedDrawingCodes && note.linkedDrawingCodes.includes(drawingCode))
    );
  }

  /**
   * Centralized Note Propagation:
   * When a General Note (e.g. G-014) is updated, all drawings linked to it
   * are automatically synchronized and their updated timestamps refreshed.
   */
  static updateGeneralNote(updatedNote: GeneralNote): { success: boolean; affectedDrawingsCount: number } {
    const noteIndex = this.notes.findIndex(n => n.id === updatedNote.id || n.code === updatedNote.code);
    if (noteIndex === -1) {
      this.notes.push(updatedNote);
    } else {
      this.notes[noteIndex] = {
        ...updatedNote,
        version: updatedNote.version + 1,
        updatedAt: new Date().toLocaleDateString('fa-AF', { year: 'numeric', month: '2-digit', day: '2-digit' })
      };
    }

    let affectedCount = 0;
    // Auto-propagate across all linked blueprints
    this.drawings = this.drawings.map(d => {
      const isLinked = updatedNote.linkedDrawingCodes.includes(d.code) ||
        (d.linkedNoteIds && d.linkedNoteIds.includes(updatedNote.code));

      if (isLinked) {
        affectedCount++;
        const currentLinks = d.linkedNoteIds || [];
        const newLinks = currentLinks.includes(updatedNote.code) ? currentLinks : [...currentLinks, updatedNote.code];
        return {
          ...d,
          linkedNoteIds: newLinks,
          updatedAt: new Date().toLocaleDateString('fa-AF', { year: 'numeric', month: '2-digit', day: '2-digit' })
        };
      }
      return d;
    });

    try {
      localStorage.setItem(STORAGE_DRAWINGS_KEY, JSON.stringify(this.drawings));
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(this.notes));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Attempt background sync to Firestore if user is authenticated
    if (auth.currentUser) {
      const path = `generalNotes/${updatedNote.id || updatedNote.code}`;
      setDoc(doc(db, 'generalNotes', updatedNote.id || updatedNote.code), {
        code: updatedNote.code,
        category: updatedNote.category,
        title: updatedNote.title,
        text: updatedNote.text,
        linkedDrawingCodes: updatedNote.linkedDrawingCodes,
        version: updatedNote.version,
        status: updatedNote.status,
        createdBy: updatedNote.createdBy,
        ownerId: auth.currentUser.uid,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.warn('Firestore sync background notice:', err);
      });
    }

    return { success: true, affectedDrawingsCount: affectedCount };
  }

  static updateDrawing(updatedDrawing: Drawing): boolean {
    const idx = this.drawings.findIndex(d => d.id === updatedDrawing.id || d.code === updatedDrawing.code);
    if (idx !== -1) {
      this.drawings[idx] = {
        ...updatedDrawing,
        updatedAt: new Date().toLocaleDateString('fa-AF', { year: 'numeric', month: '2-digit', day: '2-digit' })
      };
    } else {
      this.drawings.push(updatedDrawing);
    }

    try {
      localStorage.setItem(STORAGE_DRAWINGS_KEY, JSON.stringify(this.drawings));
    } catch (e) {
      console.warn('Storage failed:', e);
    }

    if (auth.currentUser) {
      setDoc(doc(db, 'drawings', updatedDrawing.id), {
        projectId: updatedDrawing.projectId,
        series: updatedDrawing.series,
        code: updatedDrawing.code,
        title: updatedDrawing.title,
        floor: updatedDrawing.floor,
        version: updatedDrawing.version,
        status: updatedDrawing.status,
        engineerName: updatedDrawing.engineerName,
        linkedNoteIds: updatedDrawing.linkedNoteIds,
        cadData: JSON.stringify(updatedDrawing.elements || []),
        ownerId: auth.currentUser.uid,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.warn('Firestore drawing sync background notice:', err);
      });
    }

    return true;
  }
}
