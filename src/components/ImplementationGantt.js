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
          <Box ref={ganttContainerRef} sx={{ overflowX: 'hidden', overflowY: 'visible', pb: 3 }}>
            <Box 
              data-gantt-content="true"
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
              {/* Simplified rendering of phases using the helper function */}
              {['Initiation & Planning', 'Execution', 'Launch'].map(phase => renderPhaseTasks(phase))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImplementationGantt;