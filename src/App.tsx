import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { CommandPalette } from './components/CommandPalette';
import { MFALoginModal } from './components/auth/MFALoginModal';
import { CEODashboard } from './components/dashboard/CEODashboard';
import { ProjectsManagement } from './components/project/ProjectsManagement';
import { ProjectDetailsView } from './components/project/ProjectDetailsView';
import { UserProfileView } from './components/profile/UserProfileView';
import { CADStudio } from './components/cad/CADStudio';
import { AICADAgentStudio } from './components/cad/AICADAgentStudio';
import { DrawingCatalog } from './components/cad/DrawingCatalog';
import { GeneralNotesManager } from './components/cad/GeneralNotesManager';
import { BIMViewer3D } from './components/bim/BIMViewer3D';
import { BOQEstimator } from './components/boq/BOQEstimator';
import { GeotechnicalModule } from './components/geotech/GeotechnicalModule';
import { InventoryManager } from './components/inventory/InventoryManager';
import { FieldProgressReportForm } from './components/field/FieldProgressReportForm';
import { ProjectTimeline } from './components/project/ProjectTimeline';
import { FinanceModule } from './components/finance/FinanceModule';
import { HRModule } from './components/hr/HRModule';
import { ComplianceTracker } from './components/compliance/ComplianceTracker';
import { AIEngineeringAssistant } from './components/ai/AIEngineeringAssistant';
import { SystemTestsRunner } from './components/tests/SystemTestsRunner';
import { SettingsPage } from './components/settings/SettingsPage';
import { ArchitectureDocs } from './components/docs/ArchitectureDocs';
import { DesignSystemGuide } from './components/docs/DesignSystemGuide';
import { PerformanceGuideModal } from './components/common/PerformanceGuideModal';
import { testConnection } from './firebase';
import { DrawingService } from './services/drawingService';
import { MaterialManager } from './components/materials/MaterialManager';
import { UserRole, AppLanguage, CalendarType } from './types';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SyncProvider } from './context/SyncContext';
import { ToastContainer } from './components/common/ToastContainer';
import { FloatingSyncBanner } from './components/common/FloatingSyncBanner';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('ceo_dashboard');
  const [selectedCity, setSelectedCity] = useState<'کابل' | 'هرات' | 'مزار شریف' | 'قندهار' | 'جلال‌آباد'>('کابل');
  const [currentRole, setCurrentRole] = useState<UserRole>('technical_director');
  const [language, setLanguage] = useState<AppLanguage>('fa');
  const [calendar, setCalendar] = useState<CalendarType>('solar');
  const [currentProjectId, setCurrentProjectId] = useState<string>('proj-01');
  const [cadDrawingCode, setCadDrawingCode] = useState<string>('S01');
  const [drawingsCount, setDrawingsCount] = useState<number>(108);

  // Command Palette, Mobile Drawer, MFA & Performance Guide Modal states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isMFALoginOpen, setIsMFALoginOpen] = useState<boolean>(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState<boolean>(false);

  // Initialize data service & test Firebase Firestore connection
  useEffect(() => {
    DrawingService.initialize();
    setDrawingsCount(DrawingService.getDrawings().length);
    testConnection();

    // Listen for global Ctrl+K shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenDrawingInCAD = (drawingCode: string = 'S01') => {
    setCadDrawingCode(drawingCode);
    setActiveTab('cad');
  };

  const handleLoginSuccess = (email: string, role: UserRole) => {
    setCurrentRole(role);
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <SyncProvider>
          <ProjectProvider initialProjectId={currentProjectId} onProjectChange={setCurrentProjectId}>
          <div
            dir={language === 'en' ? 'ltr' : 'rtl'}
            className={`min-h-screen bg-[var(--ab-bg-app)] text-[var(--ab-text-primary)] flex flex-col font-['Vazirmatn',sans-serif] ${
              language === 'en' ? 'font-sans' : ''
            }`}
          >
            {/* Skip to Content Link (Section 8-4 WCAG AAA) */}
            <a
              href="#main-content"
              className="ab-sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[1099] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-950 focus:rounded-lg focus:font-bold focus:shadow-2xl"
            >
              پرش به محتوای اصلی (Skip to main content)
            </a>

            {/* Top 56px AppShell Navbar (Section 4-4) */}
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              language={language}
              setLanguage={setLanguage}
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
              onOpenAuthModal={() => setIsMFALoginOpen(true)}
              onOpenPerformanceModal={() => setIsPerformanceModalOpen(true)}
            />

            {/* Middle Section: Collapsible Sidebar + Main Content Viewport */}
            <div className="flex-1 flex overflow-hidden">
              {/* Collapsible Sidebar (Desktop 240px <-> 64px, Section 4-5) */}
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                drawingsCount={drawingsCount}
              />

              {/* Main Persistent Content Area */}
              <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto pb-20 md:pb-8 ab-scroll focus:outline-none">
                {activeTab === 'ceo_dashboard' && (
                  <CEODashboard
                    currentProjectId={currentProjectId}
                    onSelectProject={(id) => setCurrentProjectId(id)}
                    onNavigate={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'projects' && (
                  <ProjectsManagement
                    onOpenProjectDetails={(id) => {
                      setCurrentProjectId(id);
                      setActiveTab('project_details');
                    }}
                  />
                )}

                {activeTab === 'project_details' && (
                  <ProjectDetailsView
                    onBack={() => setActiveTab('projects')}
                    onNavigateToCAD={handleOpenDrawingInCAD}
                    onNavigateToBOQ={() => setActiveTab('boq')}
                  />
                )}

                {activeTab === 'user_profile' && (
                  <UserProfileView />
                )}

                {activeTab === 'cad' && (
                  <CADStudio
                    initialDrawingCode={cadDrawingCode}
                    onOpenNotesManager={() => setActiveTab('notes')}
                  />
                )}

                {activeTab === 'ai_cad_agent' && (
                  <AICADAgentStudio
                    currentDrawingCode={cadDrawingCode}
                    onNavigateToCAD={(code) => {
                      setCadDrawingCode(code);
                      setActiveTab('cad');
                    }}
                  />
                )}

                {activeTab === 'catalog' && (
                  <DrawingCatalog onSelectDrawing={handleOpenDrawingInCAD} />
                )}

                {activeTab === 'notes' && (
                  <GeneralNotesManager />
                )}

                {activeTab === 'bim' && (
                  <BIMViewer3D onNavigateToMaterials={() => setActiveTab('materials')} />
                )}

                {activeTab === 'materials' && (
                  <MaterialManager onNavigateToBIM={() => setActiveTab('bim')} />
                )}

                {activeTab === 'boq' && (
                  <BOQEstimator
                    selectedCity={selectedCity}
                    onCityChange={setSelectedCity}
                  />
                )}

                {activeTab === 'geotech' && (
                  <GeotechnicalModule />
                )}

                {activeTab === 'inventory' && (
                  <InventoryManager />
                )}

                {activeTab === 'field_form' && (
                  <FieldProgressReportForm currentProjectId={currentProjectId} />
                )}

                {activeTab === 'project' && (
                  <ProjectTimeline />
                )}

                {activeTab === 'finance' && (
                  <FinanceModule />
                )}

                {activeTab === 'hr' && (
                  <HRModule />
                )}

                {activeTab === 'compliance' && (
                  <ComplianceTracker />
                )}

                {activeTab === 'ai' && (
                  <AIEngineeringAssistant />
                )}

                {activeTab === 'settings' && (
                  <SettingsPage
                    language={language}
                    onLanguageChange={setLanguage}
                    calendar={calendar}
                    onCalendarChange={setCalendar}
                    currentRole={currentRole}
                    onRoleChange={setCurrentRole}
                  />
                )}

                {activeTab === 'tests' && (
                  <SystemTestsRunner />
                )}

                {activeTab === 'design_system' && (
                  <DesignSystemGuide />
                )}

                {activeTab === 'docs' && (
                  <ArchitectureDocs />
                )}
              </main>
            </div>

            {/* Mobile Bottom Navigation & Slide-over Drawer (Section 4-4) */}
            <MobileNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isDrawerOpen={isMobileDrawerOpen}
              setIsDrawerOpen={setIsMobileDrawerOpen}
            />

            {/* Floating Toast Notification Container (Section 4-7) */}
            <ToastContainer />

            {/* Floating Connection & Background Sync Status Banner */}
            <FloatingSyncBanner />

            {/* Command Palette Modal (Ctrl + K) */}
            <CommandPalette
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              onNavigate={(tab) => setActiveTab(tab)}
              currentRole={currentRole}
              language={language}
            />

            {/* Two-Step Authentication (MFA) Modal (Section 7-1) */}
            <MFALoginModal
              isOpen={isMFALoginOpen}
              onClose={() => setIsMFALoginOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />

            {/* 60 FPS UI Architecture & Performance Testing Modal */}
            <PerformanceGuideModal
              isOpen={isPerformanceModalOpen}
              onClose={() => setIsPerformanceModalOpen(false)}
            />
          </div>
        </ProjectProvider>
      </SyncProvider>
    </ToastProvider>
  </ThemeProvider>
  );
}
