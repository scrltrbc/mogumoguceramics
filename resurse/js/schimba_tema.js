window.addEventListener("DOMContentLoaded", function(){
    let btnTema = document.getElementById("schimba_tema");
    let iconTema = document.querySelector("#icon_tema i");

    if(document.body.classList.contains("dark")){
        btnTema.checked = true;
        if (iconTema) {
            iconTema.classList.remove("bi-moon-fill", "text-buton");
            iconTema.classList.add("bi-sun-fill", "text-buton");
        }
    } else {
        btnTema.checked = false;
        if (iconTema) {
            iconTema.classList.remove("bi-sun-fill", "text-buton");
            iconTema.classList.add("bi-moon-fill", "text-buton");
        }
    }

    btnTema.onclick = function(){
        if(document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            localStorage.removeItem("tema");

            if (iconTema) {
                iconTema.classList.remove("bi-sun-fill", "text-buton");
                iconTema.classList.add("bi-moon-fill", "text-buton");
            }
        }
        else{
            document.body.classList.add("dark");
            localStorage.setItem("tema","dark");

            if (iconTema) {
                iconTema.classList.remove("bi-moon-fill", "text-buton");
                iconTema.classList.add("bi-sun-fill", "text-buton");
            }
        }
    }
});