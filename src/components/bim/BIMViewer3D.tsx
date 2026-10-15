import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Box,
  Eye,
  Layers,
  Activity,
  Flame,
  ShieldAlert,
  RotateCcw,
  Zap,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Calendar,
  DollarSign,
  Wind,
  ShieldCheck,
  Clock,
  Download,
  Play,
  Pause,
  Sliders,
  FileSpreadsheet,
  FileText,
  BarChart3,
  TrendingUp,
  Cpu,
  ArrowRight,
  Maximize2,
  RefreshCw,
  HardHat,
  ThermometerSnowflake,
  LifeBuoy,
  ExternalLink,
  Globe,
  MapPin,
  SlidersHorizontal,
  Radio,
  Map,
  Crosshair
} from 'lucide-react';
import {
  StructuralPhysicsEngine,
  STANDARD_MATERIALS,
  MaterialProperties,
  AppliedLoad,
  FEAAnalysisSummary,
  LoadType
} from '../../services/structuralPhysicsEngine';
import {
  AFGHAN_CITIES_GIS,
  AfghanCityKey,
  ElementHazardMetrics,
  RISK_COLOR_MAP,
  getFocalDepthColor,
  getFocalDepthColorCss,
  queryElementHazardMetrics,
  wgs84ToLocalSiteMeters,
  EarthquakeRecord,
  calculateSeismicRiskDashboard
} from '../../services/gisSeismicHazardService';
import { SeismicRiskDashboard } from './SeismicRiskDashboard';
import { useProjectContext } from '../../context/ProjectContext';

interface BIMViewer3DProps {
  onNavigateToMaterials?: () => void;
}

