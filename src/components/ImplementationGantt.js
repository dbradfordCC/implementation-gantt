import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, CardContent, CardHeader,
  Typography, Button, Slider, 
  TextField, Box, Grid, Paper,
  RadioGroup, Radio, FormControlLabel
} from '@mui/material';
import { Download } from 'lucide-react';

const ImplementationGantt = () => {
  // Color scheme based on provided brand colors
  const colors = {
    primary: '#254677',      // Dark blue
    primaryLight: '#55BAEA', // Light blue
    secondary: '#E6E651',    // Yellow
    secondaryAlt: '#822275', // Purple
    primaryDark: '#1a325a',  // Darker blue variation
    primaryLighter: '#7dcbf2', // Lighter blue variation
    secondaryDark: '#baba41', // Darker yellow variation
    secondaryAltLight: '#a22f91', // Lighter purple variation
    dark: '#333333',         // Dark gray for text
    white: '#FFFFFF',        // White
    lightGray: '#F5F5F5'     // Light gray for backgrounds
  };
  
  // Refs for scaling chart and drag operations
  const ganttContainerRef = useRef(null);
  const ganttContentRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    isResizing: false,
    dragType: null, // 'move' or 'resize'
    taskId: null,
    startX: 0,
    startY: 0,
    originalStart: 0,
    originalDuration: 0,
    originalPhase: null,
    weekWidth: 0
  });
  
  // State variables
  const [employeeCount, setEmployeeCount] = useState(200);
  const [companyName, setCompanyName] = useState('');
  const [tierInfo, setTierInfo] = useState({
    tier: 'Small Biz',
    package: 'ClearCare Pro',
    moduleCheckIns: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState('ClearRecruit');
  const [totalTaskWidth, setTotalTaskWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPhase, setDragPhase] = useState(null);

  // Define product mixes and their modules
  const productMixes = {
    'ClearRecruit (ATS Only)': {
      name: 'ClearRecruit (ATS Only)',
      modules: ['Recruiting'],
      moduleCount: 1,
      hasIntegration: true
    },
    ClearRecruit: {
      name: 'ClearRecruit',
      modules: ['Recruiting', 'Onboarding'],
      moduleCount: 2
    },
    ClearTalent: {
      name: 'ClearTalent',
      modules: ['Recruiting', 'Onboarding', 'LMS'],
      moduleCount: 3
    },
    TotalTalent: {
      name: 'TotalTalent',
      modules: ['Recruiting', 'Onboarding', 'LMS', 'Performance/Goals/Engagement'],
      moduleCount: 4
    },
    ClearLearn: {
      name: 'ClearLearn',
      modules: ['LMS'],
      moduleCount: 1
    },
    ClearGrow: {
      name: 'ClearGrow',
      modules: ['LMS', 'Performance/Goals/Engagement'],
      moduleCount: 2
    }
  };

  // Function to adjust gantt scale to fit container
  const adjustGanttScale = useCallback(() => {
    if (!ganttContainerRef.current || !ganttContentRef.current) return;
    
    const containerWidth = ganttContainerRef.current.clientWidth;
    const contentWidth = ganttContentRef.current.scrollWidth;
    
    if (contentWidth > containerWidth) {
      // Calculate scale to fit width
      const scaleWidth = containerWidth / contentWidth;
      
      // Get content height and visible container height
      const contentHeight = ganttContentRef.current.scrollHeight;
      const containerHeight = window.innerHeight * 0.7; // Use 70% of viewport height as max
      
      // Determine if we need to scale for height as well
      const scaleHeight = containerHeight / contentHeight;
      
      // Use the smaller scale to ensure everything fits
      const scale = Math.min(scaleWidth, scaleHeight, 1); // Never scale up
      
      // Apply the scale
      ganttContentRef.current.style.transform = `scale(${scale})`;
      ganttContentRef.current.style.transformOrigin = 'left top';
      
      // Set container height to show all content without scrolling
      const newHeight = Math.min(contentHeight * scale, containerHeight);
      ganttContainerRef.current.style.height = `${newHeight}px`;
    } else {
      ganttContentRef.current.style.transform = 'none';
      ganttContainerRef.current.style.height = 'auto';
    }
  }, []);

  // Effect to handle scaling the gantt chart to fit the container
  useEffect(() => {
    if (ganttContainerRef.current && ganttContentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        adjustGanttScale();
      });
      
      resizeObserver.observe(ganttContainerRef.current);
      adjustGanttScale();
      
      // Also adjust when window is resized
      const handleResize = () => {
        adjustGanttScale();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Initial adjustment with a slight delay to ensure everything is rendered
      setTimeout(() => {
        adjustGanttScale();
      }, 100);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [adjustGanttScale]);

  // Calculate content area width after initial render
  useEffect(() => {
    if (ganttContainerRef.current) {
      const calculateTaskAreaWidth = () => {
        const containerWidth = ganttContainerRef.current.clientWidth;
        // Subtract the width of the task name column (260px)
        const availableWidth = containerWidth - 260;
        setTotalTaskWidth(availableWidth);
      };

      calculateTaskAreaWidth();
      window.addEventListener('resize', calculateTaskAreaWidth);
      
      return () => {
        window.removeEventListener('resize', calculateTaskAreaWidth);
      };
    }
  }, []);

  // Add specialized print styles
  useEffect(() => {
    // Create a style element for print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: 11in 8.5in landscape;
          margin: 0in !important;
        }
        
        button, .no-print, .drag-grid, .phase-boundary { 
          display: none !important; 
        }
        
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          width: 100%;
          max-width: 100%;
          overflow-x: visible !important;
        }
        
        #config-card {
          margin: 0;
          padding: 0;
          max-height: 8in;
          overflow: hidden;
        }
        
        #gantt-chart-container {
          margin: 0;
          padding: 0;
          max-height: 8in;
          overflow: hidden;
          width: 100vw !important;
          max-width: 100vw !important;
        }
        
        .MuiCardContent-root {
          padding: 8px 4px !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .MuiCardHeader-root {
          padding: 8px 4px !important;
        }
        
        #gantt-content-wrapper {
          transform: scale(0.9) !important;
          transform-origin: left top !important;
          width: 100vw !important;
          max-width: 100vw !important;
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
        
        .phase-header-bg {
          width: 100vw !important;
          max-width: 100vw !important;
          left: 0 !important;
          right: 0 !important;
        }
        
        .task-name-column {
          width: 200px !important;
        }
        
        .task-bar-container {
          width: calc(100% - 200px) !important;
          padding-right: 0 !important;
        }
        
        .resize-handle {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [companyName]);

  // Calculate tier based on employee count
  useEffect(() => {
    let tier, packageName, checkIns;
    
    if (employeeCount <= 200) {
      tier = 'Small Biz';
      packageName = 'ClearCare Pro';
      checkIns = 0;
    } else if (employeeCount <= 1000) {
      tier = 'Mid Market';
      packageName = 'ClearCare Advanced';
      checkIns = 4;
    } else {
      tier = 'Enterprise';
      packageName = 'ClearCare Max';
      checkIns = 6;
    }
    
    setTierInfo({
      tier,
      package: packageName,
      moduleCheckIns: checkIns,
    });
  }, [employeeCount]);

  // Calculate timeline based on employee count, tier, and product mix
  const baseTimeline = useMemo(() => {
    const selectedProductInfo = productMixes[selectedProduct];
    const modules = selectedProductInfo.modules;
    
    // Check if Onboarding is included in the selected product
    const hasOnboarding = modules.includes('Onboarding');
    
    // Check if this product has integration (for ClearRecruit ATS Only)
    const hasIntegration = selectedProductInfo.hasIntegration;
    
    // Get the service package
    const servicePackage = tierInfo.package;
    
    // For ClearCare Pro (self-paced implementation)
    if (servicePackage === 'ClearCare Pro') {
      let tasks = [];
      
      // Initiation & Planning Phase - just optional setup assistance
      tasks.push({
        id: 'optional-setup',
        name: 'Optional ClearCompany Setup Assistance',
        phase: 'Initiation & Planning',
        start: 0,
        duration: 2,
        color: colors.primaryDark,
        isSelfPaced: false
      });
      
      // Execution Phase - all modules with implementation, setup, learning, testing
      const moduleTypes = ['Recruiting', 'Onboarding', 'LMS', 'Performance/Goals/Engagement'];
      
      for (const moduleType of moduleTypes) {
        // Only include modules that are part of the selected product
        if (modules.includes(moduleType)) {
          tasks.push({
            id: `${moduleType.toLowerCase()}-implementation`,
            name: `${moduleType} Implementation`,
            phase: 'Execution',
            start: 0,
            duration: 1, // Not relevant for self-paced
            color: colors.primaryDark,
            isSelfPaced: true,
            selfPacedLabel: 'Variable - Client Self-Paced'
          });
          
          // Add sub-tasks
          tasks.push({
            id: `${moduleType.toLowerCase()}-setup`,
            name: 'Setup',
            phase: 'Execution',
            start: 0,
            duration: 1, // Not relevant for self-paced
            color: colors.secondaryAlt, // Purple
            isSelfPaced: true,
            selfPacedLabel: 'Variable - Client Self-Paced'
          });
          
          tasks.push({
            id: `${moduleType.toLowerCase()}-learning`,
            name: 'Learning',
            phase: 'Execution',
            start: 0,
            duration: 1, // Not relevant for self-paced
            color: colors.secondaryDark, // Dark yellow
            isSelfPaced: true,
            selfPacedLabel: 'Variable - Client Self-Paced'
          });
          
          tasks.push({
            id: `${moduleType.toLowerCase()}-testing`,
            name: 'Testing',
            phase: 'Execution',
            start: 0,
            duration: 1, // Not relevant for self-paced
            color: colors.primaryLight, // Light blue
            isSelfPaced: true,
            selfPacedLabel: 'Variable - Client Self-Paced'
          });
        }
      }
      
      // Launch Phase - just Go Live
      tasks.push({
        id: 'golive',
        name: 'Go Live',
        phase: 'Launch',
        start: 0,
        duration: 1, // Not relevant for self-paced
        color: colors.secondaryAlt,
        isSelfPaced: true,
        selfPacedLabel: 'Variable - Client Self-Paced'
      });
      
      return tasks;
    }
    
    // For ClearCare Advanced and Max
    let tasks = [];
    let currentWeek = 0;
    
    // Determine module duration based on service package and employee count
    let moduleDuration, setupDuration, learningDuration, testingDuration, integrationDuration, dataImportDuration;
    let rolloutTrainingDuration = 2; // Default
    let goLiveDuration = 1; // Default
    
    if (servicePackage === 'ClearCare Advanced') {
      if (employeeCount <= 600) {
        moduleDuration = 5;
        setupDuration = 2;
        learningDuration = 3;
        testingDuration = 3; // Reduced since no dependency
        integrationDuration = 4;
        dataImportDuration = 4;
      } else { // 600-1000
        moduleDuration = 7;
        setupDuration = 2;
        learningDuration = 3;
        testingDuration = 3; // Reduced since no dependency
        integrationDuration = 4;
        dataImportDuration = 4;
      }
    } else { // ClearCare Max
      if (employeeCount <= 2500) {
        moduleDuration = 9;
        setupDuration = 3;
        learningDuration = 4;
        testingDuration = 4; // Reduced since no dependency
        integrationDuration = 5;
        dataImportDuration = 4;
        rolloutTrainingDuration = 3; // Extended for Max
        goLiveDuration = 2; // Extended for Max
      } else { // 2500-4500+
        moduleDuration = 11;
        setupDuration = 3;
        learningDuration = 5;
        testingDuration = 5; // Reduced since no dependency
        integrationDuration = 5;
        dataImportDuration = 5;
        rolloutTrainingDuration = 3; // Extended for Max
        goLiveDuration = 2; // Extended for Max
      }
    }
    
    // Initiation & Planning Phase
    tasks.push({
      id: 'kickoff',
      name: 'Project Kickoff',
      phase: 'Initiation & Planning',
      start: 0,
      duration: 1,
      color: colors.primaryDark,
    });
    
    tasks.push({
      id: 'requirements',
      name: 'Requirements Gathering',
      phase: 'Initiation & Planning',
      start: 1,
      duration: 2,
      color: colors.primaryLighter
    });
    
    currentWeek = 3; // Start execution after initiation
    
    // Execution Phase - add modules from the selected product
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i];
      
      // Module implementation
      tasks.push({
        id: `${moduleName.toLowerCase()}-implementation`,
        name: `${moduleName} Implementation`,
        phase: 'Execution',
        start: currentWeek,
        duration: moduleDuration,
        color: colors.primaryDark
      });
      
      // Module setup 
      tasks.push({
        id: `${moduleName.toLowerCase()}-setup`,
        name: 'Setup',
        phase: 'Execution',
        start: currentWeek,
        duration: setupDuration,
        color: colors.secondaryAlt // Purple
      });
      
      // Module learning 
      tasks.push({
        id: `${moduleName.toLowerCase()}-learning`,
        name: 'Learning',
        phase: 'Execution',
        start: currentWeek,
        duration: learningDuration,
        color: colors.secondaryDark // Dark yellow
      });
      
      // Module testing 
      tasks.push({
        id: `${moduleName.toLowerCase()}-testing`,
        name: 'Testing',
        phase: 'Execution',
        start: currentWeek + 2, // Start a bit later
        duration: testingDuration,
        color: colors.primaryLight // Light blue
      });
      
      // Add historical data import for Recruiting module only
      if (moduleName === 'Recruiting') {
        tasks.push({
          id: 'historical-data-import',
          name: 'Historical Data Import',
          phase: 'Execution',
          start: currentWeek + 1,
          duration: dataImportDuration,
          color: colors.secondaryAltLight // Lighter purple
        });
        
        // Add integration for ClearRecruit (ATS Only) only
        if (hasIntegration) {
          tasks.push({
            id: 'recruiting-integration',
            name: 'Integration',
            phase: 'Execution',
            start: currentWeek + 2,
            duration: integrationDuration,
            color: colors.primaryDark // Same color as Recruiting Implementation
          });
        }
      }
      
      // Add integration for Onboarding module only
      if (moduleName === 'Onboarding') {
        tasks.push({
          id: 'onboarding-integration',
          name: 'Integration',
          phase: 'Execution',
          start: currentWeek + 2,
          duration: integrationDuration,
          color: colors.secondaryAltLight // Lighter purple
        });
      }
      
      // Move to next module with some spacing
      currentWeek += Math.max(moduleDuration + 2, 8);
    }
    
    // Launch Phase
    tasks.push({
      id: 'rollout-training',
      name: 'Rollout Training',
      phase: 'Launch',
      start: currentWeek,
      duration: rolloutTrainingDuration,
      color: colors.secondary // yellow
    });
    
    tasks.push({
      id: 'golive',
      name: 'Go Live',
      phase: 'Launch',
      start: currentWeek + rolloutTrainingDuration,
      duration: goLiveDuration,
      color: colors.secondaryAlt // purple
    });
    
    return tasks;
  }, [
    employeeCount, 
    selectedProduct, 
    tierInfo.package,
    colors.primaryDark, 
    colors.primaryLight, 
    colors.primaryLighter, 
    colors.secondary, 
    colors.secondaryAlt, 
    colors.secondaryAltLight, 
    colors.secondaryDark, 
    productMixes
  ]);

  // State for managing timeline updates from drag operations
  const [timelineState, setTimelineState] = useState(baseTimeline);

  // Update timeline state when base timeline changes
  useEffect(() => {
    setTimelineState(baseTimeline);
  }, [baseTimeline]);

  // Helper function to snap to week grid
  const snapToWeek = useCallback((value) => {
    return Math.round(value);
  }, []);

  // Helper function to get phase boundaries
  const getPhaseY = useCallback((phase) => {
    const phaseElement = document.querySelector(`[data-phase="${phase}"]`);
    if (phaseElement) {
      const rect = phaseElement.getBoundingClientRect();
      const containerRect = ganttContentRef.current?.getBoundingClientRect();
      if (containerRect) {
        return {
          top: rect.top - containerRect.top,
          bottom: rect.bottom - containerRect.top
        };
      }
    }
    return null;
  }, []);

  // Drag and drop handlers
  const handleMouseDown = useCallback((e, taskId, action) => {
    e.preventDefault();
    e.stopPropagation();
    
    const task = timelineState.find(t => t.id === taskId);
    
    // Don't allow dragging of self-paced tasks
    if (task && task.isSelfPaced) return;
    
    // Calculate the current total weeks for width calculations
    const maxWeek = Math.max(...timelineState.map(t => t.start + t.duration));
    const weekWidth = totalTaskWidth > 0 ? totalTaskWidth / Math.max(maxWeek, 20) : 40; // Ensure minimum grid
    
    dragState.current = {
      isDragging: true,
      isResizing: action === 'resize',
      dragType: action,
      taskId: taskId,
      startX: e.clientX,
      startY: e.clientY,
      originalStart: task.start,
      originalDuration: task.duration,
      originalPhase: task.phase,
      weekWidth: weekWidth
    };
    
    setIsDragging(true);
    setDragPhase(task.phase);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add visual feedback
    document.body.style.cursor = action === 'resize' ? 'ew-resize' : 'grabbing';
    document.body.style.userSelect = 'none';
  }, [timelineState, totalTaskWidth]);

  const handleMouseMove = useCallback((e) => {
    if (!dragState.current.isDragging) return;
    
    const { taskId, dragType, startX, startY, originalStart, originalDuration, originalPhase, weekWidth } = dragState.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    if (dragType === 'resize') {
      // Handle resizing - snap to whole weeks
      const deltaWeeks = deltaX / weekWidth;
      const newDuration = Math.max(1, snapToWeek(originalDuration + deltaWeeks)); // Minimum 1 week
      
      setTimelineState(prevTimeline => 
        prevTimeline.map(task => 
          task.id === taskId ? { ...task, duration: newDuration } : task
        )
      );
    } else if (dragType === 'move') {
      // Handle horizontal movement - snap to whole weeks
      const deltaWeeks = deltaX / weekWidth;
      const newStart = Math.max(0, snapToWeek(originalStart + deltaWeeks));
      
      // Check if we're trying to move to a different phase
      let targetPhase = originalPhase;
      const currentY = e.clientY;
      
      // Check phase boundaries
      ['Initiation & Planning', 'Execution', 'Launch'].forEach(phase => {
        const bounds = getPhaseY(phase);
        if (bounds && currentY >= bounds.top && currentY <= bounds.bottom) {
          targetPhase = phase;
        }
      });
      
      // Only allow movement within the same phase
      if (targetPhase === originalPhase) {
        setTimelineState(prevTimeline => 
          prevTimeline.map(task => 
            task.id === taskId ? { ...task, start: newStart } : task
          )
        );
      }
    }
  }, [snapToWeek, getPhaseY]);

  const handleMouseUp = useCallback(() => {
    if (dragState.current.isDragging) {
      dragState.current.isDragging = false;
      setIsDragging(false);
      setDragPhase(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [handleMouseMove]);

  // Function to handle PDF export
  const handleExportPDF = useCallback(() => {
    try {
      const ganttContent = ganttContentRef.current;
      let originalTransform = null;
      let originalWidth = null;
      let originalMaxWidth = null;
      
      if (ganttContent) {
        originalTransform = ganttContent.style.transform;
        originalWidth = ganttContent.style.width;
        originalMaxWidth = ganttContent.style.maxWidth;
      }
      
      document.body.classList.add('printing-pdf');
      window.print();
      
      setTimeout(() => {
        document.body.classList.remove('printing-pdf');
        
        if (ganttContent) {
          ganttContent.style.transform = originalTransform;
          ganttContent.style.width = originalWidth;
          ganttContent.style.maxWidth = originalMaxWidth;
        }
        
        adjustGanttScale();
      }, 500);
    } catch (error) {
      console.error('Error triggering print dialog:', error);
    }
  }, [adjustGanttScale]);

  // Calculate total implementation time based on actual task positions
  const totalWeeks = useMemo(() => {
    if (tierInfo.package === 'ClearCare Pro') {
      return 'Client Self Paced';
    }
    
    if (timelineState.length === 0) return 0;
    
    const earliestStart = Math.min(...timelineState.map(t => t.start));
    const latestEnd = Math.max(...timelineState.map(t => t.start + t.duration));
    
    return Math.ceil(latestEnd - earliestStart);
  }, [timelineState, tierInfo.package]);
  
  // For display purposes
  const timeDisplay = useMemo(() => {
    if (tierInfo.package === 'ClearCare Pro') {
      return "Client Self Paced - 2 Weeks of optional ClearCompany setup assistance provided at the start of the Project";
    }
    
    const weeks = totalWeeks;
    return `${weeks} weeks`;
  }, [totalWeeks, tierInfo.package]);

  // Format employee count for display
  const displayEmployeeCount = useMemo(() => {
    return employeeCount >= 4500 ? '4,500+' : employeeCount;
  }, [employeeCount]);

  // Calculate the maximum timeline for grid display
  const maxTimelineWeeks = useMemo(() => {
    if (timelineState.length === 0) return 20;
    return Math.max(...timelineState.map(t => t.start + t.duration)) + 5; // Add some padding
  }, [timelineState]);

  // Calculate the task width scaling factor
  const getTaskWidth = useCallback((taskDuration, isSelfPaced) => {
    if (isSelfPaced) {
      return '100%'; // Full width for self-paced tasks
    }
    
    const weekWidth = totalTaskWidth / maxTimelineWeeks;
    return `${taskDuration * weekWidth}px`;
  }, [maxTimelineWeeks, totalTaskWidth]);

  // Get task position
  const getTaskPosition = useCallback((taskStart, isSelfPaced) => {
    if (isSelfPaced) return 0;
    
    const weekWidth = totalTaskWidth / maxTimelineWeeks;
    return taskStart * weekWidth;
  }, [maxTimelineWeeks, totalTaskWidth]);

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    const grouped = {};
    const phases = ['Initiation & Planning', 'Execution', 'Launch'];
    
    phases.forEach(phase => {
      grouped[phase] = timelineState.filter(task => task.phase === phase);
    });
    
    return grouped;
  }, [timelineState]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: "'Open Sans', sans-serif", color: '#333333' }}>
      {/* Logo centered at the top */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
        <img 
          src="https://cc-client-cdn.clearcompany.com/7d1a23bb-d726-1404-8eb3-460472842d52/custom-files/409caa49-4479-275f-a9ce-2bb70eb9eb4d/ClearCompany_Main_Resized.png" 
          alt="ClearCompany Logo" 
          style={{ height: '50px' }}
        />
      </Box>
      
      <Card id="config-card" sx={{ pageBreakAfter: 'always' }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontFamily: "'Open Sans', sans-serif", color: colors.primary }}>
                Implementation Project Configuration
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Download size={16} />} 
                onClick={handleExportPDF}
                sx={{ backgroundColor: colors.primary }}
              >
                Export PDF
              </Button>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Company Name
              </Typography>
              <TextField
                fullWidth
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Employee Count: {displayEmployeeCount}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ width: '100px' }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Slider
                    min={1}
                    max={4500}
                    value={employeeCount}
                    onChange={(_, value) => setEmployeeCount(value)}
                  />
                </Box>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Tier
                </Typography>
                <Typography variant="h6">
                  {tierInfo.tier}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Package
                </Typography>
                <Typography variant="h6">
                  {tierInfo.package}
                </Typography>
              </Grid>
            </Grid>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Product Selection
              </Typography>
              <RadioGroup
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <Grid container spacing={1}>
                  {Object.keys(productMixes).map(product => (
                    <Grid item xs={6} sm={4} key={product}>
                      <Paper 
                        sx={{ 
                          p: 1, 
                          border: '1px solid',
                          borderColor: selectedProduct === product ? '#254677' : '#e0e0e0',
                          backgroundColor: selectedProduct === product ? '#e3f2fd' : 'white',
                          '&:hover': { cursor: 'pointer' }
                        }}
                        onClick={() => setSelectedProduct(product)}
                      >
                        <FormControlLabel 
                          value={product} 
                          control={<Radio />} 
                          label={product} 
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selected Product Modules
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {productMixes[selectedProduct].modules.map(module => (
                  <Box 
                    key={module} 
                    sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: '#254677', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 10,
                      fontSize: '0.875rem'
                    }}
                  >
                    {module}
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                Estimated Timeline:
              </Typography>
              <Typography variant="h6">
                {timeDisplay}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      <Card id="gantt-chart-container" sx={{ pageBreakBefore: 'always' }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontFamily: "'Open Sans', sans-serif", color: colors.primary }}>
                Implementation Gantt Chart
              </Typography>
              <Typography variant="body2" sx={{ color: colors.dark, fontStyle: 'italic' }}>
                {tierInfo.package !== 'ClearCare Pro' ? 'Drag tasks to adjust timing and order. Tasks snap to weekly grids and stay within phases.' : 'Self-paced implementation - no drag functionality'}
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box 
            ref={ganttContainerRef} 
            sx={{ 
              overflowX: 'hidden', 
              overflowY: 'hidden', 
              pb: 3,
              width: '100%', 
              position: 'relative',
              '@media print': {
                width: '100vw',
                maxWidth: '100vw',
                margin: 0,
                padding: 0,
                overflow: 'visible'
              }
            }}
          >
            {/* Week Grid Lines - only visible during dragging */}
            {isDragging && (
              <Box 
                className="drag-grid"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 260, // Start after task name column
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              >
                {Array.from({ length: maxTimelineWeeks }, (_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      left: `${(i / maxTimelineWeeks) * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: 'rgba(37, 70, 119, 0.3)',
                      borderLeft: i % 5 === 0 ? '2px solid rgba(37, 70, 119, 0.5)' : '1px solid rgba(37, 70, 119, 0.2)'
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Phase Boundaries - only visible during dragging */}
            {isDragging && (
              <>
                {['Initiation & Planning', 'Execution', 'Launch'].map(phase => (
                  <Box
                    key={phase}
                    className="phase-boundary"
                    data-phase={phase}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: dragPhase === phase ? 'rgba(130, 34, 117, 0.8)' : 'rgba(37, 70, 119, 0.5)',
                      zIndex: 15,
                      pointerEvents: 'none'
                    }}
                  />
                ))}
              </>
            )}
            
            <Box 
              ref={ganttContentRef} 
              id="gantt-content-wrapper"
              sx={{ 
                position: 'relative', 
                minWidth: '700px', 
                transform: 'scale(1)',
                transformOrigin: 'left top',
                width: '100%',
                paddingRight: '50px',
                '@media print': { 
                  width: '100vw !important',
                  maxWidth: '100vw !important',
                  transform: 'scale(0.9) !important',
                  transformOrigin: 'left top !important',
                  paddingRight: '0'
                }
              }}
            >
              {/* Group by phase */}
              {['Initiation & Planning', 'Execution', 'Launch'].map(phase => {
                const phaseTasks = tasksByPhase[phase];
                
                if (phaseTasks.length === 0) return null;
                
                return (
                  <Box key={phase} data-phase={phase} sx={{ position: 'relative', mb: 3 }}>
                    {/* Phase header background that spans full width */}
                    <Box 
                      className="phase-header-bg"
                      sx={{ 
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        width: '100%',
                        height: '48px',
                        backgroundColor: colors.lightGray,
                        zIndex: 1,
                        '@media print': {
                          width: '100vw !important',
                          maxWidth: '100vw !important',
                          left: 0,
                          right: 0
                        }
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        position: 'relative',
                        display: 'flex',
                        py: 1.5,
                        mb: 1,
                        zIndex: 10,
                      }}
                    >
                      <Box sx={{ 
                        width: '260px',
                        fontWeight: 'bold',
                        px: 1,
                        zIndex: 10,
                        color: colors.dark,
                        '@media print': {
                          width: '200px !important'
                        }
                      }}>
                        {phase}
                      </Box>
                    </Box>
                    
                    {/* Task container with stacking support */}
                    <Box sx={{ position: 'relative', minHeight: `${phaseTasks.length * 48}px` }}>
                      {phaseTasks.map((task, index) => {
                        // Determine if we should use a dotted border for self-paced tasks
                        const borderStyle = task.isSelfPaced ? 'dashed' : 'solid';
                        
                        // Calculate dynamic task width and position
                        const taskWidth = getTaskWidth(task.duration, task.isSelfPaced);
                        const taskLeft = getTaskPosition(task.start, task.isSelfPaced);
                        
                        // Determine what text to display inside the bar
                        const barText = task.isSelfPaced ? task.selfPacedLabel : `${task.duration}w`;
                                         
                        // For Pro package, use lighter fills with darker borders for all but setup
                        const isProPackage = tierInfo.package === 'ClearCare Pro';
                        const isSetupTask = task.name === 'Setup' || task.name === 'Optional ClearCompany Setup Assistance';
                        
                        // Determine background and border colors
                        let backgroundColor = task.color;
                        let borderColor = `1px ${borderStyle} rgba(0,0,0,0.1)`;
                        
                        if (isProPackage && !isSetupTask && task.isSelfPaced) {
                          const lightColor = task.color === colors.primaryDark ? 'rgba(37, 70, 119, 0.15)' :
                                           task.color === colors.secondaryAlt ? 'rgba(130, 34, 117, 0.15)' :
                                           task.color === colors.secondaryDark ? 'rgba(230, 230, 81, 0.15)' :
                                           task.color === colors.primaryLight ? 'rgba(85, 186, 234, 0.15)' :
                                           'rgba(255, 255, 255, 0.15)';
                                           
                          backgroundColor = lightColor;
                          borderColor = `1px ${borderStyle} ${task.color}`;
                        }
                        
                        // Determine if task is draggable
                        const isDraggable = !task.isSelfPaced;
                        
                        return (
                          <Box 
                            key={task.id} 
                            sx={{ 
                              display: 'flex', 
                              mb: 1.5, 
                              alignItems: 'center', 
                              height: '32px',
                              position: 'relative'
                            }}
                          >
                            <Box 
                              className="task-name-column"
                              sx={{ 
                                position: 'sticky', 
                                left: 0, 
                                width: '260px',
                                backgroundColor: 'white', 
                                zIndex: 10, 
                                px: 1,
                                fontSize: '0.9rem',
                                overflow: 'visible',
                                whiteSpace: 'normal',
                                lineHeight: '1.2',
                                color: colors.dark,
                                '@media print': {
                                  width: '200px !important'
                                }
                              }}
                            >
                              {task.name}
                            </Box>
                            <Box 
                              className="task-bar-container"
                              sx={{ 
                                flexGrow: 1, 
                                position: 'relative', 
                                height: '32px',
                                zIndex: 5,
                                paddingRight: { xs: '40px', md: '60px' },
                                '@media print': {
                                  paddingRight: '0 !important',
                                  width: 'calc(100% - 200px) !important'
                                }
                              }}
                            >
                              <Box 
                                className="task-bar"
                                onMouseDown={isDraggable ? (e) => handleMouseDown(e, task.id, 'move') : undefined}
                                sx={{ 
                                  position: 'absolute', 
                                  borderRadius: '4px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  fontSize: '0.875rem',
                                  left: `${taskLeft}px`,
                                  width: taskWidth,
                                  backgroundColor: backgroundColor,
                                  height: '32px',
                                  color: (task.color === colors.secondary || task.color === colors.secondaryDark || 
                                         (isProPackage && !isSetupTask && task.isSelfPaced)) ? '#254677' : '#FFFFFF',
                                  border: borderColor,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: isDraggable ? 'grab' : 'default',
                                  userSelect: 'none',
                                  zIndex: isDragging && dragState.current.taskId === task.id ? 20 : 8,
                                  '&:hover': isDraggable ? {
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    transform: 'translateY(-1px)',
                                    zIndex: 15
                                  } : {},
                                  '&:active': isDraggable ? {
                                    cursor: 'grabbing'
                                  } : {}
                                }}
                              >
                                {barText}
                                
                                {/* Resize handle */}
                                {isDraggable && (
                                  <Box
                                    className="resize-handle"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      handleMouseDown(e, task.id, 'resize');
                                    }}
                                    sx={{
                                      position: 'absolute',
                                      right: '-3px',
                                      top: 0,
                                      bottom: 0,
                                      width: '10px',
                                      backgroundColor: 'transparent',
                                      cursor: 'ew-resize',
                                      borderRadius: '0 4px 4px 0',
                                      zIndex: 10,
                                      '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.3)'
                                      },
                                      '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        right: '2px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '3px',
                                        height: '60%',
                                        backgroundColor: 'rgba(255,255,255,0.6)',
                                        borderRadius: '1px'
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImplementationGantt;
            
            