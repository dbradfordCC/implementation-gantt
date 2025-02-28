import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader,
  Typography, Button, Slider, 
  TextField, Box, Grid, Paper,
  RadioGroup, Radio, FormControlLabel
} from '@mui/material';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

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
  
  // State variables
  const [employeeCount, setEmployeeCount] = useState(200);
  const [tierInfo, setTierInfo] = useState({
    tier: 'Small Biz',
    package: 'ClearCare Pro',
    moduleCheckIns: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState('ClearRecruit');
  const [timeline, setTimeline] = useState([]);

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
  useEffect(() => {
    // Scale factor based on employee count (more employees = more complexity)
    const scaleFactor = employeeCount <= 200 ? 1 : 
                        employeeCount <= 1000 ? 1.5 : 
                        2;
    
    const selectedProductInfo = productMixes[selectedProduct];
    const modules = selectedProductInfo.modules;
    
    let tasks = [];
    let currentWeek = 0;
    
    // Initiation & Planning Phase
    tasks.push({
      id: 'kickoff',
      name: 'Project Kickoff',
      phase: 'Initiation & Planning',
      start: currentWeek,
      duration: 1, // Fixed at 1 week
      color: colors.primaryDark, // Darker blue
    });
    
    tasks.push({
      id: 'requirements',
      name: 'Requirements Gathering',
      phase: 'Initiation & Planning',
      start: currentWeek,
      duration: 2, // Fixed at 2 weeks
      color: colors.primaryLighter
    });
    
    currentWeek += 2; // Move forward by 2 weeks (requirements gathering duration)
    
    // Execution Phase - add modules from the selected product
    for (let i = 0; i < modules.length; i++) {
      const moduleName = modules[i];
      const needsIntegration = (moduleName === 'Recruiting' || moduleName === 'Onboarding');
      
      // Module setup duration, scaled by complexity
      const moduleDuration = Math.ceil(baseDurations.execution.moduleDuration * scaleFactor);
      
      // Module implementation
      tasks.push({
        id: `${moduleName.toLowerCase()}-setup`,
        name: `${moduleName} Implementation`,
        phase: 'Execution',
        start: currentWeek,
        duration: moduleDuration,
        color: colors.primaryDark // darker blue
      });
      
      // Add integration time if needed - now same length and concurrent with testing
      if (needsIntegration) {
        const integrationDuration = moduleDuration * 0.5; // 50% of module time
        const integrationStart = currentWeek + (moduleDuration * 0.5); // Second half
        
        tasks.push({
          id: `${moduleName.toLowerCase()}-integration`,
          name: `${moduleName} Integration`,
          phase: 'Execution',
          start: integrationStart,
          duration: integrationDuration,
          color: colors.secondaryAltLight // lighter purple
        });
      }
      
      // Add testing - now 50% of module time during second half
      const testingStart = currentWeek + (moduleDuration * 0.5); // Second half
      const testingDuration = moduleDuration * 0.5; // 50% of module time
      
      tasks.push({
        id: `${moduleName.toLowerCase()}-testing`,
        name: `${moduleName} Testing & Validation`,
        phase: 'Execution',
        start: testingStart,
        duration: testingDuration,
        color: colors.secondaryDark // darker yellow
      });
      
      // Add historical data import for Recruiting module only
      if (moduleName === 'Recruiting') {
        tasks.push({
          id: 'historical-data-import',
          name: 'Historical Data Import',
          phase: 'Execution',
          start: testingStart,
          duration: testingDuration, // Same duration as testing
          color: colors.primaryLight // Light blue
        });
      }
      
      // Move to next module
      currentWeek += moduleDuration;
    }
    
    // Launch Phase
    // Add rollout training for 2 weeks prior to go live
    tasks.push({
      id: 'rollout-training',
      name: 'Rollout Training',
      phase: 'Launch',
      start: currentWeek,
      duration: 2, // Fixed at 2 weeks
      color: colors.secondary // yellow
    });
    
    currentWeek += 2; // Move forward 2 weeks
    
    tasks.push({
      id: 'golive',
      name: 'Go Live',
      phase: 'Launch',
      start: currentWeek,
      duration: baseDurations.launch.goLive,
      color: colors.secondaryAlt // purple
    });
    
    setTimeline(tasks);
  }, [employeeCount, selectedProduct, tierInfo]);

  // Function to handle PDF export
  const handleExportPDF = () => {
    const element = document.getElementById('gantt-chart-container');
    const opt = {
      margin: 1,
      filename: 'implementation-gantt.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Calculate total implementation time
  const totalWeeks = timeline.length > 0 ? 
    Math.ceil(timeline[timeline.length - 1].start + timeline[timeline.length - 1].duration) : 0;
  
  // For display purposes
  const months = Math.floor(totalWeeks / 4);
  const remainingWeeks = totalWeeks % 4;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: "'Open Sans', sans-serif", color: '#333333' }}>
      <Card>
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
                Employee Count: {employeeCount}
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
                    max={2000}
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
                {totalWeeks} weeks
                {months > 0 ? ` (${months} month${months > 1 ? 's' : ''}${remainingWeeks > 0 ? ` and ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}` : ''})` : ''}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      <Card id="gantt-chart-container">
        <CardHeader 
          title={
            <Typography variant="h5" sx={{ fontFamily: "'Open Sans', sans-serif", color: colors.primary }}>
              Implementation Gantt Chart
            </Typography>
          }
        />
        <CardContent>
          <Box sx={{ overflowX: 'auto', pb: 3 }}>
            <Box sx={{ position: 'relative', minWidth: '700px' }}>
              {/* Group by phase */}
              {['Initiation & Planning', 'Execution', 'Launch'].map(phase => {
                const phaseTasks = timeline.filter(task => task.phase === phase);
                
                if (phaseTasks.length === 0) return null;
                
                return (
                  <Box key={phase}>
                    <Box 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        width: '200px', 
                        fontWeight: 'bold', 
                        py: 1.5, 
                        px: 1, 
                        mb: 1, 
                        zIndex: 10,
                        backgroundColor: colors.lightGray, 
                        color: colors.dark
                      }}
                    >
                      {phase}
                    </Box>
                    
                    {phaseTasks.map(task => (
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
                            width: '200px', 
                            backgroundColor: 'white', 
                            zIndex: 10, 
                            px: 1,
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
                              left: `${task.start * 24}px`,
                              width: `${task.duration * 24}px`,
                              backgroundColor: task.color,
                              height: '32px',
                              color: task.color === colors.secondary || task.color === colors.secondaryDark ? '#254677' : '#FFFFFF',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }}
                          >
                            {task.duration >= 0.5 ? `${task.duration}w` : ''}
                          </Box>
                        </Box>
                      </Box>
                    ))}
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