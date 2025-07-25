// Trading Dashboard for Chrome Extension Results
class TradingDashboard {
    constructor() {
        // SVG icon system matching Lucide React icons
        this.icons = {
            'trending-up': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline><polyline points="16,7 22,7 22,13"></polyline></svg>`,
            'trending-down': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,17 13.5,8.5 8.5,13.5 2,7"></polyline><polyline points="16,17 22,17 22,11"></polyline></svg>`,
            'minus': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
            'triangle': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path></svg>`,
            'bar-chart': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
            'activity': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
            'zap': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon></svg>`,
            'shield': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
            'target': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
            'percent': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>`,
            'eye': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
            'line-chart': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>`,
            'search': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`,
            'alert-triangle': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
            'clock': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>`
        };
        
        this.init();
    }

    init() {
    chrome.storage.local.get('lastAnalysis', (data) => {
        if (chrome.runtime.lastError) {
                this.showError('Error loading results.');
            return;
        }

            if (data.lastAnalysis) {
                if (data.lastAnalysis.analysis) {
                    this.renderAnalysis(data.lastAnalysis);
                } else if (data.lastAnalysis.error) {
                    this.showError(`Analysis failed: ${data.lastAnalysis.error}`);
                } else {
                    this.showError('No analysis found.');
                }
            } else {
                this.showError('No analysis found.');
            }
        });
    }

    parseAnalysis(analysisString) {
        console.log('Attempting to parse:', typeof analysisString, analysisString);
        
        try {
            // First try direct JSON parse
            const parsed = JSON.parse(analysisString);
            console.log('Direct parse successful:', parsed);
            return parsed;
            } catch (e) {
            console.log('Direct parse failed:', e.message);
            
            // Try to extract JSON from the response if it's wrapped in text
            const jsonMatch = analysisString.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    const extracted = JSON.parse(jsonMatch[0]);
                    console.log('Extracted JSON successful:', extracted);
                    return extracted;
                } catch (e2) {
                    console.log('Extracted JSON parse failed:', e2.message);
                    throw new Error('Invalid JSON format');
                }
            }
            
