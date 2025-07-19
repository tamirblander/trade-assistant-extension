// # JavaScript version of content.ts for gesture handling
// # SECURITY NOTE: API key removed - content scripts don't need direct API access
// # All API calls are handled securely by background.js via proxy server

// # Added gesture overlay management for shortcut screenshots
let gestureOverlay = null;
let countdownOverlay = null;
let screenshotFrame = null;

// # Enhanced styles for all animations
function ensureStyles() {
  if (!document.querySelector('#trade-assistant-styles')) {
    const style = document.createElement('style');
    style.id = 'trade-assistant-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes countdownPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes screenshotFlash {
        0% { opacity: 0; }
        15% { opacity: 1; }
        30% { opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes frameEffect {
        0% { 
          transform: scale(1); 
          opacity: 0;
          border-width: 0px;
        }
        50% { 
          transform: scale(1.02); 
          opacity: 1;
          border-width: 8px;
        }
        100% { 
          transform: scale(1); 
          opacity: 0;
          border-width: 0px;
        }
      }
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      .trade-assistant-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .countdown-number {
        font-size: 120px;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        animation: countdownPulse 1s ease-in-out;
      }
      .countdown-text {
        position: absolute;
        bottom: 30%;
        font-size: 24px;
        color: #ffffff;
        text-align: center;
        opacity: 0.9;
      }
      .screenshot-frame {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        border: 0px solid #00ff00;
        box-shadow: inset 0 0 50px rgba(0, 255, 0, 0.5);
        pointer-events: none;
        z-index: 999998;
        animation: frameEffect 0.8s ease-out;
      }
      .screenshot-flash {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 255, 255, 0.9);
        pointer-events: none;
        z-index: 999997;
        animation: screenshotFlash 0.6s ease-out;
      }
    `;
    document.head.appendChild(style);
  }
}

// # Countdown sequence function
function startCountdown() {
  ensureStyles();
  
  countdownOverlay = document.createElement("div");
  countdownOverlay.className = "trade-assistant-overlay";
  countdownOverlay.innerHTML = `
    <div class="countdown-number">3</div>
    <div class="countdown-text">📸 Get ready for screenshot...</div>
  `;
  document.body.appendChild(countdownOverlay);
  
  let count = 3;
  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownOverlay.querySelector('.countdown-number').textContent = count;
      countdownOverlay.querySelector('.countdown-number').style.animation = 'none';
      // Force reflow to restart animation
      countdownOverlay.querySelector('.countdown-number').offsetHeight;
      countdownOverlay.querySelector('.countdown-number').style.animation = 'countdownPulse 1s ease-in-out';
    } else {
      clearInterval(countdownInterval);
      countdownOverlay.querySelector('.countdown-number').textContent = 'SNAP!';
      countdownOverlay.querySelector('.countdown-text').textContent = '📷 Taking screenshot...';
      
      // # Wait a moment then take screenshot
      setTimeout(() => {
        countdownOverlay.remove();
        countdownOverlay = null;
        
        // # Notify background script to take screenshot
        chrome.runtime.sendMessage({action: 'takeScreenshot'}, function(response) {
          if (chrome.runtime.lastError) {
            console.log("Background script not ready:", chrome.runtime.lastError.message);
          }
        });
      }, 500);
    }
  }, 1000);
}

// # Screenshot visual effect
function showScreenshotEffect() {
  ensureStyles();
  
  // # Create flash effect
  const flash = document.createElement("div");
  flash.className = "screenshot-flash";
  document.body.appendChild(flash);
  
  // # Create frame effect
  screenshotFrame = document.createElement("div");
  screenshotFrame.className = "screenshot-frame";
  document.body.appendChild(screenshotFrame);
  
  // # Remove effects after animation
  setTimeout(() => {
    flash.remove();
    if (screenshotFrame) {
      screenshotFrame.remove();
      screenshotFrame = null;
    }
  }, 800);
}

// # Show cooldown message
function showCooldownMessage(remainingTime) {
  ensureStyles();
  
  const cooldownOverlay = document.createElement("div");
  cooldownOverlay.style.position = "fixed";
  cooldownOverlay.style.top = "50%";
  cooldownOverlay.style.left = "50%";
  cooldownOverlay.style.transform = "translate(-50%, -50%)";
  cooldownOverlay.style.background = "rgba(239, 68, 68, 0.95)";
  cooldownOverlay.style.color = "#fff";
  cooldownOverlay.style.padding = "20px 30px";
  cooldownOverlay.style.borderRadius = "12px";
  cooldownOverlay.style.zIndex = "999999";
  cooldownOverlay.style.fontSize = "18px";
  cooldownOverlay.style.fontFamily = "system-ui, -apple-system, sans-serif";
  cooldownOverlay.style.textAlign = "center";
  cooldownOverlay.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
  cooldownOverlay.style.animation = "bounceIn 0.5s ease-out";
  
  cooldownOverlay.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
    <div style="font-weight: bold; margin-bottom: 5px;">Please wait!</div>
    <div>Next screenshot in ${remainingTime} seconds</div>
  `;
  
  document.body.appendChild(cooldownOverlay);
  
  // # Remove after 3 seconds
  setTimeout(() => {
    cooldownOverlay.style.animation = "bounceIn 0.3s ease-out reverse";
    setTimeout(() => cooldownOverlay.remove(), 300);
  }, 3000);
}

function createGestureOverlay(type) {
  ensureStyles();
  
  // # Remove existing overlay if present
  if (gestureOverlay) {
    gestureOverlay.remove();
  }
  
  gestureOverlay = document.createElement("div");
  gestureOverlay.style.position = "fixed";
  gestureOverlay.style.top = "20px";
  gestureOverlay.style.right = "20px";
  gestureOverlay.style.background = "rgba(0, 0, 0, 0.8)";
  gestureOverlay.style.color = "#fff";
  gestureOverlay.style.padding = "12px 20px";
  gestureOverlay.style.borderRadius = "8px";
  gestureOverlay.style.zIndex = "999999";
  gestureOverlay.style.fontSize = "14px";
  gestureOverlay.style.fontFamily = "system-ui, -apple-system, sans-serif";
  gestureOverlay.style.display = "flex";
  gestureOverlay.style.alignItems = "center";
  gestureOverlay.style.gap = "8px";
  gestureOverlay.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  gestureOverlay.style.animation = "slideIn 0.3s ease-out";
  
  if (type === 'capture') {
    gestureOverlay.innerHTML = `
      <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%; animation: pulse 1s infinite;"></div>
      <span>📸 Capturing screenshot...</span>
    `;
  } else if (type === 'processing') {
    gestureOverlay.innerHTML = `
      <div style="width: 16px; height: 16px; border: 2px solid #f59e0b; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span>🤖 Analyzing chart...</span>
    `;
  }
  
  document.body.appendChild(gestureOverlay);
}

function hideGestureOverlay() {
  if (gestureOverlay) {
    gestureOverlay.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => {
      if (gestureOverlay) {
        gestureOverlay.remove();
        gestureOverlay = null;
      }
    }, 300);
  }
}

