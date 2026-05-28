const express = require("express");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const pg = require("pg");
const sharp = require("sharp");

app = express();
app.set("view engine", "ejs")

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

client = new pg.Client({
    database: "cti_2026",
    user: "rebeca",
    password: "rebeca",
    host: "localhost",
    port: 5432
})

client.connect()

// BONUS 12 : SISTEM OFERTE
let categoriiDb = [];
client.query("select unnest(enum_range(null::categ_produs)) as unnest", function(err, rez) {
    if(!err) categoriiDb = rez.rows.map(r => r.unnest);
});

const pathOferte = path.join(__dirname, "resurse/json/oferte.json");
const T_OFERTA = 120 * 1000;
const T2_CURATARE = 600 * 1000;

setInterval(() => {
    if (categoriiDb.length === 0) return;

    let oferteData = { oferte: [] };
    if (fs.existsSync(pathOferte)) {
        try { oferteData = JSON.parse(fs.readFileSync(pathOferte, "utf-8")); } catch(e){}
    }

    let categIdx = Math.floor(Math.random() * categoriiDb.length);
    let categ = categoriiDb[categIdx];

    if (oferteData.oferte.length > 0 && oferteData.oferte[0].categorie === categ) {
        categ = categoriiDb[(categIdx + 1) % categoriiDb.length];
    }

    let reduceri = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    let reducere = reduceri[Math.floor(Math.random() * reduceri.length)];
    let now = Date.now();

    oferteData.oferte.unshift({
        categorie: categ,
        "data-incepere": now,
        "data-finalizare": now + T_OFERTA,
        reducere: reducere
    });

    oferteData.oferte = oferteData.oferte.filter(o => (now - o["data-finalizare"]) < T2_CURATARE);
    fs.writeFileSync(pathOferte, JSON.stringify(oferteData, null, 2));
}, T_OFERTA);


app.get("/api/oferta", (req, res) => {
    if (fs.existsSync(pathOferte)) {
        try {
            let oferteData = JSON.parse(fs.readFileSync(pathOferte, "utf-8"));
            if (oferteData.oferte.length > 0 && oferteData.oferte[0]["data-finalizare"] > Date.now()) {
                return res.json(oferteData.oferte[0]);
            }
        } catch(e){}
    }
    res.json(null);
});

client.query("select * from produse where id>3", function (err, rez) {
    if (err) {
        console.log("Eroare", err)
    } else {
        console.log(rez)
    }
})

let vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"]
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive: true});
    }
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

function verificaErori() {
    let cale = path.join(__dirname, "resurse/json/erori.json");

    if (!fs.existsSync(cale)) {
        console.error("Eroare grava: fisierul erori.json nu exista!");
        process.exit();
    }

    let text = fs.readFileSync(cale).toString("utf-8");

    let linii = text.split("\n");
    for (let linie of linii) {
        let match = linie.match(/\"(.*?)\"\s*:/g);
        if (match) {
            let set = new Set();
            for (let m of match) {
                if (set.has(m)) {
                    console.error("Proprietate duplicata:", m, "in linia:", linie);
                }
                set.add(m);
            }
        }
    }

    let ob;
    try {
        ob = JSON.parse(text);
    } catch (e) {
        console.error("JSON invalid!");
        return;
    }

    if (!ob.info_erori || !ob.cale_baza || !ob.eroare_default) {
        console.error("Lipsesc proprietati principale (info_erori / cale_baza / eroare_default)");
    }

    let ed = ob.eroare_default;
    if (!ed.titlu || !ed.text || !ed.imagine) {
        console.error("Eroarea default nu are toate campurile!");
    }

    if (!fs.existsSync(ob.cale_baza)) {
        console.error("Folderul de imagini nu exista:", ob.cale_baza);
    }

    for (let eroare of ob.info_erori) {
        let caleImg = path.join(ob.cale_baza, eroare.imagine);
        if (!fs.existsSync(caleImg)) {
            console.error("Imagine lipsa pentru eroare:", eroare.identificator, caleImg);
        }
    }

    let mapId = {};
    for (let eroare of ob.info_erori) {
        if (mapId[eroare.identificator]) {
            console.error("Identificator duplicat:", eroare.identificator);
            console.error("Eroare conflict:", eroare);
        }
        mapId[eroare.identificator] = true;
    }
}

verificaErori();

function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    let erori = obGlobal.obErori = JSON.parse(continut)
    let err_default = erori.eroare_default
    err_default.imagine = path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori) {
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine)
    }

}

