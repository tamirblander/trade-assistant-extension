import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// # SECURITY NOTE: API key removed - content scripts don't need direct API access
// # All API calls are handled securely by background.js via proxy server

// # Added gesture overlay management for shortcut screenshots
let gestureOverlay: HTMLElement | null = null

function createGestureOverlay(type: 'capture' | 'processing') {
  // # Remove existing overlay if present
  if (gestureOverlay) {
    gestureOverlay.remove()
  }
  
  gestureOverlay = document.createElement("div")
  gestureOverlay.style.position = "fixed"
  gestureOverlay.style.top = "20px"
  gestureOverlay.style.right = "20px"
  gestureOverlay.style.background = "rgba(0, 0, 0, 0.8)"
  gestureOverlay.style.color = "#fff"
  gestureOverlay.style.padding = "12px 20px"
  gestureOverlay.style.borderRadius = "8px"
  gestureOverlay.style.zIndex = "999999"
  gestureOverlay.style.fontSize = "14px"
  gestureOverlay.style.fontFamily = "system-ui, -apple-system, sans-serif"
  gestureOverlay.style.display = "flex"
  gestureOverlay.style.alignItems = "center"
  gestureOverlay.style.gap = "8px"
  gestureOverlay.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"
  gestureOverlay.style.animation = "slideIn 0.3s ease-out"
  
  // # Add CSS animation keyframes if not already present
  if (!document.querySelector('#trade-assistant-styles')) {
    const style = document.createElement('style')
    style.id = 'trade-assistant-styles'
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `
    document.head.appendChild(style)
  }
  
  if (type === 'capture') {
    gestureOverlay.innerHTML = `
      <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%; animation: pulse 1s infinite;"></div>
      <span>📸 Capturing screenshot...</span>
    `
  } else if (type === 'processing') {
    gestureOverlay.innerHTML = `
      <div style="width: 16px; height: 16px; border: 2px solid #f59e0b; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span>🤖 Analyzing chart...</span>
    `
    
    // # Add spin animation
    const existingStyle = document.querySelector('#trade-assistant-styles')
    if (existingStyle) {
      existingStyle.textContent += `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
    }
  }
  
  document.body.appendChild(gestureOverlay)
}

function hideGestureOverlay() {
  if (gestureOverlay) {
    gestureOverlay.style.animation = "slideIn 0.3s ease-out reverse"
    setTimeout(() => {
      if (gestureOverlay) {
        gestureOverlay.remove()
        gestureOverlay = null
      }
    }, 300)
  }
}

function createOverlay(text: string) {
  let overlay = document.getElementById("trade-assistant-overlay")
  if (!overlay) {
    overlay = document.createElement("div")
    overlay.id = "trade-assistant-overlay"
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.width = "100vw"
    overlay.style.height = "100vh"
    overlay.style.background = "rgba(0,0,0,0.7)"
    overlay.style.color = "#fff"
    overlay.style.zIndex = "999999"
    overlay.style.display = "flex"
    overlay.style.alignItems = "center"
    overlay.style.justifyContent = "center"
    overlay.style.fontSize = "1.5rem"
    overlay.style.padding = "2rem"
    overlay.style.textAlign = "center"
    overlay.onclick = () => overlay?.remove()
    document.body.appendChild(overlay)
  }
  overlay.textContent = text + "\n(Click anywhere to close)"
}

async function analyzeScreenshot(dataUrl: string) {
  createOverlay("Analyzing chart... Please wait.")
  try {
    // # SECURITY UPDATE: Use background script instead of direct API calls
    // # Send message to background script to handle analysis via secure proxy
    chrome.runtime.sendMessage({
      action: 'analyzeScreenshot',
      dataUrl: dataUrl
    }, (response) => {
      if (response && response.success) {
        createOverlay(response.analysis)
      } else {
        createOverlay("Error analyzing chart: " + (response?.error || "Unknown error"))
      }
    })
  } catch (e) {
    createOverlay("Error analyzing chart: " + (e as Error).message)
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // # Handle gesture messages from background script
  if (msg.type === "SHOW_CAPTURE_GESTURE") {
    createGestureOverlay('capture')
    sendResponse({success: true})
  } else if (msg.type === "SHOW_PROCESSING_GESTURE") {
    createGestureOverlay('processing')
    sendResponse({success: true})
  } else if (msg.type === "HIDE_GESTURE") {
    hideGestureOverlay()
    sendResponse({success: true})
  }
  // # Keep existing screenshot message handler
  else if (msg.type === "SCREENSHOT_CAPTURED" && msg.dataUrl) {
    analyzeScreenshot(msg.dataUrl)
  }
})

// # SECURITY NOTE: Removed direct OpenAI API integration
// # All API calls now go through secure background script proxy 