document.addEventListener('DOMContentLoaded', function() {
  // # Updated element references for new layout
  const mainAnalyseBtn = document.getElementById('mainAnalyseBtn');
  const premiumBtn = document.getElementById('premiumBtn');
  const settingsToggle = document.getElementById('settingsToggle');
  const simpleView = document.getElementById('simpleView');
  const expandedContent = document.getElementById('expandedContent');
  
  // # Elements for expanded view
  const statusAlert = document.getElementById('statusAlert');
  const statusText = document.getElementById('statusText');
  const analysisGrid = document.getElementById('analysisGrid');
  const deeperAnalysisBtn = document.getElementById('deeperAnalysisBtn');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const premiumContent = document.getElementById('premiumContent');
  
  // # Main Analyse Button - triggers existing shortcut flow
  if (mainAnalyseBtn) {
    mainAnalyseBtn.addEventListener('click', function() {
      // Send startCountdown action to background script (same flow as keyboard shortcut)
      chrome.runtime.sendMessage({action: 'startCountdown'}, function(response) {
        // Close popup after message is sent
        window.close();
        if (chrome.runtime.lastError) {
          console.log("Could not start countdown:", chrome.runtime.lastError);
        }
      });
    });
  }
  
  // # Premium Button
  if (premiumBtn) {
    premiumBtn.addEventListener('click', function() {
      showUpgradeModal();
    });
  }
  
  // # Settings Toggle
  if (settingsToggle) {
    settingsToggle.addEventListener('click', function() {
      alert('Settings panel coming soon!');
    });
  }

  // # Deeper Analysis functionality
  if (deeperAnalysisBtn) {
    deeperAnalysisBtn.addEventListener('click', function() {
      // Show loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add('show');
      }
      
      // Simulate loading time
      setTimeout(() => {
        // Hide loading overlay
        if (loadingOverlay) {
          loadingOverlay.classList.remove('show');
        }
        
        // Switch to premium expanded mode
        document.documentElement.classList.remove('expanded');
        document.body.classList.remove('expanded');
        document.documentElement.classList.add('premium-expanded');
        document.body.classList.add('premium-expanded');
        
        // Hide the original analysis grid
        if (analysisGrid) {
          analysisGrid.style.display = 'none';
        }
        
        // Show premium content
        if (premiumContent) {
          premiumContent.classList.add('show');
        }
        
        // Hide the deeper analysis button
        deeperAnalysisBtn.style.display = 'none';
        
      }, 2000); // 2 seconds loading time
    });
  }
  
  // # Function to show upgrade modal (placeholder for future implementation)
  window.showUpgradeModal = function() {
    alert('Premium upgrade feature coming soon!');
  };
  
  // # Function to switch back to simple view (for testing)
  function switchToSimpleView() {
    // Show simple view
    if (simpleView) {
      simpleView.classList.remove('hidden');
    }
    
    // Hide expanded content
    if (expandedContent) {
      expandedContent.classList.remove('show');
    }
    
    // Reset popup size
    document.documentElement.classList.remove('expanded', 'premium-expanded');
    document.body.classList.remove('expanded', 'premium-expanded');
    
    // Hide premium content if shown
    if (premiumContent) {
      premiumContent.classList.remove('show');
    }
  }
  
  // # Add double-click to reset view (for testing)
  document.addEventListener('dblclick', switchToSimpleView);

  // # Check for stored analysis results from shortcut usage
  chrome.storage.local.get(['lastAnalysis'], function(result) {
    if (result.lastAnalysis) {
      const analysis = result.lastAnalysis;
      // # Check if analysis is recent (within last 30 seconds)
      const now = Date.now();
      const analysisAge = now - analysis.timestamp;
      
      if (analysisAge < 30000) { // 30 seconds
        // Switch to expanded view automatically
        switchToExpandedView();
        
        if (analysis.error) {
          // # Show error from shortcut
          let errorMessage = analysis.error;
          if (analysis.errorType) {
            switch (analysis.errorType) {
              case 'auth':
                errorMessage = 'API Key Error - Check credentials';
                break;
              case 'rate_limit':
                errorMessage = 'Rate limit exceeded - Wait a moment';
                break;
              case 'network':
                errorMessage = 'Network error - Check connection';
                break;
              case 'bad_request':
                errorMessage = 'Invalid image - Try different screenshot';
                break;
              case 'server':
                errorMessage = 'Server error - Try again later';
                break;
            }
          }
          
          showStatus(errorMessage, 'error');
          showEmptyState();
        } else if (analysis.analysis) {
          // # Show successful analysis from shortcut
          showStatus('Analysis complete! (via shortcut)', 'success');
          showAnalysis(analysis.analysis);
          
          setTimeout(() => {
            hideStatus();
          }, 3000);
        }
        
        // # Clear the stored analysis after using it
        chrome.storage.local.remove(['lastAnalysis']);
      }
    }
  });
  
  // # Switch from simple view to expanded analysis view
  function switchToExpandedView() {
    // Hide simple view
    if (simpleView) {
      simpleView.classList.add('hidden');
    }
    
    // Show expanded content
    if (expandedContent) {
      expandedContent.classList.add('show');
    }
    
    // Expand popup size
    document.documentElement.classList.add('expanded');
    document.body.classList.add('expanded');
  }
  
  // Function to show status alert
  function showStatus(message, type = 'info') {
    if (statusText && statusAlert) {
      statusText.textContent = message;
      statusAlert.classList.remove('hidden');
      
      // Change icon based on type
      const icon = statusAlert.querySelector('.mui-alert-icon');
      if (icon) {
        switch(type) {
          case 'success':
            icon.textContent = 'check_circle';
            break;
          case 'error':
            icon.textContent = 'error';
            break;
          case 'warning':
            icon.textContent = 'warning';
            break;
          default:
            icon.textContent = 'info';
        }
      }
    }
  }
  
  // Function to hide status alert
  function hideStatus() {
    if (statusAlert) {
      statusAlert.classList.add('hidden');
    }
  }
  
  // Function to show empty state
  function showEmptyState() {
    if (analysisGrid) {
      analysisGrid.innerHTML = `
        <div class="empty-state">
          <span class="material-icons empty-state-icon">trending_up</span>
          <div class="empty-state-text">
            Click "Analyse" to capture and analyze any trading chart<br>
            <small style="opacity: 0.7; margin-top: 8px; display: block;">
              Or press Alt+Shift+A (Option+Shift+A on Mac)
            </small>
          </div>
        </div>
      `;
    }
  }

  // Function to parse and display JSON analysis
  function showAnalysis(analysisText) {
    if (!analysisGrid) return;
    
    try {
      // Try to parse JSON from the response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found');
        }
      }
      
      // Check for error response
      if (analysis.error) {
        analysisGrid.innerHTML = `
          <div class="empty-state">
            <span class="material-icons empty-state-icon">error_outline</span>
            <div class="empty-state-text">
              ${analysis.error}
            </div>
          </div>
        `;
        return;
      }
      
      // Create structured layout
      analysisGrid.innerHTML = `
        <!-- Time Frame & Pattern -->
        <div class="analysis-card">
          <div class="card-title">
            <span class="material-icons">schedule</span>
            Time Frame
          </div>
          <div class="card-value">${analysis.timeFrame || 'N/A'}</div>
        </div>
        
        <div class="analysis-card">
          <div class="card-title">
            <span class="material-icons">trending_up</span>
            Pattern
          </div>
          <div class="card-value">${analysis.pattern || 'N/A'}</div>
        </div>
        
        <!-- Support & Resistance -->
        <div class="analysis-card">
          <div class="card-title">
            <span class="material-icons">support</span>
            Support
          </div>
          <div class="card-value">${analysis.support || 'N/A'}</div>
        </div>
        
        <div class="analysis-card">
          <div class="card-title">
            <span class="material-icons">block</span>
            Resistance
          </div>
          <div class="card-value">${analysis.resistance || 'N/A'}</div>
        </div>
        
        <!-- Volume & Recent Candles -->
        <div class="analysis-card">
          <div class="card-title">
            <span class="material-icons">bar_chart</span>
            Volume
          </div>
          <div class="card-value">${analysis.volume || 'N/A'}</div>
        </div>
        
        <div class="analysis-card">
          <div class="card-title">
            <span class="material-icons">candlestick_chart</span>
            Recent Candles
          </div>
          <div class="card-value">${analysis.recentCandles || 'N/A'}</div>
        </div>
        
        <!-- Scenarios -->
        <div class="analysis-card scenarios">
          <div class="card-title">
            <span class="material-icons">psychology</span>
            Potential Scenarios
          </div>
          <div class="scenarios-container">
            ${analysis.scenarios ? analysis.scenarios.map(scenario => `
              <div class="scenario-item">
                <div class="scenario-info">
                  <div class="scenario-type">${scenario.type}</div>
                  <div class="scenario-description">${scenario.description}</div>
                </div>
                <div class="scenario-probability">${scenario.probability}</div>
              </div>
            `).join('') : '<div class="scenario-item"><div class="scenario-info"><div class="scenario-description">No scenarios available</div></div></div>'}
          </div>
        </div>
        
        <!-- Conclusion -->
        <div class="analysis-card full-width">
          <div class="card-title">
            <span class="material-icons">lightbulb</span>
            Conclusion
          </div>
          <div class="card-value">${analysis.conclusion || 'No conclusion available'}</div>
        </div>
      `;
      
    } catch (error) {
      console.error('Error parsing analysis:', error);
      // Fallback to showing raw text if JSON parsing fails
      analysisGrid.innerHTML = `
        <div class="analysis-card full-width">
          <div class="card-title">
            <span class="material-icons">analytics</span>
            Analysis Results
          </div>
          <div class="card-value" style="white-space: pre-wrap; font-family: monospace; font-size: 11px;">
            ${analysisText}
          </div>
        </div>
      `;
    }
  }
}); 