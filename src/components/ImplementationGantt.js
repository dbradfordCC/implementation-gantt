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
                  {renderProductOptions()}
                </Grid>
              </RadioGroup>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selected Product Modules
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {renderSelectedModules()}
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
              {renderPhase('Initiation & Planning')}
              {renderPhase('Execution')}
              {renderPhase('Launch')}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ImplementationGantt;