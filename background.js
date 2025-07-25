// # Background Service Worker for Trade Assistant Chrome Extension

// # Added cooldown system to prevent rapid screenshots
let lastScreenshotTime = 0;
const COOLDOWN_DURATION = 30000; // 30 seconds

// # Function to open popup window instead of new tab
function openPopupWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 420,
    height: 650,
    focused: true
  });
}

// # Function to open the results window
function openResultsWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("results.html"),
    type: "popup",
    width: 650,
    height: 550,
    focused: true
  });
}

function isRestrictedUrl(url) {
  return url.startsWith('chrome://') || url.startsWith('https://chrome.google.com/webstore');
}

// # Modified shortcut handler to immediately take screenshot, show gesture, and process in background
chrome.commands.onCommand.addListener(function(command) {
  if (command === "open-popup") {
    // # Check cooldown period
    const now = Date.now();
    const timeSinceLastScreenshot = now - lastScreenshotTime;
    
    if (timeSinceLastScreenshot < COOLDOWN_DURATION) {
      const remainingTime = Math.ceil((COOLDOWN_DURATION - timeSinceLastScreenshot) / 1000);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "SHOW_COOLDOWN_MESSAGE", 
            remainingTime: remainingTime
          });
        }
      });
      return;
    }
    
    // # Instead of opening popup immediately, start countdown first
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        // # Start countdown sequence
        chrome.tabs.sendMessage(tabs[0].id, {type: "START_COUNTDOWN"}, function(response) {
          if (chrome.runtime.lastError) {
            console.log("Content script not ready, proceeding with screenshot");
            takeScreenshotDirectly(tabs[0].id);
          }
        });
      }
    });
  }
});

// # Function to handle the actual screenshot taking
function takeScreenshotDirectly(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (isRestrictedUrl(tab.url)) {
      chrome.storage.local.set({
        'lastAnalysis': {
          error: "Screenshots are not allowed on this page (e.g., chrome:// pages or the Web Store). Please try on a different page.",
          errorType: 'restricted_page',
          timestamp: Date.now()
        }
      }, () => {
        openResultsWindow();
      });
      return;
    }

    lastScreenshotTime = Date.now();
    
    // # Show screenshot visual effect
    chrome.tabs.sendMessage(tabId, {type: "SHOW_SCREENSHOT_EFFECT"}, function(response) {
      if (chrome.runtime.lastError) {
        console.log("Content script not ready for screenshot effect");
      }
    });
    
    // # Take screenshot immediately
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
      if (chrome.runtime.lastError) {
        console.error('Screenshot failed:', chrome.runtime.lastError);
        // # If screenshot fails, just open empty popup
        openPopupWindow();
      } else {
        console.log('Screenshot captured via shortcut');
        
        // # Update gesture to show processing
        chrome.tabs.sendMessage(tabId, {type: "SHOW_PROCESSING_GESTURE"}, function(response) {
          if (chrome.runtime.lastError) {
            console.log("Content script not ready for processing gesture");
          }
        });
        
        // # Call OpenAI API in background
        analyzeScreenshot(dataUrl)
          .then(analysis => {
            // # Store result for popup to access
            chrome.storage.local.set({
              'lastAnalysis': {
                dataUrl: dataUrl,
                analysis: analysis,
                timestamp: Date.now()
              }
            }, function() {
              // # Hide gesture and open popup with results
              chrome.tabs.sendMessage(tabId, {type: "HIDE_GESTURE"}, function(response) {
                if (chrome.runtime.lastError) {
                  console.log("Content script not ready to hide gesture");
                }
              });
              
              // # Open results window
              openResultsWindow();
            });
          })
          .catch(error => {
            console.error('OpenAI API Error:', error);
            // # Store error for popup to show
            chrome.storage.local.set({
              'lastAnalysis': {
                dataUrl: dataUrl,
                error: error.message,
                errorType: error.type || 'unknown',
                timestamp: Date.now()
              }
            }, function() {
              // # Hide gesture and open popup with error
              chrome.tabs.sendMessage(tabId, {type: "HIDE_GESTURE"}, function(response) {
                if (chrome.runtime.lastError) {
                  console.log("Content script not ready to hide gesture");
                }
              });
              
              openResultsWindow();
            });
          });
      }
    });
  });
}