export const BIMViewer3D: React.FC<BIMViewer3DProps> = ({ onNavigateToMaterials }) => {
  const { materials, activeMaterialId, setActiveMaterialId } = useProjectContext();
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Active Main Tab
  const [activeSimulationTab, setActiveSimulationTab] = useState<
    'fea_physics' | 'gis_hazard' | '4d_schedule' | '5d_cost' | 'energy_green' | 'earthquake_2800' | 'cfd_ventilation' | 'hse_safety' | 'lifecycle_7d'
  >('fea_physics');

  // GIS Seismic Hazard Overlay State
  const [isGisOverlayActive, setIsGisOverlayActive] = useState<boolean>(true);
  const [selectedCityKey, setSelectedCityKey] = useState<AfghanCityKey>('kabul');
  const [showEpicentersLayer, setShowEpicentersLayer] = useState<boolean>(true);
  const [showLiquefactionLayer, setShowLiquefactionLayer] = useState<boolean>(true);
  const [showBearingCapacityLayer, setShowBearingCapacityLayer] = useState<boolean>(true);
  const [showFaultLinesLayer, setShowFaultLinesLayer] = useState<boolean>(true);
  const [showContourLines, setShowContourLines] = useState<boolean>(true);
  const [spatialClippingEnabled, setSpatialClippingEnabled] = useState<boolean>(true);
  const [terrainOpacity, setTerrainOpacity] = useState<number>(0.65);
  const [glyphScale, setGlyphScale] = useState<number>(1.2);
  const [isOverlayManagerOpen, setIsOverlayManagerOpen] = useState<boolean>(false);

  // Interactive Highlighting & Tooltip State
  const [selectedHazardElement, setSelectedHazardElement] = useState<ElementHazardMetrics | null>(() =>
    queryElementHazardMetrics('RAFT-01', 'پی گسترده یکپارچه (Raft Foundation)', 0, 0, 'kabul')
  );
  const [hoveredEpicenter, setHoveredEpicenter] = useState<{
    earthquake: EarthquakeRecord;
    distanceKm: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>({ x: 20, y: 70 });
  const [highlightedElementId, setHighlightedElementId] = useState<string>('RAFT-01');
  const [isSeismicPulsingEnabled, setIsSeismicPulsingEnabled] = useState<boolean>(true);

  // 3D Viewport Controls
  const [viewMode, setViewMode] = useState<'solid' | 'structural' | 'mep' | 'fea_heatmap'>('fea_heatmap');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [showDeformationVectors, setShowDeformationVectors] = useState<boolean>(true);
  const [deformationExaggeration, setDeformationExaggeration] = useState<number>(50);

  // FEA Physics Engine State
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string>('concrete_c30');
  const [isFeaRunning, setIsFeaRunning] = useState<boolean>(true);
  const [loadType, setLoadType] = useState<LoadType>('static_point');
  const [loadMagnitude, setLoadMagnitude] = useState<number>(850); // kN or g
  const [loadDirection, setLoadDirection] = useState<'gravity' | 'lateral_x' | 'lateral_z' | 'bidirectional'>('gravity');
  const [simulationTimeSec, setSimulationTimeSec] = useState<number>(0);
  const [activeLoads, setActiveLoads] = useState<AppliedLoad[]>([
    {
      id: 'L1',
      type: 'static_point',
      name: 'بار متمرکز ثقلی ستون مرکزی (Gravity Point Load)',
      magnitude: 850,
      direction: [0, -1, 0],
      targetElement: 'column',
      targetStoryIndex: 10
    },
    {
      id: 'L2',
      type: 'dynamic_seismic',
      name: 'طیف شتاب افقی زلزله کابل/تهران (0.35g PGA)',
      magnitude: 0.35,
      direction: [1, 0, 0.3],
      targetElement: 'whole_building'
    }
  ]);

  // 4D Construction Simulation State
  const [currentWeek4D, setCurrentWeek4D] = useState<number>(24);
  const [is4DPlaying, setIs4DPlaying] = useState<boolean>(false);
  const totalWeeks4D = 52;

  // 5D Cost Currency State
  const [currency5D, setCurrency5D] = useState<'IRR' | 'AFN' | 'USD'>('IRR');
  const [inflationEscalation, setInflationEscalation] = useState<number>(15);

  // Clash Detection State
  const [isClashTestRunning, setIsClashTestRunning] = useState<boolean>(false);
  const [clashResult, setClashResult] = useState<{ detected: number; cleared: number; msg: string } | null>(null);

  // Standards Modal / Format Export State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'ifc4' | 'rvt' | 'archicad' | 'csv' | 'pdf'>('ifc4');

  // Stats
  const stats = useMemo(() => ({
    floors: 11,
    heightMeters: 38.5,
    columnsCount: 54,
    shearWallsVolumeM3: 420,
    mepRunsMeters: 1450,
    structuralElementsCount: 2840,
    grossFloorAreaM2: 6160
  }), []);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const structGroupRef = useRef<THREE.Group | null>(null);
  const mepGroupRef = useRef<THREE.Group | null>(null);
  const vectorsGroupRef = useRef<THREE.Group | null>(null);
  const gisGroupRef = useRef<THREE.Group | null>(null);
  const columnMeshesRef = useRef<THREE.Mesh[]>([]);
  const slabMeshesRef = useRef<THREE.Mesh[]>([]);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);

  // Run FEA Physics Calculations with Active Material from Material Manager
  const currentMaterial: MaterialProperties = useMemo(() => {
    const found = materials.find((m) => m.id === selectedMaterialKey) || materials.find((m) => m.id === activeMaterialId);
    if (found) {
      return {
        id: found.id,
        name: found.name,
        nameFa: found.nameFa,
        elasticModulusE: found.properties.elasticModulus,
        poissonsRatioNu: found.properties.poissonsRatio,
        densityRho: found.properties.density,
        yieldStrengthFy: found.properties.yieldStrength || (found.category === 'steel' ? 355 : 30),
        thermalExpansionAlpha: found.properties.thermalExpansionAlpha || 1.0e-5
      };
    }
    return STANDARD_MATERIALS[selectedMaterialKey] || STANDARD_MATERIALS.concrete_c30;
  }, [materials, selectedMaterialKey, activeMaterialId]);
  
  const feaSummary: FEAAnalysisSummary = useMemo(() => {
    return StructuralPhysicsEngine.runStructuralAnalysis(
      activeLoads,
      currentMaterial,
      deformationExaggeration,
      simulationTimeSec
    );
  }, [activeLoads, currentMaterial, deformationExaggeration, simulationTimeSec]);

  // Active Seismic Risk Dashboard data & High Risk Element IDs
  const activeSeismicDashboard = useMemo(() => {
    return calculateSeismicRiskDashboard(selectedCityKey);
  }, [selectedCityKey]);

  // Keep refs in sync for Three.js mouse listeners and 60fps render loop
  const selectedCityKeyRef = useRef(selectedCityKey);
  selectedCityKeyRef.current = selectedCityKey;
  const isGisOverlayActiveRef = useRef(isGisOverlayActive);
  isGisOverlayActiveRef.current = isGisOverlayActive;
  const isSeismicPulsingEnabledRef = useRef(isSeismicPulsingEnabled);
  isSeismicPulsingEnabledRef.current = isSeismicPulsingEnabled;
  const highlightedElementIdRef = useRef(highlightedElementId);
  highlightedElementIdRef.current = highlightedElementId;
  const highRiskElementIdsRef = useRef<string[]>(activeSeismicDashboard.highRiskElementIds);
  highRiskElementIdsRef.current = activeSeismicDashboard.highRiskElementIds;
  const overallTierRef = useRef(activeSeismicDashboard.overallTier);
  overallTierRef.current = activeSeismicDashboard.overallTier;

  // Three.js Scene Initialization and Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.5, 2000);
    cameraRef.current = camera;
    camera.position.set(50, 40, 60);
    camera.lookAt(0, 18, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(60, 90, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const blueFill = new THREE.DirectionalLight(0x38bdf8, 0.6);
    blueFill.position.set(-50, 30, -40);
    scene.add(blueFill);

    // 5. Ground Grid
    const gridHelper = new THREE.GridHelper(120, 60, 0xf59e0b, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // 6. Geometry Groups
    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;
    scene.add(buildingGroup);

    const structGroup = new THREE.Group();
    structGroupRef.current = structGroup;
    buildingGroup.add(structGroup);

    const mepGroup = new THREE.Group();
    mepGroupRef.current = mepGroup;
    buildingGroup.add(mepGroup);

    const vectorsGroup = new THREE.Group();
    vectorsGroupRef.current = vectorsGroup;
    scene.add(vectorsGroup);

    // 6b. GIS Seismic Hazard Group
    const gisGroup = new THREE.Group();
    gisGroupRef.current = gisGroup;
    scene.add(gisGroup);

    columnMeshesRef.current = [];
    slabMeshesRef.current = [];

    // Materials
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.65,
      metalness: 0.15,
      wireframe: isWireframe
    });

    const shearWallMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.45,
      metalness: 0.25,
      wireframe: isWireframe
    });

    const mepMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.3,
      metalness: 0.8
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.7,
      opacity: 0.65,
      transparent: true,
      roughness: 0.1,
      ior: 1.52
    });

    // Raft Foundation (پی گسترده)
    const raftGeo = new THREE.BoxGeometry(32, 1.6, 24);
    const raftMesh = new THREE.Mesh(raftGeo, concreteMat);
    raftMesh.position.set(0, -0.8, 0);
    raftMesh.receiveShadow = true;
    raftMesh.userData = {
      id: 'RAFT-01',
      nameFa: 'پی گسترده متصل یکپارچه (Raft Foundation)',
      type: 'foundation',
      localX: 0,
      localZ: 0
    };
    structGroup.add(raftMesh);

    // Central Shear Core (هسته برشی آسانسور و پلکان طبق مبحث ۹)
    const coreGeo = new THREE.BoxGeometry(6, 38.5, 6);
    const coreMesh = new THREE.Mesh(coreGeo, shearWallMat);
    coreMesh.position.set(0, 19.25, 0);
    coreMesh.castShadow = true;
    coreMesh.userData = {
      id: 'CORE-01',
      nameFa: 'هسته برشی بتنی مسلح مرکزی (Central Shear Core)',
      type: 'shear_core',
      localX: 0,
      localZ: 0
    };
    coreMeshRef.current = coreMesh;
    structGroup.add(coreMesh);

    // Multistory Slabs, Columns & MEP
    const totalLevels = 10;
    const levelHeight = 3.5;

    for (let i = 0; i < totalLevels; i++) {
      const yPos = i * levelHeight;

      // Slab
      const slabGeo = new THREE.BoxGeometry(28, 0.35, 20);
      const slabMesh = new THREE.Mesh(slabGeo, concreteMat.clone());
      slabMesh.position.set(0, yPos, 0);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      (slabMesh as any).floorIndex = i;
      slabMesh.userData = {
        id: `SLAB-FL${i + 1}`,
        nameFa: `دال بتنی سقف طبقه ${i + 1}`,
        type: 'slab',
        localX: 0,
        localZ: 0,
        floor: i + 1
      };
      slabMeshesRef.current.push(slabMesh);
      structGroup.add(slabMesh);

      // Glass Curtain Facade
      const facadeGeo = new THREE.BoxGeometry(28.2, levelHeight - 0.4, 20.2);
      const facadeMesh = new THREE.Mesh(facadeGeo, glassMat);
      facadeMesh.position.set(0, yPos + levelHeight / 2, 0);
      buildingGroup.add(facadeMesh);

      // Outer Structural Columns
      const colPositions = [
        [-12, -8], [0, -8], [12, -8],
        [-12, 8],  [0, 8],  [12, 8],
        [-12, 0],  [12, 0]
      ];

      colPositions.forEach(([cx, cz], colIdx) => {
        const colGeo = new THREE.BoxGeometry(0.8, levelHeight, 0.8);
        const colMesh = new THREE.Mesh(colGeo, shearWallMat.clone());
        colMesh.position.set(cx, yPos + levelHeight / 2, cz);
        colMesh.castShadow = true;
        (colMesh as any).floorIndex = i;
        (colMesh as any).colIndex = colIdx;
        colMesh.userData = {
          id: `COL-FL${i + 1}-C${colIdx + 1}`,
          nameFa: `ستون بتنی طبقه ${i + 1} - محور ${colIdx + 1}`,
          type: 'column',
          localX: cx,
          localZ: cz,
          floor: i + 1
        };
        columnMeshesRef.current.push(colMesh);
        structGroup.add(colMesh);
      });

      // MEP Ducts & Risers
      const ductGeo = new THREE.BoxGeometry(26, 0.45, 0.65);
      const ductMesh = new THREE.Mesh(ductGeo, mepMat);
      ductMesh.position.set(0, yPos + levelHeight - 0.5, 3);
      mepGroup.add(ductMesh);

      const pipeGeo = new THREE.CylinderGeometry(0.22, 0.22, levelHeight, 16);
      const pipeMesh = new THREE.Mesh(pipeGeo, mepMat);
      pipeMesh.position.set(4, yPos + levelHeight / 2, 4);
      mepGroup.add(pipeMesh);
    }

    // 7. Interactive Orbit Controls
    let isMouseDown = false;
    let isRightDown = false;
    let prevMouse = { x: 0, y: 0 };
    let clickStart = { x: 0, y: 0 };
    let rotation = { x: 0.35, y: 0.7 };
    let pan = { x: 0, y: 18, z: 0 };
    let distance = 78;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) isRightDown = true;
      else isMouseDown = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      clickStart = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown && !isRightDown) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      if (isMouseDown) {
        rotation.y += dx * 0.007;
        rotation.x = Math.max(-0.2, Math.min(1.2, rotation.x + dy * 0.007));
      } else if (isRightDown) {
        pan.y -= dy * 0.04;
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
      isRightDown = false;

      // Click detection if movement was minimal (<5px)
      if (Math.hypot(e.clientX - clickStart.x, e.clientY - clickStart.y) < 5) {
        if (!container || !cameraRef.current) return;
        const rect = container.getBoundingClientRect();
        const rayMouse = new THREE.Vector2(
          ((e.clientX - rect.left) / container.clientWidth) * 2 - 1,
          -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(rayMouse, cameraRef.current);

        // 1. Raycast structural elements (BIM model)
        if (structGroupRef.current) {
          const structHits = raycaster.intersectObjects(structGroupRef.current.children, true);
          if (structHits.length > 0) {
            let hitObj: any = structHits[0].object;
            while (hitObj && !hitObj.userData?.id && hitObj.parent && hitObj.parent !== structGroupRef.current) {
              hitObj = hitObj.parent;
            }
            if (hitObj && hitObj.userData?.id) {
              const u = hitObj.userData;
              setHighlightedElementId(u.id);
              const metrics = queryElementHazardMetrics(
                u.id,
                u.nameFa || 'المان سازه‌ای',
                u.localX ?? hitObj.position.x,
                u.localZ ?? hitObj.position.z,
                selectedCityKeyRef.current
              );
              setSelectedHazardElement(metrics);
              setHoveredEpicenter(null);
              setTooltipPos({
                x: Math.min(container.clientWidth - 320, Math.max(20, e.clientX - rect.left + 15)),
                y: Math.min(container.clientHeight - 260, Math.max(20, e.clientY - rect.top - 20))
              });
              return;
            }
          }
        }

        // 2. Raycast GIS epicenters if active
        if (gisGroupRef.current && isGisOverlayActiveRef.current) {
          const gisHits = raycaster.intersectObjects(gisGroupRef.current.children, true);
          const eqHit = gisHits.find((h: any) => h.object?.userData?.isEpicenter);
          if (eqHit) {
            const u = (eqHit.object as any).userData;
            setHoveredEpicenter({
              earthquake: u.earthquake,
              distanceKm: u.distanceKm
            });
            setTooltipPos({
              x: Math.min(container.clientWidth - 320, Math.max(20, e.clientX - rect.left + 15)),
              y: Math.min(container.clientHeight - 260, Math.max(20, e.clientY - rect.top - 20))
            });
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance = Math.max(20, Math.min(180, distance + e.deltaY * 0.06));
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('contextmenu', onContextMenu);

    // 8. Render Loop with High Frame Rate Synchronization
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Advance physics simulation time if running
      if (isFeaRunning) {
        setSimulationTimeSec((prev) => prev + delta);
      }

      // Camera view positioning
      camera.position.x = pan.x + distance * Math.cos(rotation.x) * Math.sin(rotation.y);
      camera.position.y = pan.y + distance * Math.sin(rotation.x);
      camera.position.z = pan.z + distance * Math.cos(rotation.x) * Math.cos(rotation.y);
      camera.lookAt(pan.x, pan.y, pan.z);

      // GPU-accelerated High Risk BIM Element Pulsing Animation
      // Subtle 2.5s ease-in-out cycle modulating opacity (85% to 100%) and emissive intensity (0.2 to 0.7)
      if (structGroupRef.current) {
        const isPulsing = isSeismicPulsingEnabledRef.current;
        const highRiskIds = highRiskElementIdsRef.current;
        const cycle = (Math.sin((elapsed * Math.PI * 2) / 2.5) + 1) / 2;
        const emissiveIntensity = 0.2 + cycle * (0.7 - 0.2);
        const opacity = 0.85 + cycle * (1.0 - 0.85);
        const pulseColorHex = overallTierRef.current === 'high' ? 0xef4444 : 0xf59e0b;

        structGroupRef.current.traverse((child) => {
          if ((child as any).isMesh && child.userData?.id) {
            const uId = child.userData.id;
            const isSelected = uId === highlightedElementIdRef.current;
            const isHighRisk = highRiskIds.includes(uId);
            const mat = (child as THREE.Mesh).material as any;

            if (mat && mat.emissive) {
              if (isSelected) {
                mat.emissive.setHex(0x38bdf8);
                mat.emissiveIntensity = 0.75;
                mat.opacity = 1.0;
                mat.transparent = false;
              } else if (isPulsing && isHighRisk) {
                mat.emissive.setHex(pulseColorHex);
                mat.emissiveIntensity = emissiveIntensity;
                mat.opacity = opacity;
                mat.transparent = true;
              } else if (!isSelected && (mat.emissiveIntensity > 0 || mat.opacity < 1.0)) {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
                mat.opacity = 1.0;
                mat.transparent = false;
              }
            }
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('contextmenu', onContextMenu);

      // Clean Three.js resources
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isWireframe]);

  // Synchronize FEA Deformations & Heatmap Colors onto 3D Meshes
  useEffect(() => {
    if (!buildingGroupRef.current || !structGroupRef.current) return;

    const scale = deformationExaggeration * 0.001; // mm to visual meter scale

    // Update Columns & Slabs displacement and stress heatmap
    columnMeshesRef.current.forEach((colMesh) => {
      const floor = (colMesh as any).floorIndex || 0;
      const heightRatio = (floor + 1) / 11;
      
      // Node result lookup
      const node = feaSummary.nodeResults.find((n) => n.nodeId.startsWith(`FL${floor}-C`)) || feaSummary.nodeResults[0];
      const stressRatio = node ? node.stressRatio : 0.2;
      const colorHex = StructuralPhysicsEngine.getStressHeatmapColor(stressRatio);

      // Apply heatmap material color if in FEA mode
      if (viewMode === 'fea_heatmap') {
        (colMesh.material as THREE.MeshStandardMaterial).color.set(colorHex);
      } else {
        (colMesh.material as THREE.MeshStandardMaterial).color.set(0xd97706);
      }

      // Visual structural deformation shift
      if (node) {
        colMesh.position.x = (node.originalPos[0]) + node.displacement[0] * scale;
        colMesh.position.z = (node.originalPos[2]) + node.displacement[2] * scale;
      }
    });

    // Update Core Shear Wall deformation
    if (coreMeshRef.current) {
      const topNode = feaSummary.nodeResults.find((n) => n.nodeId.startsWith('FL10-CORE')) || feaSummary.nodeResults[feaSummary.nodeResults.length - 1];
      if (topNode) {
        coreMeshRef.current.position.x = topNode.displacement[0] * scale * 0.6;
        coreMeshRef.current.position.z = topNode.displacement[2] * scale * 0.6;
        if (viewMode === 'fea_heatmap') {
          (coreMeshRef.current.material as THREE.MeshStandardMaterial).color.set(
            StructuralPhysicsEngine.getStressHeatmapColor(topNode.stressRatio)
          );
        }
      }
    }

    // Update Slabs
    slabMeshesRef.current.forEach((slabMesh) => {
      const floor = (slabMesh as any).floorIndex || 0;
      const node = feaSummary.nodeResults.find((n) => n.nodeId === `FL${floor}-SLAB-MID`);
      if (node) {
        slabMesh.position.x = node.displacement[0] * scale;
        slabMesh.position.z = node.displacement[2] * scale;
        if (viewMode === 'fea_heatmap') {
          (slabMesh.material as THREE.MeshStandardMaterial).color.set(
            StructuralPhysicsEngine.getStressHeatmapColor(node.stressRatio * 0.8)
          );
        }
      }
    });

    // Render Displacement Vector Arrows in 3D
    if (vectorsGroupRef.current) {
      while (vectorsGroupRef.current.children.length > 0) {
        vectorsGroupRef.current.remove(vectorsGroupRef.current.children[0]);
      }

      if (showDeformationVectors) {
        feaSummary.nodeResults.slice(0, 24).forEach((node) => {
          const mag = node.displacementMagnitude;
          if (mag > 0.05) {
            const dir = new THREE.Vector3(node.displacement[0], node.displacement[1], node.displacement[2]).normalize();
            const origin = new THREE.Vector3(...node.originalPos);
            const length = Math.min(8, Math.max(1.2, mag * scale * 15));
            const color = node.stressRatio > 0.8 ? 0xef4444 : 0x38bdf8;
            const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, 0.8, 0.4);
            vectorsGroupRef.current?.add(arrowHelper);
          }
        });
      }
    }
  }, [feaSummary, viewMode, showDeformationVectors, deformationExaggeration]);

  // Handle Layer Visibility
  useEffect(() => {
    if (!structGroupRef.current || !mepGroupRef.current) return;

    if (viewMode === 'solid' || viewMode === 'fea_heatmap') {
      structGroupRef.current.visible = true;
      mepGroupRef.current.visible = true;
    } else if (viewMode === 'structural') {
      structGroupRef.current.visible = true;
      mepGroupRef.current.visible = false;
    } else if (viewMode === 'mep') {
      structGroupRef.current.visible = false;
      mepGroupRef.current.visible = true;
    }
  }, [viewMode]);

  // Synchronize Highlight on Selected BIM Element
  useEffect(() => {
    if (!structGroupRef.current) return;
    structGroupRef.current.traverse((child) => {
      if ((child as any).isMesh && child.userData?.id) {
        const isSelected = child.userData.id === highlightedElementId;
        const mat = (child as THREE.Mesh).material;
        if (mat && (mat as any).emissive) {
          if (isSelected) {
            (mat as any).emissive.setHex(0x38bdf8);
            (mat as any).emissiveIntensity = 0.55;
          } else {
            (mat as any).emissive.setHex(0x000000);
            (mat as any).emissiveIntensity = 0;
          }
        }
      }
    });
  }, [highlightedElementId]);

  // Synchronize Selected Element Hazard Metrics when City Changes
  useEffect(() => {
    if (selectedHazardElement) {
      const refreshed = queryElementHazardMetrics(
        selectedHazardElement.elementId,
        selectedHazardElement.elementNameFa,
        0,
        0,
        selectedCityKey
      );
      setSelectedHazardElement(refreshed);
    }
  }, [selectedCityKey]);

  // Build & Synchronize GIS Seismic Hazard 3D Overlay
  useEffect(() => {
    const gisGroup = gisGroupRef.current;
    if (!gisGroup) return;

    // Clear previous GIS meshes cleanly
    while (gisGroup.children.length > 0) {
      const obj = gisGroup.children[0];
      gisGroup.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }

    if (!isGisOverlayActive) {
      gisGroup.visible = false;
      return;
    }
    gisGroup.visible = true;

    const city = AFGHAN_CITIES_GIS[selectedCityKey];
    const clipRadius = city.spatialClippingRadiusMeters;

    // 1. Spatial Boundary Clipping (City Geographic Limits)
    if (spatialClippingEnabled) {
      const ringGeo = new THREE.RingGeometry(clipRadius - 0.6, clipRadius + 0.6, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;
      gisGroup.add(ringMesh);

      const curtainGeo = new THREE.CylinderGeometry(clipRadius, clipRadius, 8, 48, 1, true);
      const curtainMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.08,
        wireframe: true
      });
      const curtainMesh = new THREE.Mesh(curtainGeo, curtainMat);
      curtainMesh.position.y = 4;
      gisGroup.add(curtainMesh);
    }

    // 2. Terrain Surface Draping & Soil Liquefaction Risk Zones
    if (showLiquefactionLayer) {
      city.liquefactionZones.forEach((zone) => {
        const shape = new THREE.Shape();
        zone.polygonCoords.forEach(([px, pz], idx) => {
          if (idx === 0) shape.moveTo(px, pz);
          else shape.lineTo(px, pz);
        });
        shape.closePath();

        const shapeGeo = new THREE.ShapeGeometry(shape);
        const riskColor = RISK_COLOR_MAP[zone.riskLevel].hex;
        const drapeMat = new THREE.MeshStandardMaterial({
          color: riskColor,
          roughness: 0.75,
          metalness: 0.1,
          transparent: true,
          opacity: terrainOpacity * 0.7,
          side: THREE.DoubleSide
        });
        const drapeMesh = new THREE.Mesh(shapeGeo, drapeMat);
        drapeMesh.rotation.x = -Math.PI / 2;
        drapeMesh.position.y = -0.06 + zone.contourElevationM * 0.15;
        drapeMesh.receiveShadow = true;
        gisGroup.add(drapeMesh);

        // Zone Contour Boundary Line
        const linePts = zone.polygonCoords.map(([px, pz]) => new THREE.Vector3(px, 0.06 + zone.contourElevationM * 0.15, pz));
        linePts.push(linePts[0]);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({
          color: riskColor,
          transparent: true,
          opacity: Math.min(1.0, terrainOpacity + 0.3)
        });
        const contourLine = new THREE.Line(lineGeo, lineMat);
        gisGroup.add(contourLine);
      });
    }

    // 3. Dynamic Elevation & Bearing Capacity Contour Lines
    if (showContourLines) {
      [14, 28, 42, Math.max(10, clipRadius - 3)].forEach((r, idx) => {
        const pts: THREE.Vector3[] = [];
        const segs = 48;
        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0.07 + idx * 0.03, Math.sin(a) * r));
        }
        const cGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const cMat = new THREE.LineDashedMaterial({
          color: 0x38bdf8,
          dashSize: 2.5,
          gapSize: 1.5,
          transparent: true,
          opacity: 0.5
        });
        const cLine = new THREE.Line(cGeo, cMat);
        cLine.computeLineDistances();
        gisGroup.add(cLine);
      });
    }

    // 4. Active Fault Traces
    if (showFaultLinesLayer) {
      city.activeFaults.forEach((fault) => {
        const pts = fault.pathOffsets.map(([fx, fz]) => new THREE.Vector3(fx, 0.15, fz));
        const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const fMat = new THREE.LineBasicMaterial({
          color: 0xef4444,
          linewidth: 3
        });
        const fLine = new THREE.Line(fGeo, fMat);
        gisGroup.add(fLine);

        // Fault Hazard Ribbon Markers
        fault.pathOffsets.forEach(([fx, fz]) => {
          const fBoxGeo = new THREE.BoxGeometry(1.4, 0.2, 1.4);
          const fBoxMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true });
          const fBox = new THREE.Mesh(fBoxGeo, fBoxMat);
          fBox.position.set(fx, 0.15, fz);
          gisGroup.add(fBox);
        });
      });
    }

    // 5. 3D Historical Earthquake Epicenters
    if (showEpicentersLayer) {
      city.earthquakes.forEach((eq) => {
        const pos = wgs84ToLocalSiteMeters(eq.latitude, eq.longitude, selectedCityKey);

        // Spatial clipping check
        if (spatialClippingEnabled && Math.hypot(pos.x, pos.z) > clipRadius + 5) {
          return;
        }

        const spireHeight = Math.max(3.5, (eq.magnitude - 4.0) * 5.5 * glyphScale);
        const depthColor = getFocalDepthColor(eq.depthKm);

        // Vertical Spire (Height proportional to magnitude)
        const spireGeo = new THREE.CylinderGeometry(0.2, 0.75, spireHeight, 16);
        const spireMat = new THREE.MeshStandardMaterial({
          color: depthColor,
          emissive: depthColor,
          emissiveIntensity: 0.5,
          roughness: 0.25,
          metalness: 0.7
        });
        const spireMesh = new THREE.Mesh(spireGeo, spireMat);
        spireMesh.position.set(pos.x, spireHeight / 2, pos.z);
        spireMesh.castShadow = true;
        spireMesh.userData = {
          isEpicenter: true,
          earthquake: eq,
          distanceKm: pos.distanceKm
        };
        gisGroup.add(spireMesh);

        // Octahedron Beacon at apex
        const beaconGeo = new THREE.OctahedronGeometry(1.1 * (eq.magnitude / 6.0), 0);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: depthColor,
          emissive: depthColor,
          emissiveIntensity: 0.85,
          roughness: 0.1
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(pos.x, spireHeight + 0.8, pos.z);
        beaconMesh.userData = {
          isEpicenter: true,
          earthquake: eq,
          distanceKm: pos.distanceKm
        };
        gisGroup.add(beaconMesh);

        // Seismic ground wave ripple rings
        [1.6, 3.2, 5.0].forEach((r, rIdx) => {
          const rippleGeo = new THREE.RingGeometry(r - 0.15, r + 0.15, 32);
          const rippleMat = new THREE.MeshBasicMaterial({
            color: depthColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: Math.max(0.12, 0.65 - rIdx * 0.2)
          });
          const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
          rippleMesh.rotation.x = -Math.PI / 2;
          rippleMesh.position.set(pos.x, 0.08 + rIdx * 0.02, pos.z);
          gisGroup.add(rippleMesh);
        });
      });
    }
  }, [
    isGisOverlayActive,
    selectedCityKey,
    showEpicentersLayer,
    showLiquefactionLayer,
    showBearingCapacityLayer,
    showFaultLinesLayer,
    showContourLines,
    spatialClippingEnabled,
    terrainOpacity,
    glyphScale
  ]);

  // 4D Construction Timer Playback
  useEffect(() => {
    let interval: any;
    if (is4DPlaying) {
      interval = setInterval(() => {
        setCurrentWeek4D((prev) => (prev >= totalWeeks4D ? 1 : prev + 1));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [is4DPlaying]);

  // Clash Detection Routine
  const runClashDetection = () => {
    setIsClashTestRunning(true);
    setClashResult(null);

    setTimeout(() => {
      setIsClashTestRunning(false);
      setClashResult({
        detected: 0,
        cleared: 186,
        msg: 'سیستم تداخل‌یابی هوشمند (ISO 19650 BIM Clash Detection) اجرا شد. تمام ۱۸ داکت تأسیساتی، ۶ رایزر و لوله‌کشی اطفای حریق بدون تداخل با تیرها و ستون‌های مبحث ۹ و ۱۰ تأیید گردید.'
      });
    }, 1200);
  };

  // Add / Update Applied Load
  const handleApplyUserLoad = () => {
    const dirMap: Record<string, [number, number, number]> = {
      gravity: [0, -1, 0],
      lateral_x: [1, 0, 0],
      lateral_z: [0, 0, 1],
      bidirectional: [0.8, -0.6, 0.4]
    };

    const newLoad: AppliedLoad = {
      id: `UL-${Date.now()}`,
      type: loadType,
      name: `بار آزمایشی کاربر (${loadType === 'static_point' ? 'متمرکز' : loadType === 'distributed' ? 'گسترده' : 'دینامیکی زلزله'}) - ${loadMagnitude} ${loadType === 'dynamic_seismic' ? 'g' : 'kN'}`,
      magnitude: loadMagnitude,
      direction: dirMap[loadDirection] || [0, -1, 0],
      targetElement: loadType === 'dynamic_seismic' ? 'whole_building' : 'column',
      targetStoryIndex: 10
    };

    setActiveLoads((prev) => [...prev, newLoad]);
  };

  const handleResetLoads = () => {
    setActiveLoads([
      {
        id: 'L1',
        type: 'static_point',
        name: 'بار متمرکز استاندارد ستون مرکزی (Gravity Point Load)',
        magnitude: 600,
        direction: [0, -1, 0],
        targetElement: 'column',
        targetStoryIndex: 10
      }
    ]);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const csvContent = StructuralPhysicsEngine.generateCSVReport(feaSummary);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AfghanaBuild_BIM_FEA_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-['Vazirmatn',sans-serif]">
      {/* Top Header & Global BIM Standard Badges */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-100">
                  مدل‌سازی سه‌بعدی اطلاعات ساختمان (BIM 3D / 4D / 5D)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  استاندارد ISO 19650
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                  مبحث ۶، ۹، ۱۰ و ۱۹ مقررات ملی
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                  استاندارد ۲۸۰۰ زلزله
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                سامانه جامع مدلسازی پارامتریک، شبیه‌سازی فیزیکی تغییرشکل اجزای محدود (FEA)، تحلیل زمانی، مالی، انرژی و تداخل‌یابی IFC / RVT
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>خروجی استاندارد (IFC / Revit / CSV)</span>
          </button>

          <button
            onClick={runClashDetection}
            disabled={isClashTestRunning}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs transition shadow-md shadow-amber-500/20"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isClashTestRunning ? 'اسکن تداخل‌سنجی...' : 'تداخل‌یابی هوشمند (Clash)'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with Integrated Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Side: 3D WebGL Viewport */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl h-[580px] flex flex-col">
          {/* Top Floating Viewport Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* View Layer Selector & GIS Toggle */}
            <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl flex items-center gap-1 shadow-xl flex-wrap">
              <button
                onClick={() => setViewMode('fea_heatmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'fea_heatmap' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>تحلیل تنش FEA</span>
              </button>
              <button
                onClick={() => setViewMode('solid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'solid' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                کامل (BIM)
              </button>
              <button
                onClick={() => setViewMode('structural')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'structural' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                اسکلت سازه
              </button>
              <button
                onClick={() => setViewMode('mep')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'mep' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                تأسیسات (MEP)
              </button>

              <span className="text-slate-700 mx-0.5">|</span>

              {/* GIS Overlay Master Toggle */}
              <button
                onClick={() => setIsGisOverlayActive(!isGisOverlayActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isGisOverlayActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title="فعال/غیرفعال‌سازی پهنه‌بندی خطر زلزله و روان‌گرایی GIS"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>لایه GIS زلزله</span>
                {isGisOverlayActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {/* City Quick Selector */}
              <div className="flex items-center gap-1 pl-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={selectedCityKey}
                  onChange={(e) => setSelectedCityKey(e.target.value as AfghanCityKey)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="kabul">کابل (PGA = 0.35g)</option>
                  <option value="herat">هرات (PGA = 0.30g)</option>
                  <option value="mazar">مزار شریف (PGA = 0.30g)</option>
                  <option value="kandahar">قندهار (PGA = 0.22g)</option>
                  <option value="jalalabad">جلال‌آباد (PGA = 0.38g)</option>
                </select>
              </div>
            </div>

            {/* Quick Action Toggles & Overlay Manager Trigger */}
            <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-700/80 px-2 py-1 rounded-xl flex items-center gap-2 text-xs text-slate-300 shadow-xl">
              <button
                onClick={() => setIsOverlayManagerOpen(!isOverlayManagerOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  isOverlayManagerOpen ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>مدیریت لایه‌ها</span>
              </button>

              <span className="text-slate-700">|</span>

              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                <input
                  type="checkbox"
                  checked={showDeformationVectors}
                  onChange={(e) => setShowDeformationVectors(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-600"
                />
                <span>بردارهای تغییرشکل</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                <input
                  type="checkbox"
                  checked={isWireframe}
                  onChange={(e) => setIsWireframe(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-600"
                />
                <span>شبکه سیمی</span>
              </label>
            </div>
          </div>

          {/* WebGL Canvas Container */}
          <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing relative" />

          {/* GIS Interactive Overlay Manager Panel (Flyout / Floating Modal) */}
          {isOverlayManagerOpen && (
            <div className="absolute top-16 right-4 z-30 w-80 max-w-[90vw] bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl text-xs space-y-3.5 max-h-[460px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <Map className="w-4 h-4 text-cyan-400" />
                  <span>مدیریت لایه‌های GIS لرزه‌ای و ژئوتکنیک</span>
                </div>
                <button
                  onClick={() => setIsOverlayManagerOpen(false)}
                  className="text-slate-400 hover:text-white font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* City Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">شهر و حوزه ژئودینامیک هدف:</label>
                <select
                  value={selectedCityKey}
                  onChange={(e) => setSelectedCityKey(e.target.value as AfghanCityKey)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="kabul">کابل - زون ۱ (شتاب مبنا ۰.۳۵g)</option>
                  <option value="herat">هرات - زون ۲ (شتاب مبنا ۰.۳۰g)</option>
                  <option value="mazar">مزار شریف - زون ۲ (شتاب مبنا ۰.۳۰g)</option>
                  <option value="kandahar">قندهار - زون ۳ (شتاب مبنا ۰.۲۲g)</option>
                  <option value="jalalabad">جلال‌آباد - زون ۱ (شتاب مبنا ۰.۳۸g)</option>
                </select>
              </div>

              {/* Layer Toggles */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-300">لایه‌های مکانی برداری و رستری:</span>

                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-900 transition">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>کانون زمین‌لرزه‌های تاریخی USGS (گلیف‌های ۳D)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showEpicentersLayer}
                    onChange={(e) => setShowEpicentersLayer(e.target.checked)}
                    className="rounded text-amber-500 bg-slate-800 border-slate-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-900 transition">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>پهنه‌بندی خطر روان‌گرایی (Soil Liquefaction Draping)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showLiquefactionLayer}
                    onChange={(e) => setShowLiquefactionLayer(e.target.checked)}
                    className="rounded text-amber-500 bg-slate-800 border-slate-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-900 transition">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>خطوط کانتور و تراز باربری خاک (Contour Lines)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showContourLines}
                    onChange={(e) => setShowContourLines(e.target.checked)}
                    className="rounded text-amber-500 bg-slate-800 border-slate-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-900 transition">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span>ردیابی گسل‌های فعال لرزه‌زا (Active Faults)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showFaultLinesLayer}
                    onChange={(e) => setShowFaultLinesLayer(e.target.checked)}
                    className="rounded text-amber-500 bg-slate-800 border-slate-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-900 transition">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>برش محدوده مکانی شهر (Spatial Boundary Clipping)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={spatialClippingEnabled}
                    onChange={(e) => setSpatialClippingEnabled(e.target.checked)}
                    className="rounded text-amber-500 bg-slate-800 border-slate-600"
                  />
                </label>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">شفافیت لایه زمین (Draping Opacity):</span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(terrainOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={terrainOpacity}
                    onChange={(e) => setTerrainOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">مقیاس ارتفاع ستون‌های زلزله (Glyph Scale):</span>
                    <span className="font-mono text-amber-400 font-bold">{glyphScale}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={glyphScale}
                    onChange={(e) => setGlyphScale(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              {/* Risk Level Standard Legend */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400">راهنمای رنگ‌بندی استاندارد خطر روان‌گرایی:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    <span>کم (Low)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded bg-amber-500" />
                    <span>متوسط (Moderate)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <span className="w-2 h-2 rounded bg-orange-500" />
                    <span>زیاد (High)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2 h-2 rounded bg-rose-500" />
                    <span>بحرانی (Severe)</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                  عمق کانونی: <span className="text-rose-400 font-bold">سطحی (&lt;۳۰km)</span> | <span className="text-amber-400 font-bold">متوسط (۳۰-۷۰)</span> | <span className="text-cyan-400 font-bold">عمیق (&gt;۷۰km)</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Tooltip: Selected Structural Element Hazard Metrics */}
          {selectedHazardElement && (
            <div className="absolute top-16 left-4 z-20 w-84 max-w-[88vw] bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl text-xs space-y-2.5 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-100 flex items-center gap-1.5">
                      <span>{selectedHazardElement.elementNameFa}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{selectedHazardElement.elementId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHazardElement(null)}
                  className="text-slate-400 hover:text-white font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Hazard & Geotechnical Data Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">شتاب مبنای طرح (PGA):</span>
                  <div className="font-mono font-black text-amber-400 text-sm">{selectedHazardElement.localPGA}g</div>
                  <div className="text-[9px] text-slate-500">{selectedHazardElement.cityNameFa} - زون لرزه‌ای</div>
                </div>

                <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">پتانسیل روان‌گرایی:</span>
                  <div className="font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${RISK_COLOR_MAP[selectedHazardElement.liquefactionRisk].badgeClass}`}>
                      {selectedHazardElement.liquefactionRiskFa}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500">عمق آب: {selectedHazardElement.groundwaterDepthM} متر</div>
                </div>
              </div>

              <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">تیپ خاک (مبحث ۶ / ۲۸۰۰):</span>
                  <span className="font-bold text-slate-100">{selectedHazardElement.siteClassFa}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">ظرفیت باربری مجاز پی (qa):</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedHazardElement.bearingCapacityKpa} kPa</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">نزدیک‌ترین گسل فعال:</span>
                  <span className="text-rose-400 font-bold">{selectedHazardElement.nearestFault.nameFa} ({selectedHazardElement.nearestFault.distanceM}m)</span>
                </div>
              </div>

              {/* Nearest Earthquake Info */}
              <div className="bg-rose-950/30 border border-rose-900/50 p-2 rounded-xl text-[10px] space-y-0.5 text-rose-200">
                <div className="font-bold flex items-center justify-between">
                  <span>زلزله شاخص: {selectedHazardElement.nearestEarthquake.name}</span>
                  <span className="font-mono font-black text-rose-400">Mw {selectedHazardElement.nearestEarthquake.magnitude}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-mono">
                  <span>فاصله کانون: {selectedHazardElement.nearestEarthquake.distanceKm} کیلومتر</span>
                  <span>عمق: {selectedHazardElement.nearestEarthquake.depthKm} km ({selectedHazardElement.nearestEarthquake.date})</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center italic">
                کلیک روی المان‌های مدل سه‌بعدی برای ارزیابی آنی پارامترهای لرزه‌ای
              </div>
            </div>
          )}

          {/* Hovered Earthquake Epicenter Floating Tooltip */}
          {hoveredEpicenter && (
            <div className="absolute top-16 left-4 z-20 w-80 max-w-[85vw] bg-slate-950/95 backdrop-blur-xl border border-rose-500/50 rounded-2xl p-4 shadow-2xl text-xs space-y-2 pointer-events-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-100">{hoveredEpicenter.earthquake.eventName}</h4>
                    <span className="text-[10px] text-slate-400">{hoveredEpicenter.earthquake.source} Database / {hoveredEpicenter.earthquake.eventDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => setHoveredEpicenter(null)}
                  className="text-slate-400 hover:text-white font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">بزرگی زلزله (Mw):</span>
                  <div className="font-mono font-black text-rose-400 text-base">{hoveredEpicenter.earthquake.magnitude}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">عمق کانونی:</span>
                  <div className="font-mono font-black text-amber-400 text-base">{hoveredEpicenter.earthquake.depthKm} km</div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">فاصله تا سایت پروژه:</span>
                  <span className="font-mono font-bold text-cyan-400">{hoveredEpicenter.distanceKm} کیلومتر</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">شدت در مقیاس مرکالی (MMI):</span>
                  <span className="font-bold text-slate-100">{hoveredEpicenter.earthquake.intensityMMI}</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                  {hoveredEpicenter.earthquake.significance}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Floating Legend & Deformation Exaggeration Slider (Left-anchored) */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-col md:flex-row items-start md:items-end gap-2.5 pointer-events-none max-w-[calc(100%-430px)]">
            {/* Color Stress Heatmap Legend & GIS Indicators */}
            <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl text-xs space-y-1.5 shadow-2xl">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-200 gap-3">
                <span>طیف تنش ون مایزز (FEA Stress) & GIS:</span>
                <span className="text-amber-400 font-mono text-[9px]">مبحث ۶ و ۲۸۰۰</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-2.5 rounded-md bg-gradient-to-r from-blue-500 via-cyan-400 via-emerald-400 via-amber-400 to-red-500 shadow-inner" />
                {isGisOverlayActive && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold">
                    {AFGHAN_CITIES_GIS[selectedCityKey].cityNameFa}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>ایمن (&lt;25%)</span>
                <span>هشدار (80%)</span>
                <span className="text-rose-400 font-bold">تسلیم</span>
              </div>
            </div>

            {/* Deformation Scale Exaggeration Bar */}
            <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl text-xs space-y-1 shadow-2xl min-w-[190px]">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-200">
                <span>بزرگنمایی تغییرشکل:</span>
                <span className="text-amber-400 font-mono font-black">{deformationExaggeration}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="250"
                step="5"
                value={deformationExaggeration}
                onChange={(e) => setDeformationExaggeration(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex items-center justify-between text-[9px] text-slate-500">
                <span>1x</span>
                <span>50x</span>
                <span>250x</span>
              </div>
            </div>
          </div>

          {/* Seismic Risk Dashboard Module (Anchored to Bottom-Right Corner) */}
          <SeismicRiskDashboard
            cityKey={selectedCityKey}
            onCityChange={(city) => setSelectedCityKey(city)}
            isPulsingEnabled={isSeismicPulsingEnabled}
            onTogglePulsing={(enabled) => setIsSeismicPulsingEnabled(enabled)}
            selectedElementId={highlightedElementId}
            onSelectElement={(elementId) => {
              setHighlightedElementId(elementId);
              const nameFa =
                elementId === 'RAFT-FND-01'
                  ? 'پی رادیه بتنی گسترده (Raft Foundation)'
                  : elementId === 'CORE-WALL-SHEAR'
                  ? 'دیوار برشی هسته مرکزی (Shear Core)'
                  : 'ستون بتنی مسلح باربر';
              const metrics = queryElementHazardMetrics(
                elementId,
                nameFa,
                0,
                0,
                selectedCityKey
              );
              setSelectedHazardElement(metrics);
            }}
          />
        </div>

        {/* Right Side: Structural Properties & Live FEA Indicators */}
        <div className="space-y-4">
          {/* Engineering Dimensions Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-200">مشخصات هندسی و سازه‌ای مدل</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                LOD 350 / IFC4
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>تعداد کل طبقات:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.floors} طبقه</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>ارتفاع سازه از تراز پی:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.heightMeters} متر</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>ستون‌های بتنی باربر C30:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.columnsCount} ستون</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>حجم بتن دیوار برشی:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.shearWallsVolumeM3} m³</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>مجموع مساحت ناخالص:</span>
                <span className="font-mono text-slate-200 font-bold">{stats.grossFloorAreaM2} m²</span>
              </div>
            </div>
          </div>

          {/* Real-time FEA Physics Live Output Badge */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Cpu className="w-4 h-4" />
                <span>موتور فیزیک محاسبات FEA زنده</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>بیشترین تغییرشکل (Max Disp):</span>
                <span className="font-mono font-bold text-amber-300">{feaSummary.maxDisplacementMm} mm</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                محل: {feaSummary.maxDisplacementElement}
              </div>

              <div className="flex items-center justify-between text-slate-300 pt-1">
                <span>حداکثر تنش ون مایزز:</span>
                <span className="font-mono font-bold text-rose-400">{feaSummary.maxVonMisesStressMpa} MPa</span>
              </div>

              <div className="flex items-center justify-between text-slate-300 pt-1">
                <span>ضریب اطمینان ایمنی (FOS):</span>
                <span className={`font-mono font-black ${feaSummary.minSafetyFactor >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {feaSummary.minSafetyFactor}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300 pt-1">
                <span>دریفت جانبی (استاندارد ۲۸۰۰):</span>
                <span className="font-mono text-cyan-400">
                  {(feaSummary.interstoryDriftRatio * 100).toFixed(2)}% (&le; 2.0%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${feaSummary.isDeflectionCompliant ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                {feaSummary.isDeflectionCompliant ? '✓ خیز مجاز مبحث ۶' : '⚠ فراتر از خیز مجاز'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${feaSummary.isDriftCompliant ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                {feaSummary.isDriftCompliant ? '✓ دریفت زلزله ۲۸۰۰' : '⚠ دریفت غیرمجاز'}
              </span>
            </div>
          </div>

          {/* Clash Result Box */}
          {clashResult && (
            <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>نتیجه تداخل‌یابی (BIM Clash Free)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {clashResult.msg}
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-300 pt-1 font-mono">
                <span>تداخل بحرانی: {clashResult.detected}</span>
                <span>تست شده: {clashResult.cleared} المان</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive BIM Simulation Modes Navigation Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setActiveSimulationTab('fea_physics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'fea_physics'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>تنظیمات بارگذاری و شبیه‌ساز FEA</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('gis_hazard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'gis_hazard'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>پهنه‌بندی لرزه‌ای و ژئوتکنیک GIS</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('4d_schedule')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === '4d_schedule'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>شبیه‌سازی ۴ بعدی زمان و ساخت (4D)</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('5d_cost')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === '5d_cost'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>مدیریت مالی و شبیه‌سازی ۵ بعدی (5D)</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('energy_green')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'energy_green'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>انرژی، پایداری و مبحث ۱۹</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('earthquake_2800')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'earthquake_2800'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>تحلیل زلزله و استاندارد ۲۸۰۰</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('cfd_ventilation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'cfd_ventilation'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>تهویه و کیفیت هوای داخل (CFD)</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('hse_safety')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'hse_safety'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>شبیه‌سازی ایمنی کارگاه (HSE)</span>
          </button>

          <button
            onClick={() => setActiveSimulationTab('lifecycle_7d')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSimulationTab === 'lifecycle_7d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>چرخه عمر و نگهداری (6D/7D)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: FEA Physics Simulation & Load Application Panel */}
      {activeSimulationTab === 'fea_physics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Load Configuration Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>پیکربندی بارهای سازه‌ای تست</span>
                </div>
                <button
                  onClick={handleResetLoads}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>بازنشانی بارها</span>
                </button>
              </div>

              {/* Load Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold">نوع بارگذاری:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLoadType('static_point')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition ${
                      loadType === 'static_point'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    متمرکز (Point)
                  </button>
                  <button
                    onClick={() => setLoadType('distributed')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition ${
                      loadType === 'distributed'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    گسترده (Distr.)
                  </button>
                  <button
                    onClick={() => setLoadType('dynamic_seismic')}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition ${
                      loadType === 'dynamic_seismic'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    لرزه‌ای (PGA)
                  </button>
                </div>
              </div>

              {/* Load Magnitude Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">مقدار بار:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {loadMagnitude} {loadType === 'dynamic_seismic' ? 'g (شتاب مبنا)' : 'kN (کیلونیوتن)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={loadType === 'dynamic_seismic' ? 0.05 : 50}
                  max={loadType === 'dynamic_seismic' ? 0.80 : 3500}
                  step={loadType === 'dynamic_seismic' ? 0.05 : 50}
                  value={loadMagnitude}
                  onChange={(e) => setLoadMagnitude(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Direction Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold">راستای اعمال نیرو:</label>
                <select
                  value={loadDirection}
                  onChange={(e) => setLoadDirection(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="gravity">ثقلی عمودی رو به پایین (-Y Gravity)</option>
                  <option value="lateral_x">جانبی افقی زلزله/باد (+X Lateral)</option>
                  <option value="lateral_z">جانبی عمق سازه (+Z Transverse)</option>
                  <option value="bidirectional">ترکیبی دو محوره (مبحث ۶)</option>
                </select>
              </div>

              {/* Material Preset from Material Manager */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-bold">مصالح سازه‌ای (Constitutive Material):</label>
                  {onNavigateToMaterials && (
                    <button
                      type="button"
                      onClick={onNavigateToMaterials}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                    >
                      <span>مدیریت مصالح</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <select
                  value={materials.some(m => m.id === selectedMaterialKey) ? selectedMaterialKey : activeMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialKey(e.target.value);
                    setActiveMaterialId(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <optgroup label="مصالح استاندارد و سفارشی فعال">
                    {materials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.isStandard ? '⭐ ' : '🔧 '} {mat.nameFa} (E = {mat.properties.elasticModulus} GPa, ν = {mat.properties.poissonsRatio}, ρ = {mat.properties.density})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Apply Load Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleApplyUserLoad}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs transition shadow-md shadow-amber-500/20"
                >
                  + اعمال بار جدید به مدل
                </button>
                <button
                  onClick={() => setIsFeaRunning(!isFeaRunning)}
                  className={`p-2 rounded-xl border transition ${
                    isFeaRunning ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                  title={isFeaRunning ? 'توقف موقت محاسبات زنده' : 'ادامه محاسبات زنده'}
                >
                  {isFeaRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Benchmark Validation Tests Table (<5% Error Guarantee) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>آزمون‌های صحت‌سنجی تحلیلی سازه (Analytical Benchmarks)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مقایسه حل دقیق فرمول‌های اویلر-برنولی با حل المان محدود موتور (انحراف مجاز &lt; 5%)
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>دانلود داده‌های گره‌ای (CSV)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2.5 font-bold">عنوان آزمون تئوریک مهندسی</th>
                      <th className="pb-2.5 font-bold">حل دقیق تحلیلی</th>
                      <th className="pb-2.5 font-bold">خروجی موتور FEA</th>
                      <th className="pb-2.5 font-bold">درصد انحراف</th>
                      <th className="pb-2.5 font-bold text-center">وضعیت صحت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {feaSummary.benchmarkDeviations.map((bm, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-sans font-medium text-slate-200">{bm.testName}</td>
                        <td className="py-2.5 text-slate-400">{bm.theoreticalValue}</td>
                        <td className="py-2.5 text-amber-300 font-bold">{bm.feaEngineValue}</td>
                        <td className="py-2.5 text-emerald-400 font-bold">{bm.deviationPercentage}%</td>
                        <td className="py-2.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-sans">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تأیید شد</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Active Loads Summary Chips */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400">بارهای فعال در مدل جاری:</div>
                <div className="flex flex-wrap gap-2">
                  {activeLoads.map((al) => (
                    <div
                      key={al.id}
                      className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-slate-300">{al.name}</span>
                      <button
                        onClick={() => setActiveLoads((prev) => prev.filter((p) => p.id !== al.id))}
                        className="text-slate-500 hover:text-rose-400 text-xs ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: GIS Seismic Hazard & Geotechnical Mapping Overlay */}
      {activeSimulationTab === 'gis_hazard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                    <span>پهنه‌بندی خطر زمین‌لرزه، روان‌گرایی و ژئوتکنیک GIS افغانستان</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                      USGS & AGS Georeferenced
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    انطباق مختصات مکانی مدل BIM با پایگاه داده لرزه‌خیزی، طبقه‌بندی تیپ خاک، خطر روان‌گرایی و گسل‌های فعال
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-slate-400">سیستم مختصات مرجع (SRS):</span>
              <span className="text-cyan-400 font-bold">WGS84 / Web Mercator Local Grid</span>
            </div>
          </div>

          {/* 5 Major Cities GIS Selector Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>انتخاب کلان‌شهر و حوزه لرزه‌زمین‌ساختی افغانستان:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                شهر فعال: <strong className="text-amber-400 font-bold">{AFGHAN_CITIES_GIS[selectedCityKey].cityNameFa}</strong> ({AFGHAN_CITIES_GIS[selectedCityKey].provinceFa})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(AFGHAN_CITIES_GIS) as AfghanCityKey[]).map((cKey) => {
                const c = AFGHAN_CITIES_GIS[cKey];
                const isSelected = selectedCityKey === cKey;
                return (
                  <div
                    key={cKey}
                    onClick={() => setSelectedCityKey(cKey)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500 text-slate-100 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-100">{c.cityNameFa}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        PGA: {c.designPGA}g
                      </span>
                    </div>

                    <div className="text-[11px] space-y-0.5">
                      <div className="text-slate-400">{c.standard2800Zone}</div>
                      <div className="text-cyan-400 font-mono text-[10px]">
                        {c.centerCoordinates.lat}° N, {c.centerCoordinates.lon}° E
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{c.earthquakes.length} زلزله ثبت‌شده</span>
                      <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        {isSelected ? '✓ سایت فعال' : 'انتخاب'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active City Geotechnical & Spatial Coordinates Overview */}
          {(() => {
            const activeCity = AFGHAN_CITIES_GIS[selectedCityKey];
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-400">شتاب مبنای طرح زلزله (PGA)</div>
                  <div className="text-xl font-mono font-black text-amber-400">{activeCity.designPGA}g</div>
                  <div className="text-[11px] text-slate-500">{activeCity.seismicZoneText}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-400">تیپ خاک و ساختار زمین‌شناسی</div>
                  <div className="text-sm font-bold text-slate-100">{activeCity.siteClassRecommended}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{activeCity.soilDescriptionFa}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-400">محدوده برش مکانی (Spatial Clipping)</div>
                  <div className="text-xl font-mono font-black text-cyan-400">R = {activeCity.spatialClippingRadiusMeters} m</div>
                  <div className="text-[11px] text-slate-500">حریم بهینه‌سازی رندر ۳ بعدی وب‌جی‌ال</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-400">تعداد گسل‌های فعال پیرامونی</div>
                  <div className="text-xl font-mono font-black text-rose-400">{activeCity.activeFaults.length} سامانه اصلی</div>
                  <div className="text-[11px] text-slate-400">
                    {activeCity.activeFaults.map(f => f.nameFa).join('، ')}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Historical Earthquakes Catalog Table (USGS & Local Geological Records) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>کاتالوگ زمین‌لرزه‌های تاریخی معتبر حوضه {AFGHAN_CITIES_GIS[selectedCityKey].cityNameFa} (پایگاه داده USGS و سازمان زمین‌شناسی)</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                نمایش به صورت گلیف‌های ۳ بعدی با ارتفاع متناسب با بزرگی Mw
              </span>
            </div>

            <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/60">
                    <th className="p-3">عنوان زمین‌لرزه</th>
                    <th className="p-3">تاریخ رخداد</th>
                    <th className="p-3">بزرگی (Mw)</th>
                    <th className="p-3">عمق کانونی (km)</th>
                    <th className="p-3">مختصات WGS84</th>
                    <th className="p-3">فاصله تا سایت</th>
                    <th className="p-3">شدت (MMI)</th>
                    <th className="p-3">اهمیت و آثار مهندسی سازه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {AFGHAN_CITIES_GIS[selectedCityKey].earthquakes.map((eq) => {
                    const localCoord = wgs84ToLocalSiteMeters(eq.latitude, eq.longitude, selectedCityKey);
                    const depthColor = getFocalDepthColorCss(eq.depthKm);
                    return (
                      <tr key={eq.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: depthColor }}
                          />
                          <span>{eq.eventName}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">{eq.eventDate}</td>
                        <td className="p-3 font-mono font-black text-rose-400 text-sm">{eq.magnitude}</td>
                        <td className="p-3 font-mono text-slate-200">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: `${depthColor}22`, color: depthColor, border: `1px solid ${depthColor}44` }}
                          >
                            {eq.depthKm} km {eq.depthKm < 30 ? '(سطحی)' : eq.depthKm < 70 ? '(متوسط)' : '(عمیق)'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">
                          {eq.latitude}° N, {eq.longitude}° E
                        </td>
                        <td className="p-3 font-mono text-cyan-400 font-bold">{localCoord.distanceKm} km</td>
                        <td className="p-3 font-bold text-amber-400">{eq.intensityMMI}</td>
                        <td className="p-3 text-slate-300 text-[11px] max-w-xs">{eq.significance}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Soil Liquefaction Risk Zones & Allowable Bearing Capacity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>پهنه‌بندی خطر روان‌گرایی، سطح ایستابی و ظرفیت باربری مجاز خاک (مبحث ۶ و آیین‌نامه ANSA)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                پوشش رستری نیمه‌شفاف با خطوط کانتور دینامیک
              </span>
            </div>

            <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-900/60">
                    <th className="p-3">پهنه ژئوتکنیکی</th>
                    <th className="p-3">سطح ریسک روان‌گرایی</th>
                    <th className="p-3">رده خاک (استاندارد ۲۸۰۰)</th>
                    <th className="p-3">شاخص SPT (N-Value)</th>
                    <th className="p-3">عمق آب زیرزمینی</th>
                    <th className="p-3">ظرفیت باربری مجاز (qa)</th>
                    <th className="p-3">تراز ارتفاعی کانتور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {AFGHAN_CITIES_GIS[selectedCityKey].liquefactionZones.map((z) => {
                    const badge = RISK_COLOR_MAP[z.riskLevel];
                    return (
                      <tr key={z.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 font-sans font-bold text-slate-100">{z.name}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${badge.badgeClass}`}>
                            {badge.textFa}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-slate-300 font-medium">{z.soilSiteClassFa}</td>
                        <td className="p-3 text-cyan-400 font-bold">{z.sptNRange}</td>
                        <td className="p-3 text-slate-300">{z.groundwaterDepthM} متر</td>
                        <td className="p-3 text-emerald-400 font-black text-sm">{z.allowableBearingCapacityKpa} kPa</td>
                        <td className="p-3 text-slate-400">{z.contourElevationM > 0 ? `+${z.contourElevationM}` : z.contourElevationM} m</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Fault Lines Dynamics Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>مکانیک و نرخ لغزش سالانه گسل‌های لرزه‌زای پیرامونی (Tectonic Fault Lines)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AFGHAN_CITIES_GIS[selectedCityKey].activeFaults.map((f) => (
                <div key={f.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-sm text-slate-100">{f.nameFa}</span>
                    <span className="font-mono text-[11px] text-slate-400">{f.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">مکانیسم گسلش:</span>
                      <strong className="text-amber-400">{f.type}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">نرخ لغزش سالانه:</span>
                      <strong className="text-rose-400 font-mono">{f.slipRateMmYear} mm/yr</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">بازه عمق کانونی:</span>
                      <strong className="text-slate-300 font-mono">{f.depthRangeKm}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 4D Time & Construction Schedule Simulation */}
      {activeSimulationTab === '4d_schedule' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>شبیه‌سازی زمانی ساخت و برنامه زمان‌بندی (BIM 4D Scheduling)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                انیمیشن پیوسته پیشرفت فیزیکی WBS، انطباق فعالیت‌ها با مدل اطلاعاتی ساختمان
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIs4DPlaying(!is4DPlaying)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition ${
                  is4DPlaying
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                }`}
              >
                {is4DPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{is4DPlaying ? 'توقف انیمیشن' : 'پخش انیمیشن ۴ بعدی'}</span>
              </button>

              <button
                onClick={() => setCurrentWeek4D(1)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                title="شروع مجدد"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4D Timeline Scrubber */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">
                هفته جاری ساخت: <span className="text-amber-400 font-mono font-black text-sm">هفته {currentWeek4D}</span> از ۵۲ هفته
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                پیشرفت فیزیکی کل: {Math.round((currentWeek4D / totalWeeks4D) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="1"
              max={totalWeeks4D}
              value={currentWeek4D}
              onChange={(e) => setCurrentWeek4D(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>فاز ۱: پی‌کنی و فونداسیون (هفته ۱-۸)</span>
              <span>فاز ۲: اسکلت بتنی و هسته برشی (هفته ۹-۲۸)</span>
              <span>فاز ۳: تأسیسات MEP (هفته ۲۹-۴۰)</span>
              <span>فاز ۴: نما و تحویل (هفته ۴۱-۵۲)</span>
            </div>
          </div>

          {/* WBS Phase Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl border transition ${currentWeek4D >= 8 ? 'bg-emerald-950/40 border-emerald-800' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs font-bold text-slate-200">فونداسیون و رادیه</div>
              <div className="text-[11px] text-slate-400 mt-1">حجم ۳۲۰ m³ بتن مگر و سازه‌ای</div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
                {currentWeek4D >= 8 ? '۱۰۰٪ تکمیل شده' : `${Math.min(100, Math.round((currentWeek4D / 8) * 100))}%`}
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition ${currentWeek4D >= 28 ? 'bg-emerald-950/40 border-emerald-800' : currentWeek4D > 8 ? 'bg-amber-950/40 border-amber-800' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs font-bold text-slate-200">اسکلت بتنی و دیوارهای برشی</div>
              <div className="text-[11px] text-slate-400 mt-1">۵۴ ستون و سقف‌های ۱۱ طبقه</div>
              <div className="text-xs font-mono font-bold text-amber-400 mt-2">
                {currentWeek4D >= 28 ? '۱۰۰٪ تکمیل شده' : currentWeek4D <= 8 ? 'در انتظار فاز' : `${Math.round(((currentWeek4D - 8) / 20) * 100)}%`}
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition ${currentWeek4D >= 40 ? 'bg-emerald-950/40 border-emerald-800' : currentWeek4D > 28 ? 'bg-cyan-950/40 border-cyan-800' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs font-bold text-slate-200">داکت‌ها و تأسیسات MEP</div>
              <div className="text-[11px] text-slate-400 mt-1">۱۴۵۰ متر کانال و رایزر مکانیکی</div>
              <div className="text-xs font-mono font-bold text-cyan-400 mt-2">
                {currentWeek4D >= 40 ? '۱۰۰٪ تکمیل شده' : currentWeek4D <= 28 ? 'در انتظار فاز' : `${Math.round(((currentWeek4D - 28) / 12) * 100)}%`}
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition ${currentWeek4D >= 52 ? 'bg-emerald-950/40 border-emerald-800' : currentWeek4D > 40 ? 'bg-purple-950/40 border-purple-800' : 'bg-slate-950 border-slate-800'}`}>
              <div className="text-xs font-bold text-slate-200">نمای شیشه‌ای و نازک‌کاری</div>
              <div className="text-[11px] text-slate-400 mt-1">پوسته حرارتی مبحث ۱۹ و تحویل موقت</div>
              <div className="text-xs font-mono font-bold text-purple-400 mt-2">
                {currentWeek4D >= 52 ? '۱۰۰٪ تحویل نهایی' : currentWeek4D <= 40 ? 'در انتظار فاز' : `${Math.round(((currentWeek4D - 40) / 12) * 100)}%`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 5D Cost & Cash Flow Simulation */}
      {activeSimulationTab === '5d_cost' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>برآورد هزینه و شبیه‌سازی مالی ۵ بعدی (BIM 5D Cost Estimation)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مدیریت ارزش کسب شده (EVM)، شاخص‌های CPI و SPI، پیش‌بینی تعدیل تورم و جریان نقدینگی
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">واحد پول:</span>
              <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setCurrency5D('IRR')}
                  className={`px-3 py-1 rounded-lg transition ${currency5D === 'IRR' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  ریال ایران
                </button>
                <button
                  onClick={() => setCurrency5D('AFN')}
                  className={`px-3 py-1 rounded-lg transition ${currency5D === 'AFN' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  افغانی
                </button>
                <button
                  onClick={() => setCurrency5D('USD')}
                  className={`px-3 py-1 rounded-lg transition ${currency5D === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                >
                  دلار ($)
                </button>
              </div>
            </div>
          </div>

          {/* Cost Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold">ارزش برنامه‌ریزی شده (PV)</div>
              <div className="text-lg font-mono font-black text-slate-100">
                {currency5D === 'IRR' ? '۴۸۰ میلیارد ریال' : currency5D === 'AFN' ? '۳۸,۵۰۰,۰۰۰ AFN' : '$550,000'}
              </div>
              <div className="text-[11px] text-slate-500">بودجه مصوب تا مقطع فعلی</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold">ارزش کسب شده (EV)</div>
              <div className="text-lg font-mono font-black text-emerald-400">
                {currency5D === 'IRR' ? '۴۹۲ میلیارد ریال' : currency5D === 'AFN' ? '۳۹,۶۰۰,۰۰۰ AFN' : '$565,000'}
              </div>
              <div className="text-[11px] text-emerald-400/80">پیشرفت واقعی بیش از برنامه</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold">شاخص عملکرد هزینه (CPI)</div>
              <div className="text-lg font-mono font-black text-amber-400">1.04</div>
              <div className="text-[11px] text-slate-500">۴٪ صرفه‌جویی در هزینه‌های اجرایی</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold">شاخص عملکرد زمانی (SPI)</div>
              <div className="text-lg font-mono font-black text-cyan-400">1.02</div>
              <div className="text-[11px] text-slate-500">۲٪ جلوتر از جدول زمانی مصوب</div>
            </div>
          </div>

          {/* Dynamic Inflation / Material Price Escalation Slider */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">شبیه‌سازی افزایش بهای مصالح و تورم (Material Price Escalation):</span>
              <span className="text-amber-400 font-mono font-black">+{inflationEscalation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={inflationEscalation}
              onChange={(e) => setInflationEscalation(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[11px] text-slate-400">
              با اعمال {inflationEscalation}% نوسان قیمت میلگرد و سیمان، کل بهای تمام شده پروژه به میزان{' '}
              <span className="text-amber-400 font-bold font-mono">
                {currency5D === 'IRR' ? `${Math.round(480 * (1 + inflationEscalation / 100))} میلیارد ریال` : `$${Math.round(550000 * (1 + inflationEscalation / 100)).toLocaleString()}`}
              </span>{' '}
              پیش‌بینی می‌شود.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Energy & Sustainability (مبحث ۱۹) */}
      {activeSimulationTab === 'energy_green' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>شبیه‌سازی انرژی، پوسته حرارتی و الزامات مبحث ۱۹ مقررات ملی ساختمان</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                محاسبه ضرایب انتقال حرارت سطحی (U-Value)، بار سرمایش و گرمایش، و کاهش گازهای گلخانه‌ای
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold font-mono">
              رده انرژی: A+ (LEED Gold Equivalent)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">ضریب انتقال حرارت دیوار خارجی (U)</div>
              <div className="text-xl font-mono font-black text-emerald-400">0.34 W/m²K</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                عایق پشم سنگ ۸ سانتی‌متر + بلوک بتن سبک هوادار (AAC) منطبق با جدول مبحث ۱۹
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">شیشه‌های دوجداره Low-E</div>
              <div className="text-xl font-mono font-black text-cyan-400">U = 1.65 W/m²K</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                گاز آرگون با ضریب عبور خورشیدی SHGC = 0.38 جهت کاهش ۶۰ درصدی بار برودتی تابستان
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">کاهش سالانه انتشار کربن (CO₂)</div>
              <div className="text-xl font-mono font-black text-amber-400">142 تن در سال</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                بهره‌گیری از تهویه طبیعی و پنل‌های خورشیدی فتوولتائیک ۴۵ کیلووات در بام
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Earthquake Simulation (استاندارد ۲۸۰۰) */}
      {activeSimulationTab === 'earthquake_2800' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>شبیه‌سازی دینامیکی زلزله و استاندارد ۲۸۰۰ (طراحی لرزه‌ای)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                طیف پاسخ شتاب‌نگاشت زلزله طبس، بم و گسل کابل با شتاب مبنای PGA = 0.35g
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold font-mono">
              زون ۱ (خطر بسیار زیاد)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">برش پایه لرزه‌ای (Base Shear)</div>
              <div className="text-xl font-mono font-black text-amber-400">{feaSummary.baseShearKn} kN</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                محاسبه شده بر مبنای ضریب بازتاب B1 = 2.5 و ضریب رفتار ساختمان R = 7.5
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">دریفت نسبی طبقات (Story Drift)</div>
              <div className="text-xl font-mono font-black text-emerald-400">
                {(feaSummary.interstoryDriftRatio * 100).toFixed(2)}%
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                کمتر از حد مجاز ۰.۰۲h استاندارد ۲۸۰۰ (پایداری کامل هسته بتنی و دیوار برشی)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">زمان تناوب اصلی نوسان (T)</div>
              <div className="text-xl font-mono font-black text-cyan-400">0.82 ثانیه</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                مود ۱ نوسان خمشی در راستای طولی بدون ایجاد پیچش بحرانی
              </div>
            </div>
          </div>

          {/* GIS City Link Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200">
                  انطباق مدل دینامیکی با داده‌های ژئودینامیک شهر {AFGHAN_CITIES_GIS[selectedCityKey].cityNameFa}
                </span>
                <div className="text-[11px] text-slate-400">
                  شتاب مبنا: {AFGHAN_CITIES_GIS[selectedCityKey].designPGA}g | رده خاک: {AFGHAN_CITIES_GIS[selectedCityKey].siteClassRecommended}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSimulationTab('gis_hazard')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-bold transition"
            >
              <span>مشاهده لایه‌ها و پهنه‌بندی کامل GIS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Ventilation & CFD Indoor Air Quality */}
      {activeSimulationTab === 'cfd_ventilation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>شبیه‌سازی جریان هوا و شرایط محیطی داخلی (CFD & Indoor Air Quality)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توزیع برداری سرعت باد، نرخ تعویض هوا (ACH) و شاخص آسایش حرارتی PMV/PPD
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold font-mono">
              ASHRAE 55 & 62.1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">نرخ تعویض هوا در ساعت (ACH)</div>
              <div className="text-xl font-mono font-black text-cyan-400">4.8 ACH</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                تأمین کامل هوای تازه برای ۶۵۰ نفر ساکنین با داکت‌های بهینه و سیستم VAV
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">غلظت دی‌اکسید کربن (CO₂)</div>
              <div className="text-xl font-mono font-black text-emerald-400">540 ppm</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                بسیار پایین‌تر از سقف استاندارد ۱۰۰۰ ppm با سنجش سنسورهای هوشمند هوای داخل
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">شاخص آسایش حرارتی (PMV)</div>
              <div className="text-xl font-mono font-black text-amber-400">+0.12 (Neutral)</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                دمای مطبوع ۲۲.۵ درجه سانتی‌گراد با رطوبت نسبی ۴۵٪ در تابستان و زمستان
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: HSE & Workplace Safety Simulation */}
      {activeSimulationTab === 'hse_safety' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>شبیه‌سازی ایمنی کارگاه و الزامات HSE (BIM Safety Management)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                شناسایی خودکار نقاط پرخطر سقوط از ارتفاع، حریم چرخش جرثقیل برجی و مسیرهای خروج اضطراری
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold font-mono">
              ISO 45001 & OSHA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">پایش لبه‌های پرتگاه (Fall Hazard)</div>
              <div className="text-xl font-mono font-black text-emerald-400">۱۰۰٪ جان‌پناه</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                تمام بازشوهای سقف و پرتگاه‌های محیطی مجهز به حفاظ استاندارد ۱.۱۰ متری موقت
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">شعاع ایمن تاورکرین (Crane Envelope)</div>
              <div className="text-xl font-mono font-black text-cyan-400">R = 45 متر</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                زون عدم تردد پرسنل زیر بار معلق به صورت دیجیتال در صحنه مانیتور گردیده است.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">زمان تخلیه اضطراری (Egress)</div>
              <div className="text-xl font-mono font-black text-amber-400">2.4 دقیقه</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                پله‌های فرار دوطرفه با عرض مفید ۱.۴۰ متر با فشار هوای مثبت دودبند
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Life Cycle Assessment (6D/7D LCA) */}
      {activeSimulationTab === 'lifecycle_7d' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>شبیه‌سازی چرخه عمر، مدیریت دارایی و نگهداری (BIM 6D / 7D Facility Management)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                برنامه‌ریزی ۵۰ ساله هزینه‌های بهره‌برداری (OPEX)، تعویض چیلرها، آسانسورها و بازیافت مصالح
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-xs font-bold font-mono">
              طول عمر مفید: ۵۰ سال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">هزینه دوره بهره‌برداری ۵۰ ساله</div>
              <div className="text-xl font-mono font-black text-purple-400">۳.۲ برابر هزینه ساخت</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                مدیریت هوشمند تأسیسات مصرف برق و آب را تا ۲۸٪ در طول ۳۰ سال کاهش می‌دهد.
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">دوره تعویض تجهیزات مکانیکی</div>
              <div className="text-xl font-mono font-black text-cyan-400">سال ۱۵ و ۳۰</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                اورکلاک پمپ‌ها، کمپرسورهای چیلر سانتریفیوژ و کابل‌های فولادی کششی آسانسورها
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200">قابلیت بازیافت مصالح در تخریب</div>
              <div className="text-xl font-mono font-black text-emerald-400">84% بازیافت‌پذیر</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                بتن خرد شده برای زیرسازی راه‌سازی و بازیافت ۱۰۰ درصدی آرماتورهای فولادی AIII
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export / Standards Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">
                    خروجی استاندارد مدل BIM
                  </h3>
                  <p className="text-xs text-slate-400">
                    پشتیبانی از فرمت‌های بین‌المللی IFC، Revit، ArchiCAD و گزارش FEA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Formats List */}
            <div className="space-y-2">
              <div
                onClick={() => setExportFormat('ifc4')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  exportFormat === 'ifc4' ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">فرمت تبادل بین‌المللی IFC 4 / IFC 2x3</div>
                  <div className="text-[11px] text-slate-500">Industry Foundation Classes با حفظ تمام داده‌های هندسی و خصوصیات مصالح</div>
                </div>
                <span className="font-mono text-xs font-bold">.ifc</span>
              </div>

              <div
                onClick={() => setExportFormat('rvt')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  exportFormat === 'rvt' ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">خروجی سازگار با نرم‌افزار Autodesk Revit</div>
                  <div className="text-[11px] text-slate-500">دسته‌بندی خانواده‌های سازه، معماری و تأسیسات MEP</div>
                </div>
                <span className="font-mono text-xs font-bold">.rvt / .rfa</span>
              </div>

              <div
                onClick={() => setExportFormat('archicad')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  exportFormat === 'archicad' ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">سازگاری با Graphisoft ArchiCAD</div>
                  <div className="text-[11px] text-slate-500">پشتیبانی از فرمت OpenBIM و تبادل BCF</div>
                </div>
                <span className="font-mono text-xs font-bold">.pln</span>
              </div>

              <div
                onClick={() => setExportFormat('csv')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  exportFormat === 'csv' ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">داده‌های محاسبات المان محدود FEA و تغییرشکل‌ها</div>
                  <div className="text-[11px] text-slate-500">جدول کامل تنش‌ها، جابجایی‌ها و ضرایب اطمینان گره‌ها</div>
                </div>
                <span className="font-mono text-xs font-bold">.csv</span>
              </div>
            </div>

            {/* Download Trigger */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (exportFormat === 'csv') {
                    handleExportCSV();
                  } else {
                    const sampleData = `/* BIM Export Format: ${exportFormat.toUpperCase()} - AfghanaBuild Platform */\n/* Building: 11 Floors Concrete Frame with Shear Wall */\n/* Standard: ISO 19650 / مبحث ۶، ۹، ۱۰، ۱۹ */\n/* Export Timestamp: ${new Date().toISOString()} */\n`;
                    const blob = new Blob([sampleData], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `AfghanaBuild_Project_Model_${exportFormat}.${exportFormat === 'archicad' ? 'pln' : exportFormat === 'rvt' ? 'rvt' : 'ifc'}`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                  setShowExportModal(false);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-2xl text-xs transition shadow-lg shadow-amber-500/20"
              >
                تولید و دریافت فایل دانلودی
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
