// AI Chart Analysis Dashboard
class ChartAnalysisDashboard {
    constructor() {
        // SVG icon system matching Lucide React icons
        this.icons = {
            'trending-up': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline><polyline points="16,7 22,7 22,13"></polyline></svg>`,
            'trending-down': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,17 13.5,8.5 8.5,13.5 2,7"></polyline><polyline points="16,17 22,17 22,11"></polyline></svg>`,
            'minus': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
            'triangle': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path></svg>`,
            'bar-chart': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
            'activity': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
            'zap': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon></svg>`,
            'shield': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
            'target': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
            'percent': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>`,
            'eye': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
            'line-chart': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>`,
            'search': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`,
            'alert-triangle': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
            'clock': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline></svg>`,
            'dollar-sign': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            'gauge': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>`
        };
        
        this.init();
    }

    init() {
        chrome.storage.local.get('lastAnalysis', (data) => {
            if (chrome.runtime.lastError) {
                this.showError('Error loading results: ' + chrome.runtime.lastError.message);
                return;
            }

            if (data.lastAnalysis) {
                if (data.lastAnalysis.analysis) {
                    this.renderAnalysis(data.lastAnalysis);
                } else if (data.lastAnalysis.error) {
                    this.showError('Analysis failed: ' + data.lastAnalysis.error);
                } else {
                    this.showError('No analysis found.');
                }
            } else {
                this.showError('No analysis found.');
            }
        });
    }

    parseAnalysis(analysisString) {
        if (typeof analysisString === 'object' && analysisString !== null) {
            return analysisString;
        }
        
        let jsonString = String(analysisString);
        
        // Clean up markdown formatting
        jsonString = jsonString
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .replace(/^json\s*/g, '')
            .trim();
        
        // Check if JSON looks truncated and try to complete it
        if (!jsonString.endsWith('}')) {
            console.log('JSON appears truncated, attempting to complete...');
            jsonString = this.completePartialJSON(jsonString);
        }
        
        try {
            const parsed = JSON.parse(jsonString);
            console.log('Parse successful:', parsed);
            return parsed;
        } catch (error) {
            console.error('Parse failed:', error);
            
            // Try more aggressive completion if first attempt failed
            try {
                const recovered = this.recoverPartialJSON(analysisString);
                if (recovered) {
                    console.log('Recovery successful');
                    return recovered;
                }
            } catch (recoveryError) {
                console.error('Recovery also failed:', recoveryError);
            }
            
            // If all parsing fails, show the raw response
            throw new Error('Response was incomplete or malformed. Try analyzing again.');
        }
    }

    completePartialJSON(jsonString) {
        // Find the deepest complete object/section
        const lines = jsonString.split('\n');
        let validJson = '';
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];
            
            if (escapeNext) {
                escapeNext = false;
                validJson += char;
                continue;
            }
            
            if (char === '\\') {
                escapeNext = true;
                validJson += char;
                continue;
            }
            
            if (char === '"' && !escapeNext) {
                inString = !inString;
            }
            
            if (!inString) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            validJson += char;
        }
        
        // Close any unclosed strings
        if (inString) {
            validJson += '"';
        }
        
        // Close any unclosed objects
        while (braceCount > 0) {
            validJson += '\n}';
            braceCount--;
        }
        
        return validJson;
    }

    recoverPartialJSON(originalString) {
        // Try to extract whatever complete sections we can
        const sections = {
            summary: null,
            patterns: null,
            insights: null,
            recommendation: null,
            forecast: null,
            timing: null
        };
        
        // Look for complete sections in the partial response
        Object.keys(sections).forEach(section => {
            const regex = new RegExp(`"${section}"\\s*:\\s*({[^}]*}|\\[[^\\]]*\\])`, 'g');
            const match = originalString.match(regex);
            if (match && match[0]) {
                try {
                    const sectionData = match[0].split(':').slice(1).join(':').trim();
                    sections[section] = JSON.parse(sectionData);
                } catch (e) {
                    // Skip invalid sections
                }
            }
        });
        
        // Return whatever we could parse
        if (Object.values(sections).some(s => s !== null)) {
            return sections;
        }
        
        return null;
    }
    
    renderAnalysis(analysisData) {
        try {
            const analysis = this.parseAnalysis(analysisData.analysis);
            
            if (analysis.error) {
                this.showError(analysis.error);
                return;
            }

            const appContent = document.getElementById('app-content');
            appContent.innerHTML = this.buildDashboard(analysis, analysisData.dataUrl);
            
        } catch (error) {
            console.error('Error rendering analysis:', error);
            
            // Try to show raw response as fallback
            try {
                const rawString = String(analysisData.analysis);
                if (rawString.length > 50) {
                    this.showPartialAnalysis(rawString);
                } else {
                    this.showError('Failed to display analysis results. Please try again.');
                }
            } catch (fallbackError) {
                this.showError('Failed to display analysis results. Please try again.');
            }
        }
    }

    buildDashboard(data, screenshotUrl) {
        const currentTime = new Date().toLocaleTimeString();
        const isPartial = this.isPartialData(data);
        
        return `
            ${this.buildHeader(currentTime)}
            ${isPartial ? this.buildPartialWarning() : ''}
            ${this.buildSummaryGrid(data.summary)}
            ${this.buildTimingAlert(data.timing)}
            
            <div class="main-grid">
                <div>
                    ${this.buildPatternsSection(data.patterns)}
                    ${this.buildInsightsSection(data.insights)}
                </div>
                ${this.buildScreenshotSection(screenshotUrl)}
            </div>
            
