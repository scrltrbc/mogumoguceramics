const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const pg = require("pg");

app= express();
app.set("view engine", "ejs")

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

client=new pg.Client({
    database:"cti_2026",
    user:"rebeca",
    password:"rebeca",
    host:"localhost",
    port:5432
})

client.connect()

client.query("select * from prajituri where id>3", function(err, rez){
    if (err){
        console.log("Eroare", err)
    }
    else{
        console.log(rez)
    }
})

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});
    }
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

function verificaErori(){
    let cale = path.join(__dirname,"resurse/json/erori.json");

    if (!fs.existsSync(cale)){
        console.error("Eroare grava: fisierul erori.json nu exista!");
        process.exit();
    }

    let text = fs.readFileSync(cale).toString("utf-8");

    let linii = text.split("\n");
    for (let linie of linii){
        let match = linie.match(/\"(.*?)\"\s*:/g);
        if (match){
            let set = new Set();
            for (let m of match){
                if (set.has(m)){
                    console.error("Proprietate duplicata:", m, "in linia:", linie);
                }
                set.add(m);
            }
        }
    }

    let ob;
    try{
        ob = JSON.parse(text);
    } catch(e){
        console.error("JSON invalid!");
        return;
    }

    if (!ob.info_erori || !ob.cale_baza || !ob.eroare_default){
        console.error("Lipsesc proprietati principale (info_erori / cale_baza / eroare_default)");
    }

    let ed = ob.eroare_default;
    if (!ed.titlu || !ed.text || !ed.imagine){
        console.error("Eroarea default nu are toate campurile!");
    }

    if (!fs.existsSync(ob.cale_baza)){
        console.error("Folderul de imagini nu exista:", ob.cale_baza);
    }

    for (let eroare of ob.info_erori){
        let caleImg = path.join(ob.cale_baza, eroare.imagine);
        if (!fs.existsSync(caleImg)){
            console.error("Imagine lipsa pentru eroare:", eroare.identificator, caleImg);
        }
    }

    let mapId = {};
    for (let eroare of ob.info_erori){
        if (mapId[eroare.identificator]){
            console.error("Identificator duplicat:", eroare.identificator);
            console.error("Eroare conflict:", eroare);
        }
        mapId[eroare.identificator] = true;
    }
}
verificaErori();

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori();

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"))
});

app.get(["/", "/index","/home"], function(req, res){
    res.render("pagini/index", {
        ip: req.ip
    });
});

app.get("/despre", function(req, res){
    res.render("pagini/despre");
});


function afisareEroare(res, identificator, titlu, text, imagine){
    //TO DO cautam eroarea dupa identificator
    let eroare= obGlobal.obErori.info_erori.find((elem) =>
        elem.identificator == identificator
    )
    //daca sunt setate titlu, text, imagine, le folosim,
    //altfel folosim cele din fisierul json pentru eroarea gasita
    //daca nu o gasim, afisam eroarea default
    let errDefault= obGlobal.obErori.eroare_default;
    if(eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });

}

app.get("/eroare", function(req, res){
    afisareEroare(res,404, "Titlu!!!")
});

app.get("/produse", function(req, res){
    let clauzaWhere=""
    if (req.query.tip)
        clauzaWhere=`where tip_produs='${req.query.tip}'`
    client.query(`select * from prajituri ${clauzaWhere}`, function(err, rez){
        if (err){
            console.log("Eroare", err)
            afisareEroare(res,2)
        }
        else{
            res.render("pagini/produse",{
                produse:rez.rows,
                optiuni:[]
            })
        }
    })
})


app.get("/produs/:id", function(req, res){
    client.query(`select * from prajituri where id=${req.params.id}`, function(err, rez){
        if (err){
            console.log("Eroare", err)
            afisareEroare(res,2)
        }
        else{
            if (rez.rowCount==0){
                afisareEroare(res,404,"Produs inexistent")
            }
            else{
                res.render("pagini/produs",{
                    prod:rez.rows[0],
                })
            }

        }
    })
})

// app.get("/eroare", function(req, res){
//     res.render("pagini/eroare",{
//         imagine: obGlobal.obErori.eroare_default.imagine,
//         titlu: obGlobal.obErori.eroare_default.titlu,
//         text: obGlobal.obErori.eroare_default.text,
//     });
// });

//app.get("*/galerie-animata.css",function(req, res){

//     var sirScss=fs.readFileSync(path.join(__dirname,"resurse/scss_ejs/galerie_animata.scss")).toString("utf8");
//     var culori=["navy","black","purple","grey"];
//     var indiceAleator=Math.floor(Math.random()*culori.length);
//     var culoareAleatoare=culori[indiceAleator];
//     rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
//     console.log(rezScss);
//     var caleScss=path.join(__dirname,"temp/galerie_animata.scss")
//     fs.writeFileSync(caleScss,rezScss);
//     try {
//         rezCompilare=sass.compile(caleScss,{sourceMap:true});

//         var caleCss=path.join(__dirname,"temp/galerie_animata.css");
//         fs.writeFileSync(caleCss,rezCompilare.css);
//         res.setHeader("Content-Type","text/css");
//         res.sendFile(caleCss);
//     }
//     catch (err){
//         console.log(err);
//         res.send("Eroare");
//     }
// });

// app.get("*/galerie-animata.css.map",function(req, res){
//     res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
// });

    // function initImagini(){
    //     var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");
    //
    //     obGlobal.obImagini=JSON.parse(continut);
    //     let vImagini=obGlobal.obImagini.imagini;
    //     let caleGalerie=obGlobal.obImagini.cale_galerie
    //
    //     let caleAbs=path.join(__dirname,caleGalerie);
    //     let caleAbsMediu=path.join(caleAbs, "mediu");
    //     if (!fs.existsSync(caleAbsMediu))
    //         fs.mkdirSync(caleAbsMediu);
    //
    //     for (let imag of vImagini){
    //         [numeFis, ext]=imag.fisier.split("."); //"ceva.png" -> ["ceva", "png"]
    //         let caleFisAbs=path.join(caleAbs,imag.fisier);
    //         let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
    //         sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
    //         imag.fisier_mediu=path.join("/", caleGalerie, "mediu", numeFis+".webp" )
    //         imag.fisier=path.join("/", caleGalerie, imag.fisier )
    //
    //     }
    //     // console.log(obGlobal.obImagini)
    // }
    // initImagini();

function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true, quietDeps:true});
    fs.writeFileSync(caleCss,rez.css)

}

vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404)
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
                console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});

try {
    rez = sass.compile(caleScss, {
        sourceMap: true,
        quietDeps: true
    });

    fs.writeFileSync(caleCss, rez.css);

} catch (err) {
    console.log("Eroare SCSS:", err.message);
}

app.listen(8080);
console.log("Serverul a pornit!");

// GRANT ALL PRIVILEGES ON DATABASE cti_2026 TO rebeca ;
// GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rebeca;
// GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rebeca;