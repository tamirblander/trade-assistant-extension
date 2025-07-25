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
    const analysisPrompt = prompt || `You are a professional trading analyst. I need you to analyze ANY image that contains financial data, charts, graphs, or trading information.

IMPORTANT: You should detect charts even if they are:
- Small or unclear
- Part of a larger webpage or screenshot
- Mixed with other content
- Any type of financial visualization (candlesticks, line charts, bar charts, etc.)
- Stock prices, crypto prices, forex charts
- Trading platforms, brokers, financial websites
- Even basic price movements or numbers

If you see ANYTHING that could be financial data (prices, charts, graphs, trading interface, numbers that look like stock/crypto prices), analyze it!

Return your analysis in this EXACT JSON format (no extra text before or after):

{
  "summary": {
    "trend": "Bullish/Bearish/Neutral",
    "rsi": "Overbought/Oversold/Neutral/Not visible",
    "stop": 100.00,
    "target": 120.00,
    "riskReward": "1:2.0",
    "confidence": 75,
    "currentPrice": 110.00,
    "timeFrame": "1H/4H/1D/1W/Not visible"
  },
  "patterns": [
    {
      "label": "Support Level",
      "type": "support",
      "color": "blue",
      "strength": "Strong"
    },
    {
      "label": "Resistance at 120",
      "type": "resistance", 
      "color": "red",
      "strength": "Moderate"
    }
  ],
  "insights": [
    {
      "type": "bullish",
      "text": "Price is holding above key support level"
    },
    {
      "type": "neutral",
      "text": "Volume appears average for this timeframe"
    }
  ],
  "recommendation": {
    "action": "Buy",
    "entry": 110.50,
    "stopLoss": 105.00,
    "takeProfit": 125.00,
    "conditions": "Enter on breakout above current resistance with volume confirmation",
    "timeHorizon": "Short-term"
  },
  "forecast": {
    "scenarios": [
      {
        "type": "Most likely scenario",
        "probability": "60%",
        "target": 125.00,
        "timeframe": "5-7 days",
        "description": "Continuation of current trend with breakout above resistance"
      },
      {
        "type": "Alternative scenario",
        "probability": "30%",
        "target": 105.00,
        "timeframe": "3-5 days", 
        "description": "Pullback to support level for retest"
      },
      {
        "type": "Less likely scenario",
        "probability": "10%",
        "target": 95.00,
        "timeframe": "1-2 weeks",
        "description": "Break below support leading to further decline"
      }
    ]
  },
  "technicalData": {
    "volume": "Normal trading volume observed",
    "volatility": "Moderate price swings",
    "momentum": "Moderate bullish momentum",
    "keyLevels": {
      "resistance": [120.00, 125.00],
      "support": [105.00, 100.00]
    }
  },
  "timing": {
    "status": "Watch for breakout confirmation above 120",
    "urgency": "Medium"
  }
}

CRITICAL INSTRUCTIONS:
1. Use realistic price values based on what you see in the image
2. If you can't see specific indicators, make reasonable assumptions based on price action
3. Always provide numerical values - never use 0.00 or leave blank
4. Probabilities in forecast must add up to 100%
5. Be creative but realistic with your analysis
6. If the image shows ANY financial data whatsoever, provide a full analysis

Only return {"error": "No Chart Detected"} if the image contains absolutely NO financial information, numbers, charts, or trading data of any kind.`;

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