function createOverlay(text) {
  let overlay = document.getElementById("trade-assistant-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "trade-assistant-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.color = "#fff";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.fontSize = "1.5rem";
    overlay.style.padding = "2rem";
    overlay.style.textAlign = "center";
    overlay.onclick = () => overlay?.remove();
    document.body.appendChild(overlay);
  }
  overlay.textContent = text + "\n(Click anywhere to close)";
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // # Handle new countdown and screenshot effects
  if (msg.type === "START_COUNTDOWN") {
    startCountdown();
    sendResponse({success: true});
  } else if (msg.type === "SHOW_SCREENSHOT_EFFECT") {
    showScreenshotEffect();
    sendResponse({success: true});
  } else if (msg.type === "SHOW_COOLDOWN_MESSAGE") {
    showCooldownMessage(msg.remainingTime);
    sendResponse({success: true});
  }
  // # Handle existing gesture messages from background script
  else if (msg.type === "SHOW_CAPTURE_GESTURE") {
    createGestureOverlay('capture');
    sendResponse({success: true});
  } else if (msg.type === "SHOW_PROCESSING_GESTURE") {
    createGestureOverlay('processing');
    sendResponse({success: true});
  } else if (msg.type === "HIDE_GESTURE") {
    hideGestureOverlay();
    sendResponse({success: true});
  }
  // # Handle analysis results from background script
  else if (msg.type === "ANALYSIS_COMPLETE") {
    if (msg.success) {
      createOverlay(msg.analysis);
    } else {
      createOverlay("Error analyzing chart: " + (msg.error || "Unknown error"));
    }
    sendResponse({success: true});
  }
  // # Keep existing screenshot message handler for backward compatibility
  else if (msg.type === "SCREENSHOT_CAPTURED" && msg.dataUrl) {
    createOverlay("Analyzing chart... Please wait.");
    // # Send to background script for secure processing via proxy server
    chrome.runtime.sendMessage({
      action: 'analyzeScreenshot',
      dataUrl: msg.dataUrl
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.log("Background script not ready for analysis:", chrome.runtime.lastError.message);
        createOverlay("Error: Could not connect to background script");
      }
    });
    sendResponse({success: true});
  }
});

// # SECURITY NOTE: All API calls are handled securely by background.js via proxy server
// # Content scripts no longer have direct API access for better security 