window.onload = function () {

    let inpMin = document.getElementById("inp-pret-min");
    let inpMax = document.getElementById("inp-pret-max");
    let infoRange = document.getElementById("infoRange");
    let track = document.querySelector(".slider-track");

    function updateSlider() {

        let minVal = parseFloat(inpMin.value);
        let maxVal = parseFloat(inpMax.value);

        // corecție dacă se inversează
        if (minVal > maxVal) {
            [inpMin.value, inpMax.value] = [inpMax.value, inpMin.value];
            minVal = parseFloat(inpMin.value);
            maxVal = parseFloat(inpMax.value);
        }

        infoRange.innerHTML = `${minVal} - ${maxVal}`;

        let min = parseFloat(inpMin.min);
        let max = parseFloat(inpMin.max);

        let percentMin = ((minVal - min) / (max - min)) * 100;
        let percentMax = ((maxVal - min) / (max - min)) * 100;

        if (track) {
            track.style.background = `
    linear-gradient(
        to right,
        var(--fundal-light) 0%,
        var(--fundal-light) ${percentMin}%,
        var(--secundar-light) ${percentMin}%,
        var(--secundar-light) ${percentMax}%,
        var(--fundal-light) ${percentMax}%,
        var(--fundal-light) 100%
    )
`;
        }
    }

    inpMin.oninput = updateSlider;
    inpMax.oninput = updateSlider;

    updateSlider();


    document.getElementById("filtrare").onclick = function () {

        let inpNume =
            document.getElementById("inp-nume")
                .value
                .trim()
                .toLowerCase()

        let pretMin = parseFloat(inpMin.value);
        let pretMax = parseFloat(inpMax.value)

        let inpCategorie =
            document.getElementById("inp-categorie")
                .value
                .trim()
                .toLowerCase()

        let produse =
            document.getElementsByClassName("produs")

        for (let prod of produse) {

            prod.style.display = "none"

            let nume =
                prod.getElementsByClassName("val-nume")[0]
                    .innerHTML
                    .trim()
                    .toLowerCase()

            let cond1 = nume.includes(inpNume)

            let pret =
                parseFloat(
                    prod.getElementsByClassName("val-pret")[0]
                        .innerHTML
                        .trim()
                )

            let cond2 = pret >= pretMin && pret <= pretMax;

            let categorie =
                prod.getElementsByClassName("val-categorie")[0]
                    .innerHTML
                    .trim()
                    .toLowerCase()

            let cond3 =
                categorie == inpCategorie ||
                inpCategorie == "toate"

            if (cond1 && cond2 && cond3) {

                prod.style.display = "block"
            }
        }
    }

    function resetSlider() {
        let rangeMin = document.getElementById("inp-pret-min");
        let rangeMax = document.getElementById("inp-pret-max");

        let valMin = document.getElementById("valMin");
        let valMax = document.getElementById("valMax");

        let min = Number(rangeMin.min);
        let max = Number(rangeMax.max);

        rangeMin.value = min;
        rangeMax.value = max;

        valMin.textContent = min;
        valMax.textContent = max;

        infoRange.textContent = "";
    }
    document.getElementById("resetare").onclick = function () {

        document.getElementById("inp-nume").value = ""

        resetSlider();

        document.getElementById("inp-categorie").value = "toate"

        let produse =
            document.getElementsByClassName("produs")

        for (let prod of produse) {

            prod.style.display = "block"
        }
    }


    function sorteaza(semn) {

        let produse =
            document.getElementsByClassName("produs")

        let vProduse = Array.from(produse)

        vProduse.sort(function (a, b) {

            let pretA =
                parseFloat(
                    a.getElementsByClassName("val-pret")[0]
                        .innerHTML
                        .trim()
                )

            let pretB =
                parseFloat(
                    b.getElementsByClassName("val-pret")[0]
                        .innerHTML
                        .trim()
                )

            if (pretA == pretB) {

                let numeA =
                    a.getElementsByClassName("val-nume")[0]
                        .innerHTML
                        .trim()
                        .toLowerCase()

                let numeB =
                    b.getElementsByClassName("val-nume")[0]
                        .innerHTML
                        .trim()
                        .toLowerCase()

                return semn * numeA.localeCompare(numeB)
            }

            return semn * (pretA - pretB)
        })

        for (let prod of vProduse) {

            prod.parentElement.appendChild(prod)
        }
    }


    document.getElementById("sortCrescNume").onclick =
        function () {
            sorteaza(1)
        }

    document.getElementById("sortDescrescNume").onclick =
        function () {
            sorteaza(-1)
        }


    window.onkeydown = function (e) {

        if (e.key == "c" && e.altKey) {

            let produse =
                document.getElementsByClassName("produs")

            let suma = 0

            for (let prod of produse) {

                if (prod.style.display != "none") {

                    suma +=
                        parseFloat(
                            prod.getElementsByClassName("val-pret")[0]
                                .innerHTML
                                .trim()
                        )
                }
            }

            let p =
                document.getElementById("infoSuma")

            if (!p) {

                p = document.createElement("p")

                p.innerHTML = suma

                p.id = "infoSuma"

                let sectiuneProduse =
                    document.getElementById("produse")

                sectiuneProduse.parentElement
                    .insertBefore(p, sectiuneProduse)

                setTimeout(function () {

                    let p1 =
                        document.getElementById("infoSuma")

                    if (p1) {
                        p1.remove()
                    }

                }, 2000)

            } else {

                p.innerHTML = suma
            }
        }
    }

}