            console.log('No JSON found in response');
            throw new Error('No JSON found in response');
        }
    }

    renderAnalysis(analysisData) {
        console.log('Raw analysis data:', analysisData);
        console.log('Analysis string:', analysisData.analysis);
        
        try {
            const analysis = this.parseAnalysis(analysisData.analysis);
            console.log('Parsed analysis object:', analysis);
            
            if (analysis.error) {
                this.showError(analysis.error);
                return;
            }

            const appContent = document.getElementById('app-content');
            appContent.innerHTML = this.buildDashboard(analysis, analysisData.dataUrl);
            
        } catch (error) {
            console.error('Error parsing analysis:', error);
            console.log('Falling back to legacy format');
            this.showLegacyFormat(analysisData.analysis);
        }
    }

    buildDashboard(data, screenshotUrl) {
        console.log('Building dashboard with data:', data);
        
        const currentTime = new Date().toLocaleTimeString();
        
        // Ensure data has the required structure
        const safeData = {
            summary: data.summary || {},
            patterns: data.patterns || [],
            insights: data.insights || [],
            recommendation: data.recommendation || null,
            forecast: data.forecast || null,
            timing: data.timing || { status: 'Analysis complete' }
        };
        
        console.log('Safe data structure:', safeData);
        
        return `
            ${this.buildHeader(currentTime)}
            ${this.buildSummaryGrid(safeData.summary)}
            ${this.buildTimingAlert(safeData.timing)}
            
            <div class="main-grid">
                <div>
                    ${this.buildPatternsSection(safeData.patterns)}
                    ${this.buildInsightsSection(safeData.insights)}
                </div>
                ${this.buildScreenshotSection(screenshotUrl)}
            </div>
            
            ${this.buildRecommendationSection(safeData.recommendation)}
            ${this.buildForecastSection(safeData.forecast)}
            ${this.buildFooter()}
        `;
            }

    buildHeader(currentTime) {
        return `
            <div class="header">
                <div class="header-left">
                    <div class="header-icon">${this.icons['line-chart']}</div>
                    <h1 class="header-title">AI Chart Analysis</h1>
                </div>
                <div class="header-right">
                    <div class="status-dot"></div>
                    Live • ${currentTime}
                </div>
            </div>
        `;
    }

    buildSummaryGrid(summary) {
        if (!summary) return '';
        
        const trendClass = this.getTrendClass(summary.trend);
        const confidenceBar = summary.confidence || 0;
        
        return `
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">Trend</div>
                    <div class="summary-value ${trendClass}">
                        <span class="summary-icon">${this.getTrendIcon(summary.trend)}</span>
                        <span>${summary.trend || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">RSI</div>
                    <div class="summary-value color-blue">
                        <span class="summary-icon">${this.icons['activity']}</span>
                        <span>${summary.rsi || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">Stop Loss</div>
                    <div class="summary-value color-red">
                        <span class="summary-icon">${this.icons['shield']}</span>
                        <span>$${summary.stop || '0.00'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">Target</div>
                    <div class="summary-value color-green">
                        <span class="summary-icon">${this.icons['target']}</span>
                        <span>$${summary.target || '0.00'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">R/R</div>
                    <div class="summary-value color-purple">
                        <span class="summary-icon">${this.icons['percent']}</span>
                        <span>${summary.riskReward || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">Confidence</div>
                    <div class="summary-value color-orange">
                        <span class="summary-icon">${this.icons['eye']}</span>
                        <span>${summary.confidence || 0}%</span>
                    </div>
                    <div style="position: absolute; bottom: 0; left: 0; height: 2px; background-color: #374151; width: 100%;"></div>
                    <div style="position: absolute; bottom: 0; left: 0; height: 2px; background-color: #f59e0b; width: ${confidenceBar}%;"></div>
                </div>
            </div>
        `;
    }

    buildTimingAlert(timing) {
        if (!timing) return '';
        
        return `
            <div class="timing-alert">
                <span class="timing-icon">${this.icons['clock']}</span>
                <span class="timing-text">${timing.status || 'Analyzing market conditions...'}</span>
            </div>
        `;
    }

    buildPatternsSection(patterns) {
        if (!patterns || !Array.isArray(patterns)) return '';
        
        const patternItems = patterns.map(pattern => `
            <div class="pattern-item" data-tier="free">
                <div class="pattern-content">
                    <span class="pattern-icon ${this.getColorClass(pattern.color)}">${this.getPatternIcon(pattern.type)}</span>
                    <span class="pattern-label">${pattern.label}</span>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="section-card">
                <h2 class="section-title">
                    <span class="section-icon">${this.icons['triangle']}</span>
                    Technical Patterns
                </h2>
                <div class="patterns-grid">
                    ${patternItems}
                </div>
            </div>
        `;
    }

    buildInsightsSection(insights) {
        if (!insights || !Array.isArray(insights)) return '';
        
        const insightItems = insights.map(insight => `
            <div class="insight-item" data-tier="premium">
                <div class="insight-content">
                    <span class="insight-icon ${this.getInsightColorClass(insight.type)}">${this.getInsightIcon(insight.type)}</span>
                    <span class="insight-text">${insight.text}</span>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="section-card">
                <h2 class="section-title">
                    <span class="section-icon">${this.icons['search']}</span>
                    Key Insights
                </h2>
                <div class="insights-list">
                    ${insightItems}
                </div>
            </div>
        `;
    }

    buildScreenshotSection(screenshotUrl) {
        if (!screenshotUrl) return '';
        
        return `
            <div class="screenshot-container" data-tier="premium">
                <div class="section-card">
                    <h2 class="section-title">
                        <span class="section-icon">📷</span>
                        Chart Screenshot
                    </h2>
                    <img src="${screenshotUrl}" alt="Chart Screenshot" class="screenshot-image">
                </div>
            </div>
        `;
    }

    buildRecommendationSection(recommendation) {
        if (!recommendation) return '';
        
        return `
            <div class="recommendation-section" data-tier="pro">
                <h2 class="section-title">
                    <span class="section-icon">${this.icons['target']}</span>
                    Trading Recommendation
                </h2>
                
                <div class="recommendation-grid">
                    <div class="recommendation-item">
                        <div class="recommendation-label">Action</div>
                        <div class="recommendation-value ${this.getActionColorClass(recommendation.action)}">${recommendation.action || 'Hold'}</div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-label">Entry</div>
                        <div class="recommendation-value">$${recommendation.entry || '0.00'}</div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-label">Stop Loss</div>
                        <div class="recommendation-value">$${recommendation.stopLoss || '0.00'}</div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-label">Take Profit</div>
                        <div class="recommendation-value">$${recommendation.takeProfit || '0.00'}</div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-label">Time Horizon</div>
                        <div class="recommendation-value">${recommendation.timeHorizon || 'N/A'}</div>
                    </div>
                </div>
                
                ${recommendation.conditions ? `
                    <div class="recommendation-conditions">
                        <strong>Conditions:</strong> ${recommendation.conditions}
                    </div>
                ` : ''}
            </div>
        `;
    }

    buildForecastSection(forecast) {
        if (!forecast || !forecast.scenarios) return '';
        
        const scenarioItems = forecast.scenarios.map(scenario => `
            <div class="forecast-item" data-tier="pro">
                <div class="forecast-header">
                    <span class="forecast-type">${scenario.type}</span>
                    <span class="forecast-probability">${scenario.probability}</span>
                </div>
                <div class="forecast-description">
                    ${scenario.description} 
                    ${scenario.target ? `Target: $${scenario.target}` : ''} 
                    ${scenario.timeframe ? `(${scenario.timeframe})` : ''}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="forecast-section" data-tier="pro">
                <h2 class="section-title">
                    <span class="section-icon">🔮</span>
                    Market Forecast
                </h2>
                <div class="forecast-list">
                    ${scenarioItems}
                </div>
            </div>
        `;
    }

    buildFooter() {
        return `
            <div class="footer">
                <p class="footer-text">Analysis powered by AI • Updated in real-time</p>
            </div>
        `;
    }

    // Utility functions
    getTrendIcon(trend) {
        switch(trend?.toLowerCase()) {
            case 'bullish': return this.icons['trending-up'];
            case 'bearish': return this.icons['trending-down'];
            default: return this.icons['minus'];
        }
    }

    getTrendClass(trend) {
        switch(trend?.toLowerCase()) {
            case 'bullish': return 'trend-bullish';
            case 'bearish': return 'trend-bearish';
            default: return 'trend-neutral';
        }
    }

    getColorClass(color) {
        return `color-${color}` || 'color-blue';
    }

    getPatternIcon(type) {
        const iconMap = {
            'support': this.icons['shield'],
            'resistance': this.icons['minus'],
            'pattern': this.icons['triangle'],
            'indicator': this.icons['activity'],
            'breakout': this.icons['zap']
        };
        return iconMap[type] || this.icons['bar-chart'];
    }

    getInsightIcon(type) {
        const iconMap = {
            'bullish': this.icons['trending-up'],
            'bearish': this.icons['trending-down'],
            'neutral': this.icons['minus'],
            'warning': this.icons['alert-triangle']
        };
        return iconMap[type] || this.icons['search'];
    }

    getInsightColorClass(type) {
        const colorMap = {
            'bullish': 'color-green',
            'bearish': 'color-red',
            'neutral': 'color-blue',
            'warning': 'color-yellow'
        };
        return colorMap[type] || 'color-blue';
    }

    getActionColorClass(action) {
        const colorMap = {
            'buy': 'color-green',
            'sell': 'color-red',
            'hold': 'color-blue',
            'wait': 'color-yellow'
        };
        return colorMap[action?.toLowerCase()] || 'color-blue';
    }

    showError(message) {
        const appContent = document.getElementById('app-content');
        appContent.innerHTML = `
            <div class="error">
                <div>
                    <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
                    <div>${message}</div>
                </div>
            </div>
        `;
    }

    showLegacyFormat(analysisText) {
        const appContent = document.getElementById('app-content');
        appContent.innerHTML = `
            <div class="section-card" style="margin-top: 20px;">
                <h2 class="section-title">Analysis Results (Legacy Format)</h2>
                <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; overflow-y: auto; max-height: 400px;">
                    ${analysisText}
                </div>
                <button onclick="window.testWithMockData()" style="margin-top: 12px; padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Test with Mock Data
                </button>
            </div>
            ${this.buildFooter()}
        `;
        
        // Add global test function
        const self = this;
        window.testWithMockData = function() {
            const mockData = {
                summary: {
                    trend: "Bullish",
                    rsi: "Neutral", 
                    stop: 175.20,
                    target: 189.00,
                    riskReward: "1:2.3",
                    confidence: 87
                },
                patterns: [
                    { label: "Triangle", type: "pattern", color: "green" },
                    { label: "Support: 173", type: "support", color: "blue" },
                    { label: "Resistance: 182.4", type: "resistance", color: "red" }
                ],
                insights: [
                    { type: "bullish", text: "Breakout possible above 182.40" },
                    { type: "warning", text: "RSI is near overbought (67)" }
                ],
                recommendation: {
                    action: "Buy",
                    entry: 182.40,
                    stopLoss: 175.20,
                    takeProfit: 189.00,
                    conditions: "Buy above 182.4 only if volume continues to increase"
                },
                forecast: {
                    scenarios: [
                        { type: "Most likely", probability: "65%", target: 189, timeframe: "5 days", description: "Bullish breakout scenario" }
                    ]
                },
                timing: { status: "Watch for confirmation" }
            };
            
            console.log('Testing with mock data:', mockData);
            appContent.innerHTML = self.buildDashboard(mockData, null);
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TradingDashboard();
}); 