const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// # Enable CORS for extension requests
app.use(cors({
  origin: ['chrome-extension://*', 'moz-extension://*', 'http://localhost:*'],
  credentials: true
}));

// # Parse JSON requests
app.use(express.json({ limit: '50mb' })); // # Increase limit for base64 images

// # Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Trade Assistant Proxy Server is running' });
});

// # Proxy endpoint for OpenAI API
app.post('/api/analyze', async (req, res) => {
  try {
    console.log('Received analysis request from extension');
    
    // # Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured on server'
      });
    }

    // # Extract request data from extension
    const { dataUrl, prompt } = req.body;
    
    if (!dataUrl) {
      return res.status(400).json({
        error: 'Missing dataUrl in request'
      });
    }

    // # Default prompt if not provided
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

    console.log('Forwarding request to OpenAI API...');

    // # Make request to OpenAI API with server-side API key
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

    // # Check if OpenAI response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', response.status, errorData);
      
      return res.status(response.status).json({
        error: `OpenAI API Error: ${errorData.error?.message || response.statusText}`,
        type: 'openai_error'
      });
    }

    const data = await response.json();
    
    // # Check for API-specific errors
    if (data.error) {
      console.error('OpenAI API returned error:', data.error);
      return res.status(400).json({
        error: `OpenAI API Error: ${data.error.message}`,
        type: 'openai_error'
      });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response format:', data);
      return res.status(500).json({
        error: 'Invalid response format from OpenAI API',
        type: 'response_format_error'
      });
    }

    console.log('OpenAI analysis completed successfully');
    
    // # Return the analysis result to the extension
    res.json({
      success: true,
      analysis: data.choices[0].message.content,
      usage: data.usage // # Include usage stats if needed
    });

  } catch (error) {
    console.error('Proxy server error:', error);
    
    // # Categorize different types of errors
    let errorType = 'unknown';
    let errorMessage = error.message;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorType = 'network';
      errorMessage = 'Network error - check internet connection';
    } else if (error.message.includes('ENOTFOUND')) {
      errorType = 'dns';
      errorMessage = 'DNS resolution failed - check internet connection';
    }
    
    res.status(500).json({
      error: errorMessage,
      type: errorType
    });
  }
});

// # Start the server
app.listen(PORT, () => {
  console.log(`🚀 Trade Assistant Proxy Server running on port ${PORT}`);
  console.log(`📊 Ready to securely proxy OpenAI requests`);
  console.log(`🔒 API key is safely stored server-side`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
    console.log('📝 Please create a .env file with your OpenAI API key');
  }
});

// # Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🔴 Shutting down Trade Assistant Proxy Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔴 Shutting down Trade Assistant Proxy Server...');
  process.exit(0);
}); 