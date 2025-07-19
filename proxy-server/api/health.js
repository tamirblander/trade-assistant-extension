// proxy-server/api/health.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'OK', message: 'Trade Assistant Proxy Server is running' });
} 