 function preiaOferta() {
    fetch('/api/oferta').then(r => r.json()).then(oferta => {
        let container = document.getElementById('container-oferta');
        if (!oferta) {
            container.style.display = 'none';
            setTimeout(preiaOferta, 5000);
            return;
        }
        container.style.display = 'block';
        pornesteTemporizator(oferta);
    });
}

    let timerInterval;

    function pornesteTemporizator(oferta) {
    clearInterval(timerInterval);
    let container = document.getElementById('container-oferta');

    timerInterval = setInterval(() => {
    let now = Date.now();
    let diff = Math.floor((oferta["data-finalizare"] - now) / 1000);

    if (diff <= 0) {
    clearInterval(timerInterval);
    preiaOferta();
    return;
}

    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;

    let culoare = diff <= 10 ? 'red' : 'inherit';
    let fw = diff <= 10 ? 'bold' : 'normal';

    container.innerHTML = `
                <h4>Ofertă Fulger: -${oferta.reducere}% la produsele din categoria <b>${oferta.categorie}</b></h4>
                <p style="color:${culoare}; font-weight:${fw}; margin:0;">Expiră în: ${h}h ${m}m ${s}s</p>
            `;
}, 1000);
}

    window.addEventListener('DOMContentLoaded', preiaOferta);
