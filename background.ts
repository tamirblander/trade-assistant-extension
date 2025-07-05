export {}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "analyze-chart") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
        chrome.tabs.sendMessage(tab.id as number, {
          type: "SCREENSHOT_CAPTURED",
          dataUrl
        })
      })
    }
  }
}) 