// # Handle messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'takeScreenshot') {
    takeScreenshotDirectly(sender.tab.id);
    sendResponse({success: true});
  }
  // # New action to start countdown from popup (same as keyboard shortcut)
  else if (request.action === 'startCountdown') {
    // # Check cooldown period (same as keyboard shortcut)
    const now = Date.now();
    const timeSinceLastScreenshot = now - lastScreenshotTime;
    
    if (timeSinceLastScreenshot < COOLDOWN_DURATION) {
      const remainingTime = Math.ceil((COOLDOWN_DURATION - timeSinceLastScreenshot) / 1000);
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "SHOW_COOLDOWN_MESSAGE", 
            remainingTime: remainingTime
          });
        }
      });
      sendResponse({success: false, error: 'cooldown'});
      return;
    }
    
    // # Start countdown sequence (same as keyboard shortcut)
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const tabId = tabs[0].id;
        const tabUrl = tabs[0].url;

        // Check for restricted URLs first
        if (isRestrictedUrl(tabUrl)) {
            takeScreenshotDirectly(tabId);
            sendResponse({ success: true });
            return;
        }

        // Try to send a message to the content script.
        chrome.tabs.sendMessage(tabId, {type: "START_COUNTDOWN"}, function(response) {
            if (chrome.runtime.lastError) {
                // If it fails, the content script is likely not injected.
                console.log("Content script not active, injecting now...");

                // Inject the content script.
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        // If injection fails, fall back to direct screenshot.
                        console.error("Failed to inject content script:", chrome.runtime.lastError.message);
                        takeScreenshotDirectly(tabId);
                    } else {
                        // After injecting, send the message again.
                        console.log("Content script injected, retrying message...");
                        chrome.tabs.sendMessage(tabId, {type: "START_COUNTDOWN"}, (response) => {
                          if(chrome.runtime.lastError) {
                            console.error("Still failed to connect after injection:", chrome.runtime.lastError.message);
                            takeScreenshotDirectly(tabId);
                          }
                        });
                    }
                });
            } else {
                console.log("Content script already active, countdown started.");
            }
        });
      }
    });
    sendResponse({success: true});
    return true; // Keep message channel open for async response
  }
  // # Handle messages from popup
  else if (request.action === 'captureScreenshot') {
    // # Check cooldown for popup button too
    const now = Date.now();
    const timeSinceLastScreenshot = now - lastScreenshotTime;
    
    if (timeSinceLastScreenshot < COOLDOWN_DURATION) {
      const remainingTime = Math.ceil((COOLDOWN_DURATION - timeSinceLastScreenshot) / 1000);
      sendResponse({
        success: false, 
        error: `Please wait ${remainingTime} seconds before taking another screenshot`,
        errorType: 'cooldown'
      });
      return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        takeScreenshotDirectly(tabs[0].id);
        sendResponse({success: true});
      } else {
        sendResponse({success: false, error: "No active tab found."});
      }
    });
    return true; // Keep message channel open for async response
  }
  // # Handle analysis requests from content script
  else if (request.action === 'analyzeScreenshot') {
    analyzeScreenshot(request.dataUrl)
      .then(analysis => {
        // # Send result back to content script for display
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "ANALYSIS_COMPLETE",
              success: true,
              analysis: analysis
            }, () => {
              // After notifying content script, open the results window
              openResultsWindow();
            });
          }
        });
        sendResponse({success: true});
      })
      .catch(error => {
        console.error('Analysis Error:', error);
        // # Send error back to content script for display
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "ANALYSIS_COMPLETE",
              success: false,
              error: error.message
            }, () => {
                // After notifying content script, open the results window
                openResultsWindow();
            });
          }
        });
        sendResponse({success: false, error: error.message});
      });
    return true; // Keep the message channel open for async response
  }
});