            ${this.buildRecommendationSection(data.recommendation)}
            ${this.buildForecastSection(data.forecast)}
        `;
    }

    isPartialData(data) {
        // Check if we're missing key sections or they're null
        const requiredSections = ['summary', 'patterns', 'insights'];
        return requiredSections.some(section => !data[section] || 
            (Array.isArray(data[section]) && data[section].length === 0));
    }

    buildPartialWarning() {
        return `
            <div class="timing-alert" style="background-color: #451a03; border-color: #92400e;">
                <span class="timing-icon" style="color: #f59e0b;">${this.icons['alert-triangle']}</span>
                <span class="timing-text">Partial analysis - some data may be incomplete. Try analyzing again for full results.</span>
            </div>
        `;
    }

    showPartialAnalysis(rawString) {
        const appContent = document.getElementById('app-content');
        appContent.innerHTML = `
            <div class="container">
                ${this.buildHeader(new Date().toLocaleTimeString())}
                
                <div class="section-card" style="background-color: #451a03; border-color: #92400e;">
                    <h2 class="section-title" style="color: #fbbf24;">
                        <span class="section-icon">${this.icons['alert-triangle']}</span>
                        Incomplete Response
                    </h2>
                    <p style="color: #fcd34d; margin-bottom: 16px;">
                        The analysis was cut off before completion. Here's the partial response:
                    </p>
                    <div style="background-color: #1f2937; padding: 16px; border-radius: 6px; font-family: monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; overflow-y: auto; max-height: 400px; color: #e5e7eb;">
${rawString}
                    </div>
                    <p style="color: #fcd34d; margin-top: 12px; font-size: 14px;">
                        💡 Try analyzing the chart again to get complete results.
                    </p>
                </div>
            </div>
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
                    <div class="summary-value color-purple">
                        <span class="summary-icon">${this.icons['gauge']}</span>
                        <span>${summary.rsi || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">Stop</div>
                    <div class="summary-value color-red">
                        <span class="summary-icon">${this.icons['shield']}</span>
                        <span>$${this.formatPrice(summary.stop)}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">Target</div>
                    <div class="summary-value color-green">
                        <span class="summary-icon">${this.icons['target']}</span>
                        <span>$${this.formatPrice(summary.target)}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">R/R</div>
                    <div class="summary-value color-yellow">
                        <span class="summary-icon">${this.icons['percent']}</span>
                        <span>${summary.riskReward || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-label">Confidence</div>
                    <div class="summary-value color-blue">
                        <span class="summary-icon">${this.icons['eye']}</span>
                        <span>${summary.confidence || 0}%</span>
                    </div>
                    <div class="confidence-bar"></div>
                    <div class="confidence-fill" style="width: ${summary.confidence || 0}%;"></div>
                </div>
            </div>
        `;
    }

    buildTimingAlert(timing) {
        if (!timing || !timing.status) return '';
        
        return `
            <div class="timing-alert">
                <span class="timing-icon">${this.icons['clock']}</span>
                <span class="timing-text">${timing.status}</span>
                ${timing.urgency ? `<span class="timing-urgency">${timing.urgency}</span>` : ''}
            </div>
        `;
    }

    buildPatternsSection(patterns) {
        if (!patterns || !Array.isArray(patterns) || patterns.length === 0) return '';
        
        const patternItems = patterns.map(pattern => `
            <div class="pattern-item">
                <div class="pattern-content">
                    <span class="pattern-icon ${this.getColorClass(pattern.color)}">${this.getPatternIcon(pattern.type)}</span>
                    <span class="pattern-label">${pattern.label}</span>
                </div>
                ${pattern.strength ? `<span class="pattern-strength">${pattern.strength}</span>` : ''}
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
        if (!insights || !Array.isArray(insights) || insights.length === 0) return '';
        
        const insightItems = insights.map(insight => `
            <div class="insight-item">
                <span class="insight-icon ${this.getInsightColorClass(insight.type)}">${this.getInsightIcon(insight.type)}</span>
                <span class="insight-text">${insight.text}</span>
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
            <div class="screenshot-container">
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
            <div class="section-card">
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
                        <div class="recommendation-value">$${this.formatPrice(recommendation.entry)}</div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-label">Stop Loss</div>
                        <div class="recommendation-value">$${this.formatPrice(recommendation.stopLoss)}</div>
                    </div>
                    <div class="recommendation-item">
                        <div class="recommendation-label">Take Profit</div>
                        <div class="recommendation-value">$${this.formatPrice(recommendation.takeProfit)}</div>
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
        if (!forecast || !forecast.scenarios || !Array.isArray(forecast.scenarios)) return '';
        
        const scenarioItems = forecast.scenarios.map(scenario => `
            <div class="forecast-item">
                <div class="forecast-header">
                    <span class="forecast-type">${scenario.type}</span>
                    <span class="forecast-probability">${scenario.probability}</span>
                </div>
                <div class="forecast-description">
                    ${scenario.description}
                    ${scenario.target ? ` Target: $${this.formatPrice(scenario.target)}` : ''}
                    ${scenario.timeframe ? ` (${scenario.timeframe})` : ''}
                </div>
            </div>
        `).join('');
        
        return `
            <div class="section-card">
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

    // Utility functions
    formatPrice(price) {
        if (!price) return '0.00';
        return Number(price).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }

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
                <div>⚠️ ${message}</div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChartAnalysisDashboard();
}); 