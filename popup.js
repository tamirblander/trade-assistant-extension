document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const analyseChartBtn = document.getElementById('analyseChartBtn');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    const checkUser = async () => {
        // Ask background script for current session
        chrome.runtime.sendMessage({ action: 'getSession' }, (response) => {
            if (response && response.session) {
                loginBtn.style.display = 'none';
                analyseChartBtn.style.display = 'block';
                userInfo.style.display = 'block';
                userInfo.textContent = `Logged in as: ${response.session.user.email}`;
                logoutBtn.style.display = 'inline';
            } else {
                loginBtn.style.display = 'block';
                analyseChartBtn.style.display = 'none';
                userInfo.style.display = 'none';
                logoutBtn.style.display = 'none';
            }
        });
    };

    logoutBtn.addEventListener('click', async () => {
        chrome.runtime.sendMessage({ action: 'signOut' }, (response) => {
            checkUser();
        });
    });

    loginBtn.addEventListener('click', async () => {
        console.log('Login button clicked!');
        
        chrome.runtime.sendMessage({ action: 'signIn' }, async (response) => {
            if (response && response.url) {
                chrome.identity.launchWebAuthFlow({
                    url: response.url,
                    interactive: true,
                }, async (redirectUrl) => {
                    if (chrome.runtime.lastError || !redirectUrl) {
                        console.error('launchWebAuthFlow error:', chrome.runtime.lastError?.message);
                        return;
                    }
                    
                    console.log('launchWebAuthFlow success. Redirect URL:', redirectUrl);

                    const url = new URL(redirectUrl);
                    const hash = url.hash.substring(1);
                    const params = new URLSearchParams(hash);

                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');
                    
                    console.log('Extracted tokens:', { access_token: !!access_token, refresh_token: !!refresh_token });

                    if (access_token && refresh_token) {
                        chrome.runtime.sendMessage({ 
                            action: 'setSession', 
                            tokens: { access_token, refresh_token }
                        }, (response) => {
                            if (response && response.success) {
                                console.log('Session set successfully. Checking user.');
                                checkUser();
                            } else {
                                console.error('Failed to set session:', response?.error);
                            }
                        });
                    } else {
                        console.error('Could not get tokens from redirect URL.');
                    }
                });
            } else {
                console.error('No URL returned from background script');
            }
        });
    });

    analyseChartBtn.addEventListener('click', () => {
        handleAnalyseChart();
    });

    checkUser();
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