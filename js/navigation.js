/*************************************************
 * DARKENSHORNS
 * NAVIGATION
 *************************************************/


/**
 * Marca el enlace activo.
 */
export function setActiveNavigation() {


    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");


    const links = document.querySelectorAll(
        ".main-nav a"
    );


    links.forEach(link => {


        const href = link
            .getAttribute("href")
            ?.split("/")
            .pop()
            ?.replace(".html", "");


        if (href === currentPage) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");

        }


    });


}



/**
 * Scroll suave para enlaces internos.
 */
export function enableSmoothScroll() {


    const links = document.querySelectorAll(
        'a[href^="#"]'
    );


    links.forEach(link => {


        link.addEventListener(
            "click",
            event => {


                const target =
                document.querySelector(
                    link.getAttribute("href")
                );


                if (target) {


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior: "smooth"

                    });


                }


            }

        );


    });


}



/**
 * Menú móvil.
 */
export function initMobileMenu() {


    const button =
    document.querySelector(
        ".menu-toggle"
    );


    const nav =
    document.querySelector(
        ".main-nav"
    );


    if (!button || !nav) {

        return;

    }


    button.addEventListener(
        "click",
        () => {


            nav.classList.toggle(
                "open"
            );


        }

    );


    nav.querySelectorAll("a")
    .forEach(link => {


        link.addEventListener(
            "click",
            () => {

                nav.classList.remove(
                    "open"
                );

            }

        );


    });


}


/**
 * Inicializador.
 */
export function initNavigation() {


    setActiveNavigation();

    enableSmoothScroll();

    initMobileMenu();


}