initErori();

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
});

app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {
        ip: req.ip,
        imagini: obGlobal.obImagini.imagini
    });
});

app.get("/despre", function (req, res) {
    res.render("pagini/despre");
});

app.get("/galerie", function (req, res) {
    res.render("pagini/galerie", {
        imagini: obGlobal.obImagini.imagini
    });
});

function afisareEroare(res, identificator, titlu, text, imagine) {
    //TO DO cautam eroarea dupa identificator
    let eroare = obGlobal.obErori.info_erori.find((elem) =>
        elem.identificator == identificator
    )
    //daca sunt setate titlu, text, imagine, le folosim,
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
    let errDefault = obGlobal.obErori.eroare_default;
    if (eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });

}

app.get("/eroare", function (req, res) {
    afisareEroare(res, 404, "Titlu!!!")
});

app.get("/produse", function (req, res) {

    let queryProduse = "select * from produse";

    let queryCategorii = `
        select unnest(enum_range(null::categ_produs)) as unnest
    `;
    let queryCulori = `
        select distinct culoare
        from produse
        order by culoare
    `;
    let queryMateriale = `select distinct unnest(materiale) as material from produse`;
    client.query(queryProduse, function (err, rezProduse) {

        if (err) {
            console.log(err);
            return;
        }

        let produse = rezProduse.rows;

        let preturi = produse.map(p => parseFloat(p.pret));

        let pretMin = Math.min(...preturi);
        let pretMax = Math.max(...preturi);

        let ofertaActiva = null;
        if (fs.existsSync(pathOferte)) {
            try {
                let oferteData = JSON.parse(fs.readFileSync(pathOferte, "utf-8"));
                if (oferteData.oferte.length > 0 && oferteData.oferte[0]["data-finalizare"] > Date.now()) {
                    ofertaActiva = oferteData.oferte[0];
                }
            } catch(e){
                console.log("Eroare la citirea json-ului de oferte:", e);
            }
        }

        client.query(queryCategorii, function (err, rezCategorii) {

            if (err) {
                console.log(err);
                return;
            }

                client.query(
                    queryCulori,
                    function(err, rezCulori){

                        if(err){
                            console.log(err);
                            return;
                        }

                        client.query(
                            queryMateriale,
                            function(err, rezMateriale){

                                if(err){
                                    console.log(err);
                                    return;
                                }

                                res.render(
                                    "pagini/produse",
                                    {
                                        produse: rezProduse.rows,
                                        optiuni: rezCategorii.rows,
                                        culori: rezCulori.rows,
                                        materiale: rezMateriale.rows,
                                        ofertaActiva: ofertaActiva,
                                        pretMin: pretMin,
                                        pretMax: pretMax
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
        }
    );
});

app.get("/seturi", function (req, res) {
    let querySeturi = `
        SELECT s.id AS set_id, s.nume_set, s.descriere_set,
               p.id AS produs_id, p.denumire, p.imagine, p.pret, p.categorie
        FROM seturi s
        JOIN asociere_set asoc ON s.id = asoc.id_set
        JOIN produse p ON asoc.id_produs = p.id
        ORDER BY s.id, p.denumire;
    `;

    client.query(querySeturi, function (err, rez) {
        if (err) {
            console.error("Eroare SQL Seturi:", err);
            return res.status(500).send("Eroare server baze de date");
        }

        let seturiMap = {};
        rez.rows.forEach(row => {
            if (!seturiMap[row.set_id]) {
                seturiMap[row.set_id] = {
                    id: row.set_id,
                    nume: row.nume_set,
                    descriere: row.descriere_set,
                    produse: []
                };
            }
            seturiMap[row.set_id].produse.push({
                id: row.produs_id,
                denumire: row.denumire,
                imagine: row.imagine,
                pret: parseFloat(row.pret)
            });
        });

        let listaSeturi = Object.values(seturiMap);

        listaSeturi.forEach(set => {
            let n = set.produse.length;
            let sumaPreturi = set.produse.reduce((sum, prod) => sum + prod.pret, 0);
            let procentReducere = Math.min(5, n) * 5;

            set.sumaPreturi = sumaPreturi.toFixed(2);
            set.pretFinal = (sumaPreturi * (1 - procentReducere / 100)).toFixed(2);
            set.procentReducere = procentReducere;
        });

        res.render("pagini/seturi", { seturi: listaSeturi });
    });
});

app.get("/produs/:id", function (req, res) {
    let idProdus = req.params.id;

    let queryProdus = "SELECT * FROM produse WHERE id = $1";

    let querySeturiProdus = `
        SELECT s.id AS set_id, s.nume_set, s.descriere_set,
               p.id AS produs_id, p.denumire, p.imagine, p.pret
        FROM seturi s
        JOIN asociere_set asoc_curent ON s.id = asoc_curent.id_set AND asoc_curent.id_produs = $1
        JOIN asociere_set asoc_toate ON s.id = asoc_toate.id_set
        JOIN produse p ON asoc_toate.id_produs = p.id
        ORDER BY s.id;
    `;

    client.query(queryProdus, [idProdus], function (err, rezProdus) {
        if (err || rezProdus.rows.length === 0) {
            return res.status(404).send("Produsul nu a fost găsit");
        }

        let produs = rezProdus.rows[0];

        client.query(querySeturiProdus, [idProdus], function (err, rezSeturi) {
            if (err) {
                console.error(err);
                return res.status(500).send("Eroare server");
            }

            let seturiMap = {};
            rezSeturi.rows.forEach(row => {
                if (!seturiMap[row.set_id]) {
                    seturiMap[row.set_id] = {
                        id: row.set_id,
                        nume: row.nume_set,
                        descriere: row.descriere_set,
                        produse: []
                    };
                }
                seturiMap[row.set_id].produse.push({
                    id: row.produs_id,
                    denumire: row.denumire,
                    imagine: row.imagine,
                    pret: parseFloat(row.pret)
                });
            });

            let listaSeturi = Object.values(seturiMap);

            listaSeturi.forEach(set => {
                let n = set.produse.length;
                let sumaPreturi = set.produse.reduce((sum, p) => sum + p.pret, 0);
                let procentReducere = Math.min(5, n) * 5;
                set.pretFinal = (sumaPreturi * (1 - procentReducere / 100)).toFixed(2);
            });

            res.render("pagini/produs", {
                prod: produs,
                seturiAsociate: listaSeturi
            });
        });
    });
});

    function initImagini() {
        let continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");

        obGlobal.obImagini = JSON.parse(continut);
        let vImagini = obGlobal.obImagini.imagini;
        let caleGalerie = obGlobal.obImagini.cale_galerie

        let caleAbs = path.join(__dirname, caleGalerie);
        let caleAbsMediu = path.join(caleAbs, "mediu");
        if (!fs.existsSync(caleAbsMediu))
            fs.mkdirSync(caleAbsMediu);
        let caleMic = path.join(caleAbs, "mic");
        if (!fs.existsSync(caleMic))
            fs.mkdirSync(caleMic);

        let luni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie"];
        let lunaCurenta = luni[new Date().getMonth()];
        let imaginiFiltrate = [];
        for (let imag of vImagini) {
            if (imag.luni && imag.luni.includes(lunaCurenta)) {
                [numeFis, ext] = imag.fisier.split("."); //"ceva.png" -> ["ceva", "png"]
                let caleFisAbs = path.join(caleAbs, imag.fisier);
                let caleMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
                let caleMicAbs = path.join(caleMic, numeFis + ".webp");
                if (!fs.existsSync(caleMediuAbs)) {
                    sharp(caleFisAbs)
                        .resize(300)
                        .toFile(caleMediuAbs);
                }
                if (!fs.existsSync(caleMicAbs)) {
                    sharp(caleFisAbs)
                        .resize(200)
                        .toFile(caleMicAbs);
                }
                imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp")
                imag.fisier_mediu = path.join("/", caleGalerie, "mic", numeFis + ".webp")
                imag.fisier = path.join("/", caleGalerie, imag.fisier)
                imaginiFiltrate.push(imag);
            }
        }
        imaginiFiltrate = imaginiFiltrate.slice(0, 12);
        obGlobal.obImagini.imagini = imaginiFiltrate;
        console.log(obGlobal.obImagini)
    }

    initImagini();

    function compileazaScss(caleScss, caleCss) {
        if (!caleCss) {

            let numeFisExt = path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
            let numeFis = numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
            caleCss = numeFis + ".css"; // output: a.css
        }

        if (!path.isAbsolute(caleScss))
            caleScss = path.join(obGlobal.folderScss, caleScss)
        if (!path.isAbsolute(caleCss))
            caleCss = path.join(obGlobal.folderCss, caleCss)

        let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
        if (!fs.existsSync(caleBackup)) {
            fs.mkdirSync(caleBackup, {recursive: true})
        }

        // la acest punct avem cai absolute in caleScss si  caleCss

        let numeFisCss = path.basename(caleCss);
        if (fs.existsSync(caleCss)) {
            let timestamp = Date.now();
            try {
                fs.copyFileSync(
                    caleCss,
                    path.join(caleBackup, `${numeFisCss}_${timestamp}`)
                );

                console.log("Backup realizat pentru:", numeFisCss);

            } catch (err) {
                console.log("Eroare la copierea backup-ului:", err);
            }
        }

        try {
            let rez = sass.compile(caleScss, {sourceMap: true, quietDeps: true});

            fs.writeFileSync(caleCss, rez.css);

        } catch (err) {
            console.log("Eroare SCSS:", err.message);
        }

    }

    vFisiere = fs.readdirSync(obGlobal.folderScss);
    for (let numeFis of vFisiere) {
        if (path.extname(numeFis) === ".scss") {
            compileazaScss(numeFis);
        }
    }


    fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {

        if (!numeFis)
            return;

        if (path.extname(numeFis) !== ".scss")
            return;

        if (eveniment == "change" || eveniment == "rename") {
            let caleCompleta = path.join(obGlobal.folderScss, numeFis);
            if (fs.existsSync(caleCompleta)) {
                compileazaScss(caleCompleta);
            }
        }
    });

    app.get("/*pagina", function (req, res) {
        console.log("Cale pagina", req.url);
        if (req.url.startsWith("/resurse") && path.extname(req.url) == "") {
            afisareEroare(res, 403);
            return;
        }
        if (path.extname(req.url) == ".ejs") {
            afisareEroare(res, 400);
            return;
        }
        try {
            res.render("pagini" + req.url, function (err, rezRandare) {
                if (err) {
                    if (err.message.includes("Failed to lookup view")) {
                        afisareEroare(res, 404)
                    } else {
                        afisareEroare(res);
                    }
                } else {
                    res.send(rezRandare);
                    console.log("Rezultat randare", rezRandare);
                }
            });
        } catch (err) {
            if (err.message.includes("Cannot find module")) {
                afisareEroare(res, 404)
            } else {
                afisareEroare(res);
            }
        }
    });


    app.listen(8080);
    console.log("Serverul a pornit!");

// GRANT ALL PRIVILEGES ON DATABASE cti_2026 TO rebeca ;
// GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rebeca;
// GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rebeca;