// # Popup JavaScript - handles all UI interactions and state

// State variables
let settingsExpanded = false;
let autoAnalyze = true;
let useCase = "Trading";

// DOM elements
const settingsToggle = document.getElementById('settingsToggle');
const settingsArrow = document.getElementById('settingsArrow');
const settingsContent = document.getElementById('settingsContent');
const autoAnalyzeToggle = document.getElementById('autoAnalyzeToggle');
const autoAnalyzeKnob = document.getElementById('autoAnalyzeKnob');
const useCaseSelect = document.getElementById('useCaseSelect');

// Action buttons
const chartAnalysisBtn = document.getElementById('chartAnalysisBtn');
const recordBtn = document.getElementById('recordBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const loginBtn = document.getElementById('loginBtn');

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSettings();
});

function setupEventListeners() {
    // Settings toggle
    settingsToggle.addEventListener('click', toggleSettings);
    
    // Auto-analyze toggle
    autoAnalyzeToggle.addEventListener('click', toggleAutoAnalyze);
    
    // Use case dropdown
    useCaseSelect.addEventListener('change', handleUseCaseChange);
    
    // Action buttons
    chartAnalysisBtn.addEventListener('click', handleChartAnalysis);
    recordBtn.addEventListener('click', handleRecord);
    screenshotBtn.addEventListener('click', handleScreenshot);
    loginBtn.addEventListener('click', handleLogin);
}

function toggleSettings() {
    settingsExpanded = !settingsExpanded;
    
    if (settingsExpanded) {
        settingsContent.classList.add('expanded');
        settingsArrow.classList.add('expanded');
    } else {
        settingsContent.classList.remove('expanded');
        settingsArrow.classList.remove('expanded');
    }
    
    saveSettings();
}

function toggleAutoAnalyze() {
    autoAnalyze = !autoAnalyze;
    updateAutoAnalyzeUI();
    saveSettings();
}

function updateAutoAnalyzeUI() {
    if (autoAnalyze) {
        autoAnalyzeToggle.classList.remove('off');
        autoAnalyzeToggle.classList.add('on');
        autoAnalyzeKnob.classList.remove('off');
        autoAnalyzeKnob.classList.add('on');
    } else {
        autoAnalyzeToggle.classList.remove('on');
        autoAnalyzeToggle.classList.add('off');
        autoAnalyzeKnob.classList.remove('on');
        autoAnalyzeKnob.classList.add('off');
    }
}

function handleUseCaseChange(event) {
    useCase = event.target.value;
    saveSettings();
}

// Action button handlers
function handleChartAnalysis() {
    console.log('Chart Analysis clicked');
    // # Add chart analysis functionality here
    // # This could trigger the background script to take screenshot and analyze
    chrome.runtime.sendMessage({
        action: 'startCountdown'
    }, function(response) {
        if (response && !response.success) {
            console.log('Analysis failed:', response.error);
        }
    });
}

function handleRecord() {
    console.log('Record clicked');
    // # Add recording functionality here
}

function handleScreenshot() {
    console.log('Screenshot clicked');
    // # Add screenshot functionality here
    chrome.runtime.sendMessage({
        action: 'captureScreenshot'
    }, function(response) {
        if (response.success) {
            console.log('Screenshot captured:', response.dataUrl);
            console.log('Analysis:', response.analysis);
        } else {
            console.log('Screenshot failed:', response.error);
        }
    });
}

function handleLogin() {
    console.log('Log in to analyze clicked - starting analysis flow');
    
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

// Settings persistence
function saveSettings() {
    const settings = {
        settingsExpanded,
        autoAnalyze,
        useCase
    };
    
    chrome.storage.local.set({
        'popupSettings': settings
    }, function() {
        console.log('Settings saved');
    });
}

function loadSettings() {
    chrome.storage.local.get(['popupSettings'], function(result) {
        if (result.popupSettings) {
            const settings = result.popupSettings;
            
            settingsExpanded = settings.settingsExpanded || false;
            autoAnalyze = settings.autoAnalyze !== undefined ? settings.autoAnalyze : true;
            useCase = settings.useCase || "Trading";
            
            // Update UI
            if (settingsExpanded) {
                settingsContent.classList.add('expanded');
                settingsArrow.classList.add('expanded');
            }
            
            updateAutoAnalyzeUI();
            useCaseSelect.value = useCase;
        }
    });
}
