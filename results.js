// results.js

document.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('results-container');
    
    // Retrieve the analysis from local storage
    chrome.storage.local.get('lastAnalysis', (data) => {
        if (chrome.runtime.lastError) {
            resultsContainer.textContent = 'Error loading results.';
            return;
        }

        if (data.lastAnalysis && data.lastAnalysis.analysis) {
            // Pretty-print the JSON analysis
            try {
                const analysisObject = JSON.parse(data.lastAnalysis.analysis);
                resultsContainer.textContent = JSON.stringify(analysisObject, null, 2);
            } catch (e) {
                // If it's not valid JSON, display as plain text
                resultsContainer.textContent = data.lastAnalysis.analysis;
            }
        } else if (data.lastAnalysis && data.lastAnalysis.error) {
            resultsContainer.textContent = `Analysis failed: ${data.lastAnalysis.error}`;
        } else {
            resultsContainer.textContent = 'No analysis found.';
        }
    });
}); 