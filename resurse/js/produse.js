window.onload = function () {

    // ---------------- SLIDER DUBLU PRET ----------------

    let inpMin = document.getElementById("inp-pret-min");
    let inpMax = document.getElementById("inp-pret-max");

    let infoRange = document.getElementById("infoRange");

    function updateSlider() {

        let minVal = parseFloat(inpMin.value);
        let maxVal = parseFloat(inpMax.value);

        if (minVal > maxVal) {
            [minVal, maxVal] = [maxVal, minVal];

            inpMin.value = minVal;
            inpMax.value = maxVal;
        }

        infoRange.innerHTML = `${minVal} - ${maxVal}`;
    }

    inpMin.oninput = updateSlider;
    inpMax.oninput = updateSlider;

    updateSlider();



    // ---------------- FILTRARE ----------------

    function aplicaFiltre() {

        let inpNume =
            document.getElementById("inp-nume")
                .value
                .trim()
                .toLowerCase();



        let pretMin =
            parseFloat(inpMin.value);

        let pretMax =
            parseFloat(inpMax.value);



        let inpCategorie =
            document.getElementById("inp-categorie")
                .value
                .trim()
                .toLowerCase();



        let inpMaterial =
            document.getElementById("inp-material")
                .value
                .trim()
                .toLowerCase();



        let inpDescriere =
            document.getElementById("inp-descriere")
                .value
                .trim()
                .toLowerCase();



        // RADIO CULOARE

        let valCuloare = "toate";

        let radCuloare =
            document.getElementsByName("gr_culoare");

        for (let r of radCuloare) {

            if (r.checked) {

                valCuloare = r.value
                    .trim()
                    .toLowerCase();

                break;
            }
        }



        // CHECKBOX PERSONALIZABIL

        let doarPersonalizabile =
            document.getElementById("inp-personalizabil")
                .checked;



        // SELECT MULTIPLU PRET

        let selectMultiplu =
            document.getElementById("inp-preturi");

        let optiuniSelectate =
            Array.from(selectMultiplu.selectedOptions);

        let intervale = [];

        for (let opt of optiuniSelectate) {

            intervale.push(
                opt.value.split(":")
            );
        }



        // PRODUSE

        let produse =
            document.getElementsByClassName("produs");



        for (let prod of produse) {

            prod.style.display = "none";



            // NUME

            let nume =
                prod.getElementsByClassName("val-nume")[0]
                    ?.innerHTML
                    .trim()
                    .toLowerCase() || "";

            let cond1 =
                nume.includes(inpNume);



            // PRET

            let pret =
                parseFloat(
                    prod.getElementsByClassName("val-pret")[0]
                        ?.innerHTML
                        .trim()
                ) || 0;

            let cond2 =
                pret >= pretMin
                && pret <= pretMax;



            // CATEGORIE

            let categorie =
                prod.getElementsByClassName("val-categorie")[0]
                    ?.innerHTML
                    .trim()
                    .toLowerCase() || "";

            let cond3 =
                categorie == inpCategorie
                || inpCategorie == "toate";



            // MATERIAL

            let materiale =
                prod.getElementsByClassName("val-materiale")[0]
                    ?.innerHTML
                    .trim()
                    .toLowerCase() || "";

            let cond4 =
                materiale.includes(inpMaterial);



            let descriere =
                prod.getElementsByClassName("val-descriere")[0]
                    ?.innerHTML
                    .trim()
                    .toLowerCase() || "";



            let tokens =
                inpDescriere.split(/\s+/);

            let cuvintePlus = [];
            let cuvinteMinus = [];

            for (let tok of tokens) {

                tok = tok.trim();

                if (tok.startsWith("+")) {

                    cuvintePlus.push(
                        tok.substring(1)
                    );
                }

                else if (tok.startsWith("-")) {

                    cuvinteMinus.push(
                        tok.substring(1)
                    );
                }
            }



// CONDITIE PLUS
// trebuie sa existe MACAR UNUL

            let condPlus = true;

            if (cuvintePlus.length > 0) {

                condPlus = false;

                for (let cuv of cuvintePlus) {

                    if (
                        cuv != "" &&
                        descriere.includes(cuv)
                    ) {

                        condPlus = true;
                        break;
                    }
                }
            }



// CONDITIE MINUS
// nu trebuie sa existe NICIUNUL

            let condMinus = true;

            for (let cuv of cuvinteMinus) {

                if (
                    cuv != "" &&
                    descriere.includes(cuv)
                ) {

                    condMinus = false;
                    break;
                }
            }



            let cond5 =
                condPlus &&
                condMinus;



            // CULOARE

            let culoare =
                prod.getElementsByClassName("val-culoare")[0]
                    ?.innerHTML
                    .trim()
                    .toLowerCase() || "";

            let cond6 =
                culoare == valCuloare
                || valCuloare == "toate";



            // PERSONALIZABIL

            let personalizabil =
                prod.getElementsByClassName("val-personalizabil")[0]
                    ?.innerHTML
                    .trim()
                    .toLowerCase() || "";

            let cond7 =
                !doarPersonalizabile
                || personalizabil == "da";



            // SELECT MULTIPLU PRET

            let cond8 = true;

            if (intervale.length > 0) {

                cond8 = false;

                for (let interval of intervale) {

                    let min =
                        parseFloat(interval[0]);

                    let max =
                        parseFloat(interval[1]);

                    if (
                        pret >= min
                        && pret <= max
                    ) {

                        cond8 = true;
                    }
                }
            }



            // AFISARE

            if (
                cond1
                && cond2
                && cond3
                && cond4
                && cond5
                && cond6
                && cond7
                && cond8
            ) {

                prod.style.display = "block";
            }
        }
    }



    // ---------------- EVENT FILTRARE ----------------

    document.getElementById("filtrare")
        .onclick = aplicaFiltre;



    // BONUS 4: FILTRARE onchange

    document.getElementById("inp-nume")
        .oninput = aplicaFiltre;

    document.getElementById("inp-categorie")
        .onchange = aplicaFiltre;

    document.getElementById("inp-material")
        .oninput = aplicaFiltre;

    document.getElementById("inp-descriere")
        .oninput = aplicaFiltre;

    document.getElementById("inp-personalizabil")
        .onchange = aplicaFiltre;

    inpMin.onchange = aplicaFiltre;
    inpMax.onchange = aplicaFiltre;



    let radioCulori =
        document.getElementsByName("gr_culoare");

    for (let r of radioCulori) {

        r.onchange = aplicaFiltre;
    }



    document.getElementById("inp-preturi")
        .onchange = aplicaFiltre;



    // ---------------- RESETARE ----------------

    document.getElementById("resetare").onclick =
        function () {

            // INPUT TEXT

            document.getElementById("inp-nume").value =
                "";



            // RANGE DUBLU

            let inpMin =
                document.getElementById("inp-pret-min");

            let inpMax =
                document.getElementById("inp-pret-max");

            inpMin.value = inpMin.min;
            inpMax.value = inpMax.max;

            updateSlider();



            // SELECT CATEGORIE

            document.getElementById("inp-categorie").value =
                "toate";



            // DATALIST MATERIAL

            document.getElementById("inp-material").value =
                "";



            // RADIO CULOARE

            let radioToate =
                document.querySelector(
                    'input[name="gr_culoare"][value="toate"]'
                );

            if (radioToate) {

                radioToate.checked = true;
            }



            // CHECKBOX PERSONALIZABIL

            document.getElementById(
                "inp-personalizabil"
            ).checked = false;



            // TEXT-AREA

            document.getElementById("inp-descriere").value = "";


            // SELECT MULTIPLU PRETURI

            let selectPreturi =
                document.getElementById("inp-preturi");

            for (let opt of selectPreturi.options) {

                opt.selected = false;
            }



            // AFISARE TOATE PRODUSELE

            let produse =
                document.querySelectorAll(".produs");

            for (let prod of produse) {

                prod.style.display = "";
            }
        }


    function sorteaza(semn) {

        let produse =
            Array.from(
                document.getElementsByClassName("produs")
            );



        produse.sort(function (a, b) {

            let pretA =
                parseFloat(
                    a.getElementsByClassName("val-pret")[0]
                        ?.innerHTML
                ) || 0;

            let pretB =
                parseFloat(
                    b.getElementsByClassName("val-pret")[0]
                        ?.innerHTML
                ) || 0;



            if (pretA == pretB) {

                let numeA =
                    a.getElementsByClassName("val-nume")[0]
                        ?.innerHTML
                        .trim()
                        .toLowerCase() || "";

                let numeB =
                    b.getElementsByClassName("val-nume")[0]
                        ?.innerHTML
                        .trim()
                        .toLowerCase() || "";

                return semn *
                    numeA.localeCompare(numeB);
            }



            return semn * (pretA - pretB);
        });



        let container =
            document.querySelector(".grid-produse");



        for (let prod of produse) {

            container.appendChild(prod);
        }
    }



    document.getElementById("sortCrescNume")
        .onclick = function () {

        sorteaza(1);
    };



    document.getElementById("sortDescrescNume")
        .onclick = function () {

        sorteaza(-1);
    };



    // ---------------- SUMA ALT + C ----------------

    window.onkeydown = function (e) {

        if (e.key == "c" && e.altKey) {

            let produse =
                document.getElementsByClassName("produs");

            let suma = 0;



            for (let prod of produse) {

                if (prod.style.display != "none") {

                    suma +=
                        parseFloat(
                            prod.getElementsByClassName("val-pret")[0]
                                ?.innerHTML
                        ) || 0;
                }
            }



            let p =
                document.getElementById("infoSuma");



            if (!p) {

                p = document.createElement("p");

                p.id = "infoSuma";

                let sectiuneProduse =
                    document.getElementById("produse");

                sectiuneProduse.parentElement
                    .insertBefore(
                        p,
                        sectiuneProduse
                    );



                setTimeout(function () {

                    let p1 =
                        document.getElementById("infoSuma");

                    if (p1) {

                        p1.remove();
                    }

                }, 2000);
            }



            p.innerHTML =
                "Suma produselor afisate: "
                + suma
                + " lei";
        }
    };

    let modal = document.getElementById("modal-produs");
    let btnInchide = document.getElementById("btn-inchide-modal");

    if (modal) {
        document.querySelectorAll(".produs img").forEach(img => {
            img.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();

                let articolProdus = this.closest('.produs');
                if (!articolProdus) return;

                let clone = articolProdus.cloneNode(true);

                let compBtn = clone.querySelector('.btn-comparare');
                if(compBtn) compBtn.remove();

                let link = clone.querySelector('a');
                if(link) link.removeAttribute('href');

                document.getElementById("continut-modal").innerHTML = "";
                document.getElementById("continut-modal").appendChild(clone);

                modal.showModal();
            });
        });

        if (btnInchide) {
            btnInchide.addEventListener("click", () => modal.close());
        }

        modal.addEventListener("click", (e) => {
            let rect = modal.getBoundingClientRect();
            let inDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!inDialog) {
                modal.close();
            }
        });
    }

}