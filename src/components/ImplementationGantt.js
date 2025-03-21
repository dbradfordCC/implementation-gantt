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
                          className="task-row"
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
                              width: '260px', // Increased from 200px
                              backgroundColor: 'white', 
                              zIndex: 10, 
                              px: 1,
                              fontSize: '0.9rem', // Slightly smaller text to fit longer names
                              overflow: 'visible', // Changed from 'hidden' to prevent truncation
                              whiteSpace: 'normal', // Changed from 'nowrap' to allow wrapping
                              lineHeight: '1.2',
                              color: colors.dark
                            }}
                          >
                            {task.name}
                          </Box>
                          <Box sx={{ flexGrow: 1, position: 'relative', height: '32px' }}>
                            <Box 
                              data-task-bar="true"
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