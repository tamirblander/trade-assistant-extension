import cors from 'cors';
import fetch from 'node-fetch';

// Helper to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const corsMiddleware = cors({
  origin: ['chrome-extension://*', 'moz-extension://*', /http:\/\/localhost:\d+/],
  credentials: true,
  methods: ['POST', 'GET', 'OPTIONS'],
});

export default async function handler(req, res) {
  try {
    // Run the CORS middleware
    await runMiddleware(req, res, corsMiddleware);

    // Handle pre-flight requests for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured on server'
      });
    }

    // Extract request data from extension
    const { dataUrl, prompt } = req.body;
    
    if (!dataUrl) {
      return res.status(400).json({
        error: 'Missing dataUrl in request'
      });
    }

    // Default prompt if not provided
    const analysisPrompt = prompt || `You are a professional trading analyst. Analyze any financial chart, graph, or trading data visible in this image. Look for candlestick charts, line charts, bar charts, price movements, technical indicators, or any financial data visualization.

If you can see ANY type of financial chart, graph, or trading data (even if it's small or unclear), provide your analysis in this exact JSON format:

{
  "summary": {
    "trend": "Bullish/Bearish/Neutral",
    "rsi": "Overbought/Oversold/Neutral",
    "stop": 0.00,
    "target": 0.00,
    "riskReward": "1:X.X",
    "confidence": 85,
    "currentPrice": 0.00,
    "timeFrame": "1H/4H/1D/1W/etc"
  },
  "patterns": [
    {
      "label": "Pattern Name",
      "type": "support/resistance/pattern/indicator",
      "color": "green/red/blue/yellow/purple/orange",
      "strength": "Strong/Moderate/Weak"
    }
  ],
  "insights": [
    {
      "type": "bullish/bearish/neutral/warning",
      "text": "Key insight about the chart"
    }
  ],
  "recommendation": {
    "action": "Buy/Sell/Hold/Wait",
    "entry": 0.00,
    "stopLoss": 0.00,
    "takeProfit": 0.00,
    "conditions": "Specific conditions for entry (e.g., 'Buy above 182.4 only if volume increases')",
    "timeHorizon": "Short-term/Medium-term/Long-term"
  },
  "forecast": {
    "scenarios": [
      {
        "type": "Most likely scenario",
        "probability": "65%",
        "target": 0.00,
        "timeframe": "X days/weeks",
        "description": "Detailed description"
      },
      {
        "type": "Alternative scenario", 
        "probability": "25%",
        "target": 0.00,
        "timeframe": "X days/weeks",
        "description": "Detailed description"
      },
      {
        "type": "Less likely scenario",
        "probability": "10%", 
        "target": 0.00,
        "timeframe": "X days/weeks",
        "description": "Detailed description"
      }
    ]
  },
  "technicalData": {
    "volume": "High/Normal/Low or specific analysis",
    "volatility": "High/Normal/Low",
    "momentum": "Strong/Moderate/Weak",
    "keyLevels": {
      "resistance": [0.00, 0.00],
      "support": [0.00, 0.00]
    }
  },
  "timing": {
    "status": "Immediate entry/Wait for pullback/Watch for confirmation/etc",
    "urgency": "High/Medium/Low"
  }
}

Instructions:
- Fill all numeric values with actual price levels from the chart
- Use realistic percentages for probabilities (must add up to 100%)
- Choose appropriate colors: green for bullish, red for bearish, blue for neutral, yellow for caution, purple for volume, orange for breakout
- Be specific with entry conditions and timing
- Include 5-7 key patterns/indicators you observe
- Provide 3-4 actionable insights
- Make recommendations specific and actionable
- Ensure all scenarios are realistic and add up to 100% probability

ONLY return {"error": "No Chart Detected"} if there is absolutely NO financial data, charts, graphs, or trading information visible in the image whatsoever.`;

    // Make request to OpenAI API with server-side API key
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    // Check if OpenAI response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', response.status, errorData);
      
      return res.status(response.status).json({
        error: `OpenAI API Error: ${errorData.error?.message || response.statusText}`,
        type: 'openai_error'
      });
    }

    const data = await response.json();
    
    // Check for API-specific errors
    if (data.error) {
      return res.status(400).json({
        error: `OpenAI API Error: ${data.error.message}`,
        type: 'openai_error'
      });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        error: 'Invalid response format from OpenAI API',
        type: 'response_format_error'
      });
    }

    // Return the analysis result to the extension
    res.status(200).json({
      success: true,
      analysis: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({
      error: 'An internal server error occurred.',
      type: 'unknown'
    });
  }
} 