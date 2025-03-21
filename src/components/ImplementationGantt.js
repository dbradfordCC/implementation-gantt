import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, CardContent, CardHeader,
  Typography, Button, Slider, 
  TextField, Box, Grid, Paper,
  RadioGroup, Radio, FormControlLabel
} from '@mui/material';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';

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
  
  // Refs for scaling chart
  const ganttContainerRef = useRef(null);
  const ganttContentRef = useRef(null);
  
  // State variables
  const [employeeCount, setEmployeeCount] = useState(200);
  const [companyName, setCompanyName] = useState('');
  const [tierInfo, setTierInfo] = useState({
    tier: 'Small Biz',
    package: 'ClearCare Pro',
    moduleCheckIns: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState('ClearRecruit');

  // Define product mixes and their modules
  const productMixes = {
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

  // Define base durations for different project phases in weeks
  const baseDurations = {
    initiation: {
      projectKickoff: 1,
      requirementsGathering: 1,
    },
    execution: {
      moduleDuration: 3, // Base duration per module in weeks
      integrationTime: 1.5, // Additional time for integrations (1.5 weeks)
    },
    launch: {
      goLive: 1,
    }
  };

  // Function to adjust gantt scale to fit container
  const adjustGanttScale = useCallback(() => {
    if (!ganttContainerRef.current || !ganttContentRef.current) return;
    
    const containerWidth = ganttContainerRef.current.clientWidth;
    const contentWidth = ganttContentRef.current.scrollWidth;
    
    // Only scale if content is wider than container
    if (contentWidth > containerWidth) {
      const scale = containerWidth / contentWidth;
      ganttContentRef.current.style.transform = `scale(${scale})`;
      ganttContentRef.current.style.transformOrigin = 'left top';
      // Adjust container height to account for scaling
      ganttContainerRef.current.style.height = `${ganttContentRef.current.scrollHeight * scale}px`;
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
      
      // Initial adjustment
      adjustGanttScale();
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [adjustGanttScale]);

  // Add specialized print styles
  useEffect(() => {
    // Create a style element for print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: 11in 8.5in landscape;
          margin: 0.25in;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
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
        }
        .MuiCardContent-root {
          padding: 10px !important;
        }
        .MuiCardHeader-root {
          padding: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
  const timeline = useMemo(() => {
    const selectedProductInfo = productMixes[selectedProduct];
    const modules = selectedProductInfo.modules;
    
    // Check if Onboarding is included in the selected product
    const hasOnboarding = modules.includes('Onboarding');
    
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
        testingDuration = 5; // Full module duration
        integrationDuration = 4;
        dataImportDuration = 4;
      } else { // 600-1000
        moduleDuration = 7;
        setupDuration = 2;
        learningDuration = 3;
        testingDuration = 7; // Full module duration
        integrationDuration = 4;
        dataImportDuration = 4;
      }
    } else { // ClearCare Max
      if (employeeCount <= 2500) {
        moduleDuration = 9;
        setupDuration = 3;
        learningDuration = 4;
        testingDuration = 9; // Full module duration
        integrationDuration = 5;
        dataImportDuration = 4;
        rolloutTrainingDuration = 3; // Extended for Max
        goLiveDuration = 2; // Extended for Max
      } else { // 2500-4500+
        moduleDuration = 11;
        setupDuration = 2;
        learningDuration = 5;
        testingDuration = 11; // Full module duration
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
      start: currentWeek,
      duration: 1,
      color: colors.primaryDark,
    });
    
    tasks.push({
      id: 'requirements',
      name: 'Requirements Gathering',
      phase: 'Initiation & Planning',
      start: currentWeek,
      duration: 2,
      color: colors.primaryLighter
    });
    
    currentWeek += 2; // Move forward by 2 weeks (requirements gathering duration)
    
    // Execution Phase - add modules from the selected product
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i];
      
      // Start the next module 1 week before the previous module ends (overlap)
      if (i > 0) {
        currentWeek -= 1; // Overlap by 1 week
      }
      
      // Module implementation
      tasks.push({
        id: `${moduleName.toLowerCase()}-implementation`,
        name: `${moduleName} Implementation`,
        phase: 'Execution',
        start: currentWeek,
        duration: moduleDuration,
        color: colors.primaryDark
      });
      
      // Module setup (first part of implementation)
      tasks.push({
        id: `${moduleName.toLowerCase()}-setup`,
        name: 'Setup',
        phase: 'Execution',
        start: currentWeek,
        duration: setupDuration,
        color: colors.secondaryAlt // Purple
      });
      
      // Module learning (first part of implementation)
      tasks.push({
        id: `${moduleName.toLowerCase()}-learning`,
        name: 'Learning',
        phase: 'Execution',
        start: currentWeek,
        duration: learningDuration,
        color: colors.secondaryDark // Dark yellow
      });
      
      // Module testing (starts after setup)
      tasks.push({
        id: `${moduleName.toLowerCase()}-testing`,
        name: 'Testing',
        phase: 'Execution',
        start: currentWeek + setupDuration, // Start after setup completes
        duration: moduleDuration - setupDuration, // Adjusted duration
        color: colors.primaryLight // Light blue
      });
      
      // Add historical data import for Recruiting module only
      if (moduleName === 'Recruiting') {
        const historyStart = currentWeek + moduleDuration - dataImportDuration;
        tasks.push({
          id: 'historical-data-import',
          name: 'Historical Data Import',
          phase: 'Execution',
          start: historyStart,
          duration: dataImportDuration,
          color: colors.secondaryAltLight // Lighter purple
        });
      }
      
      // Add integration for Onboarding module only
      if (moduleName === 'Onboarding') {
        const integrationStart = currentWeek + moduleDuration - integrationDuration;
        tasks.push({
          id: 'onboarding-integration',
          name: 'Onboarding Integration',
          phase: 'Execution',
          start: integrationStart,
          duration: integrationDuration,
          color: colors.secondaryAltLight // Lighter purple
        });
      }
      
      // Move to next module
      currentWeek += moduleDuration;
    }
    
    // Launch Phase
    // Add rollout training
    tasks.push({
      id: 'rollout-training',
      name: 'Rollout Training',
      phase: 'Launch',
      start: currentWeek,
      duration: rolloutTrainingDuration,
      color: colors.secondary // yellow
    });
    
    currentWeek += rolloutTrainingDuration;
    
    tasks.push({
      id: 'golive',
      name: 'Go Live',
      phase: 'Launch',
      start: currentWeek,
      duration: goLiveDuration,
      color: colors.secondaryAlt // purple
    });
    
    currentWeek += goLiveDuration;
    
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

  // Function to handle PDF export
  const handleExportPDF = useCallback(() => {
    const configElement = document.getElementById('config-card');
    const ganttElement = document.getElementById('gantt-chart-container');
    
    // Set up PDF options
    const opt = {
      margin: [0.25, 0.25], // Smaller margins [top/bottom, left/right]
      filename: companyName ? `${companyName.trim()}-implementation-gantt.pdf` : 'implementation-gantt.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 1.5, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'landscape',
        compress: true 
      }
    };
    
    // First create a PDF document
    const pdf = new window.jspdf.jsPDF(opt.jsPDF);
    
    // Create a promise chain to capture both elements sequentially
    html2pdf()
      .from(configElement)
      .set(opt)
      .outputPdf('datauristring')
      .then((configPdfString) => {
        // First page is done, now add second page
        pdf.addPage();
        
        // Now capture the Gantt chart
        return html2pdf()
          .from(ganttElement)
          .set(opt)
          .outputPdf('datauristring');
      })
      .then((ganttPdfString) => {
        // Now save the complete PDF
        pdf.save(opt.filename);
      });
  }, [companyName]);

  // Calculate total implementation time
  const totalWeeks = useMemo(() => {
    // For ClearCare Pro, return a special message instead of weeks
    if (tierInfo.package === 'ClearCare Pro') {
      return 'Client Self Paced';
    }
    
    // For other packages, calculate based on tasks
    const lastTask = timeline.length > 0 ? 
      timeline.reduce((latest, task) => {
        const taskEnd = task.start + task.duration;
        return taskEnd > latest ? taskEnd : latest;
      }, 0) : 0;
      
    return Math.ceil(lastTask);
  }, [timeline, tierInfo.package]);
  
  // For display purposes - only for non-Pro packages
  const timeDisplay = useMemo(() => {
    if (tierInfo.package === 'ClearCare Pro') {
      return "Client Self Paced - 2 Weeks of optional ClearCompany setup assistance provided at the start of the Project";
    }
    
    const weeks = totalWeeks;
    const months = Math.floor(weeks / 4);
    const remainingWeeks = weeks % 4;
    
    if (months > 0) {
      return `${weeks} weeks (${months} month${months > 1 ? 's' : ''}${remainingWeeks > 0 ? ` and ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}` : ''})`;
    } else {
      return `${weeks} weeks`;
    }
  }, [totalWeeks, tierInfo.package]);

  // Format employee count for display
  const displayEmployeeCount = useMemo(() => {
    return employeeCount >= 4500 ? '4,500+' : employeeCount;
  }, [employeeCount]);

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
                Module Check-ins:
              </Typography>
              <Typography variant="h6">
                {tierInfo.moduleCheckIns} per module
              </Typography>
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
            <Typography variant="h5" sx={{ fontFamily: "'Open Sans', sans-serif", color: colors.primary }}>
              {companyName ? `${companyName} - Implementation Gantt Chart` : 'Implementation Gantt Chart'}
            </Typography>
          }
        />
        <CardContent>
          <Box ref={ganttContainerRef} sx={{ overflowX: 'hidden', pb: 3 }}>
            <Box 
              ref={ganttContentRef} 
              sx={{ 
                position: 'relative', 
                minWidth: '700px', 
                transform: 'scale(1)',
                transformOrigin: 'left top',
                '@media print': { 
                  maxWidth: '100vw',
                  transform: 'scale(1)',
                }
              }}
            >
              {/* Group by phase */}
              {['Initiation & Planning', 'Execution', 'Launch'].map(phase => {
                const phaseTasks = timeline.filter(task => task.phase === phase);
                
                if (phaseTasks.length === 0) return null;
                
                return (
                  <Box key={phase} sx={{ position: 'relative', mb: 3 }}>
                    {/* Phase header background that spans full width - improved to be continuous */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '48px', // Match height of phase header
                        backgroundColor: colors.lightGray,
                        zIndex: 1, // Lower z-index so it stays behind task names but is visible
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        position: 'relative', // Changed to allow full width background
                        display: 'flex',
                        py: 1.5,
                        mb: 1,
                        zIndex: 10,
                      }}
                    >
                      <Box sx={{ 
                        width: '250px', // Increased from 200px to show full task names
                        fontWeight: 'bold',
                        px: 1,
                        zIndex: 10,
                        color: colors.dark
                      }}>
                        {phase}
                      </Box>
                    </Box>
                    
                    {phaseTasks.map(task => {
                      // Determine if we should use a dotted border for self-paced tasks
                      const borderStyle = task.isSelfPaced ? 'dashed' : 'solid';
                      
                      // Determine width for self-paced tasks (full width) vs regular tasks
                      const barWidth = task.isSelfPaced ? 'calc(100% - 250px)' : `${task.duration * 24}px`;
                      
                      // Determine what text to display inside the bar
                      const barText = task.isSelfPaced ? task.selfPacedLabel : 
                                     (task.duration >= 0.5 ? `${task.duration}w` : '');
                                     
                      // For Pro package, use lighter fills with darker borders for all but setup
                      const isProPackage = tierInfo.package === 'ClearCare Pro';
                      const isSetupTask = task.name === 'Setup' || task.name === 'Optional ClearCompany Setup Assistance';
                      
                      // Determine background and border colors
                      let backgroundColor = task.color;
                      let borderColor = `1px ${borderStyle} rgba(0,0,0,0.1)`;
                      
                      if (isProPackage && !isSetupTask && task.isSelfPaced) {
                        // Create a lighter version of the color for fill
                        const lightColor = task.color === colors.primaryDark ? 'rgba(37, 70, 119, 0.15)' :
                                         task.color === colors.secondaryAlt ? 'rgba(130, 34, 117, 0.15)' :
                                         task.color === colors.secondaryDark ? 'rgba(230, 230, 81, 0.15)' :
                                         task.color === colors.primaryLight ? 'rgba(85, 186, 234, 0.15)' :
                                         'rgba(255, 255, 255, 0.15)';
                                         
                        backgroundColor = lightColor;
                        borderColor = `1px ${borderStyle} ${task.color}`;
                      }
                      
                      return (
                        <Box 
                          key={task.id} 
                          sx={{ 
                            display: 'flex', 
                            mb: 1.5, 
                            alignItems: 'center', 
                            height: '32px'
                          }}
                        >
                          <Box 
                            sx={{ 
                              position: 'sticky', 
                              left: 0, 
                              width: '250px', // Increased from 200px
                              backgroundColor: 'white', 
                              zIndex: 10, 
                              px: 1,
                              fontSize: '0.9rem', // Slightly smaller text to fit longer names
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: colors.dark
                            }}
                          >
                            {task.name}
                          </Box>
                          <Box sx={{ flexGrow: 1, position: 'relative', height: '32px' }}>
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                borderRadius: '4px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.875rem',
                                left: task.isSelfPaced ? 0 : `${task.start * 24}px`,
                                width: barWidth,
                                backgroundColor: backgroundColor,
                                height: '32px',
                                color: (task.color === colors.secondary || task.color === colors.secondaryDark || 
                                       (isProPackage && !isSetupTask && task.isSelfPaced)) ? '#254677' : '#FFFFFF',
                                border: borderColor
                              }}
                            >
                              {barText}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
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