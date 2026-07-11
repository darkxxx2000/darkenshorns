/*************************************************
 * DARKENSHORNS
 * APP
 *************************************************/

import {
    detectCurrentPage,
    initHomePage
} from "./ui.js";

import {
    initNavigation
} from "./navigation.js";

import {
    initSidebar
} from "./sidebar.js";

import {
    initModal
} from "./modal.js";

import {
    initLazyLoad
} from "./lazyload.js";

import {
    getCurrentPage
} from "./router.js";


/**
 * Inicialización general.
 */
async function initializeApp() {


    try {


        /*
        =========================
        GLOBAL
        =========================
        */


        initNavigation();

        initModal();

        initLazyLoad();


        /*
        =========================
        PAGE ROUTER
        =========================
        */


        const page =
        getCurrentPage();



        switch(page) {


            case "index":

            case "":

                await initHomePage();

                await initSidebar();

                break;



            case "comic":

                // Próximamente:
                // cargar ficha del comic

                break;



            case "chapter":

                // Próximamente:
                // lector de capítulos

                break;



            case "series":

                // Próximamente:
                // listado de series

                break;



            case "search":

                // Próximamente:
                // buscador avanzado

                break;



            default:

                console.log(
                    "Page:",
                    page
                );

                break;


        }



        /*
        =========================
        Lazy load final
        =========================
        */


        initLazyLoad();



    }

    catch(error) {


        console.error(
            "DarkensHorns initialization error:",
            error
        );


    }


}



/**
 * Arranque
 */
document.addEventListener(

    "DOMContentLoaded",

    initializeApp

);
