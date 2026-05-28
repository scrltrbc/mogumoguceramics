window.addEventListener("DOMContentLoaded", () => {
    let container = document.createElement("div");
    container.id = "container-comparare";
    container.style.cssText = "position:fixed; bottom:20px; right:20px; background:var(--bs-body-bg); border:2px solid #ccc; padding:15px; border-radius:10px; z-index:9999; display:none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";

    if(document.querySelector('.produs') || window.location.pathname.includes('/produs')) {
        document.body.appendChild(container);
    } else {
        return;
    }

    function renderUI() {
        let date = JSON.parse(localStorage.getItem("comparare") || '{"timestamp":0, "produse":[]}');

        if (Date.now() - date.timestamp > 86400000) {
            date.produse = [];
            localStorage.setItem("comparare", JSON.stringify(date));
        }

        let prods = date.produse;
        let butoane = document.querySelectorAll(".btn-comparare");

        if (prods.length === 0) {
            container.style.display = "none";
            butoane.forEach(b => { b.disabled = false; b.title = ""; });
            return;
        }

        container.style.display = "block";
        let html = "<h5 class='mb-2'>Compară</h5><ul class='list-group mb-2'>";

        prods.forEach((p, i) => {
            html += `<li class='list-group-item d-flex justify-content-between align-items-center p-2'>
                        ${p.nume} 
                        <button class='btn btn-sm btn-outline-danger ms-2 btn-sterge-comp' data-idx='${i}'>X</button>
                     </li>`;
        });
        html += "</ul>";

        if (prods.length === 2) {
            html += `<button id='btn-afiseaza-comp' class='btn btn-primary w-100'>Afișează Tabel</button>`;
            butoane.forEach(b => {
                b.disabled = true;
                b.title = "Ștergeți un produs din lista de comparare";
            });
        } else {
            butoane.forEach(b => {
                let exista = prods.find(pr => pr.id == b.dataset.id);
                b.disabled = !!exista;
                b.title = exista ? "Deja în listă" : "";
            });
        }

        container.innerHTML = html;

        document.querySelectorAll(".btn-sterge-comp").forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                let idx = e.target.dataset.idx;
                date.produse.splice(idx, 1);
                date.timestamp = Date.now();
                localStorage.setItem("comparare", JSON.stringify(date));
                renderUI();
            };
        });

        let btnAfiseaza = document.getElementById("btn-afiseaza-comp");
        if (btnAfiseaza) {
            btnAfiseaza.onclick = () => {
                let p1 = date.produse[0];
                let p2 = date.produse[1];
                let w = window.open("", "_blank", "width=700,height=500");
                w.document.write(`
                    <html><head><title>Comparare Produse</title>
                    <style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:12px; text-align:center;}</style>
                    </head><body>
                    <h2>Comparație: ${p1.nume} vs ${p2.nume}</h2>
                    <table>
                        <tr><th>Proprietate</th><th>${p1.nume}</th><th>${p2.nume}</th></tr>
                        <tr><td>Preț</td><td>${p1.pret} lei</td><td>${p2.pret} lei</td></tr>
                        <tr><td>Categorie</td><td>${p1.categorie}</td><td>${p2.categorie}</td></tr>
                    </table></body></html>
                `);
                w.document.close();
            };
        }
    }

    document.querySelectorAll(".btn-comparare").forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            let date = JSON.parse(localStorage.getItem("comparare") || '{"timestamp":0, "produse":[]}');
            if (date.produse.length < 2) {
                date.produse.push({
                    id: btn.dataset.id,
                    nume: btn.dataset.nume,
                    pret: btn.dataset.pret,
                    categorie: btn.dataset.categorie
                });
                date.timestamp = Date.now();
                localStorage.setItem("comparare", JSON.stringify(date));
                renderUI();
            }
        };
    });

    renderUI();
});