// Function to analyze screenshot with OpenAI via secure proxy server
async function analyzeScreenshot(dataUrl) {
  // # SECURITY: API key is now safely stored on the proxy server
  // # No more exposed API keys in client-side code!
  const PROXY_SERVER_URL = 'https://proxy-server-o3159uuvx-tamirs-projects-bf4f71f2.vercel.app/api/analyze';
  
  try {
    console.log('Sending image to proxy server for secure OpenAI analysis...');
    
    // # Call our secure proxy server instead of OpenAI directly
    const response = await fetch(PROXY_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataUrl: dataUrl,
        // # Prompt is now handled by the proxy server with the same trading analysis logic
      })
    });

    // # Check if proxy server response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Proxy Server Error:', response.status, errorData);
      
      // # Handle specific proxy server errors
      if (response.status === 500 && errorData.error && errorData.error.includes('API key not configured')) {
        throw new Error('Proxy server configuration error - API key not set');
      }
      
      throw new Error(`Proxy Server Error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    
    // # Check for errors from the proxy server
    if (!data.success) {
      throw new Error(`Analysis failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.analysis) {
      throw new Error('Invalid response format from proxy server');
    }

    console.log('OpenAI analysis completed successfully via proxy server');
    return data.analysis;

  } catch (error) {
    console.error('Proxy server call failed:', error);
    
    // # Categorize different types of errors for better user experience
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      error.type = 'network';
      error.message = 'Cannot connect to proxy server - check internet connection';
    } else if (error.message.includes('ECONNREFUSED')) {
      error.type = 'connection';
      error.message = 'Proxy server not running - please start the server first';
    } else if (error.message.includes('API key not configured')) {
      error.type = 'config';
      error.message = 'Server configuration error - check API key setup';
    } else if (error.message.includes('401')) {
      error.type = 'auth';
      error.message = 'Authentication failed - check server API key';
    } else if (error.message.includes('429')) {
      error.type = 'rate_limit';
      error.message = 'Rate limit exceeded - too many requests';
    } else if (error.message.includes('400')) {
      error.type = 'bad_request';
      error.message = 'Invalid request - check image format and size';
    } else if (error.message.includes('500')) {
      error.type = 'server';
      error.message = 'Server error - try again later';
    }
    
    throw error;
  }
}

// Supabase Authentication Handlers
importScripts('supabase.local.js');

const supabaseUrl = 'https://hurfwwefneepldwxfhhm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cmZ3d2VmbmVlcGxkd3hmaGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NzkxOTYsImV4cCI6MjA2NzU1NTE5Nn0.nubvnDlqSuEEdjPLzjVeoqug31MBW5_xi4-Ikc_b1bE';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Add message listener for authentication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSession') {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      sendResponse({ session });
    }).catch(error => {
      console.error('Error getting session:', error);
      sendResponse({ session: null });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'signIn') {
    supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: chrome.identity.getRedirectURL("auth.html"),
      },
    }).then(({ data, error }) => {
      if (error) {
        console.error('Supabase signInWithOAuth error:', error);
        sendResponse({ error: error.message });
      } else {
        sendResponse({ url: data.url });
      }
    }).catch(error => {
      console.error('Sign in error:', error);
      sendResponse({ error: error.message });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'setSession') {
    const { access_token, refresh_token } = message.tokens;
    supabaseClient.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        console.error('Supabase setSession error:', error);
        sendResponse({ success: false, error: error.message });
      } else {
        sendResponse({ success: true });
      }
    }).catch(error => {
      console.error('Set session error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'signOut') {
    supabaseClient.auth.signOut().then(({ error }) => {
      if (error) {
        console.error('Error logging out:', error);
        sendResponse({ success: false, error: error.message });
      } else {
        sendResponse({ success: true });
      }
    }).catch(error => {
      console.error('Sign out error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
}); 