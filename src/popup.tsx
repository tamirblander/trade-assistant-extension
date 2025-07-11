import { useState } from "react"

function IndexPopup() {
  const [status, setStatus] = useState("")

  const handleManualTrigger = async () => {
    setStatus("Capturing screenshot and analyzing...")
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
        chrome.tabs.sendMessage(tab.id as number, {
          type: "SCREENSHOT_CAPTURED",
          dataUrl
        })
        setStatus("Screenshot sent for analysis. Check overlay on the page.")
      })
    } else {
      setStatus("No active tab found.")
    }
  }

  return (
    <div style={{ padding: 16, width: 320 }}>
      <h2>Trade Assistant</h2>
      <p>
        Press <b>Ctrl+Shift+Y</b> (or <b>Cmd+Shift+Y</b> on Mac) to analyze the current chart.<br />
        Or use the button below for manual testing.
      </p>
      <button onClick={handleManualTrigger} style={{ margin: "12px 0", padding: "8px 16px" }}>
        Analyze Current Tab
      </button>
      <div style={{ marginTop: 12, color: "#888", fontSize: 14 }}>{status}</div>
      <hr style={{ margin: "16px 0" }} />
      <p style={{ fontSize: 12, color: "#aaa" }}>
        The analysis will appear as an overlay on the active page.<br />
        If no chart is detected, you will see a message.<br />
        <b>API Key:</b> Set your OpenAI API key in <code>content.ts</code>.<br />
        For production, use environment variables and Plasmo secret management.
      </p>
    </div>
  )
}

export default IndexPopup
