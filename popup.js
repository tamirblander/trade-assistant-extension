document.addEventListener('DOMContentLoaded', function() {
    const analyseChartBtn = document.getElementById('analyseChartBtn');
    if(analyseChartBtn) {
        analyseChartBtn.addEventListener('click', handleAnalyseChart);
    }
});

function handleAnalyseChart() {
    console.log('Analyse Chart clicked - starting analysis flow');
    
    // # Close the popup first so user can see the countdown on the page
    window.close();
    
    // # Trigger the full analysis flow: countdown → screenshot → analysis → results
    chrome.runtime.sendMessage({
        action: 'startCountdown'
    }, function(response) {
        if (chrome.runtime.lastError) {
            console.log('Background script not ready:', chrome.runtime.lastError.message);
        } else if (response && !response.success) {
            console.log('Analysis failed:', response.error);
        } else {
            console.log('Analysis flow started successfully');
        }
    });
} 