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
  "timeFrame": "1 Day/1 Week/1 Month/1 Year/etc",
  "pattern": "Describe the trend and pattern you observe",
  "resistance": "Key resistance levels if visible",
  "support": "Key support levels if visible",
  "volume": "Volume analysis if available, or 'Not visible' if not shown",
  "recentCandles": "Recent price action description",
  "scenarios": [
    {
      "type": "Most likely scenario",
      "probability": "X%",
      "description": "Detailed description of this scenario"
    },
    {
      "type": "Alternative scenario",
      "probability": "X%",
      "description": "Detailed description of this scenario"
    },
    {
      "type": "Less likely scenario",
      "probability": "X%",
      "description": "Detailed description of this scenario"
    }
  ],
  "conclusion": "Summary of the analysis and key levels to watch"
}

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