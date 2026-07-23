/*************************************************
 * DARKENSHORNS
 * APP
 *************************************************/

import {
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


        switch (page) {

            /*
            =========================
            HOME
            =========================
            */

            case "index":

            case "":

                await initHomePage();

                await initSidebar();

                break;


            /*
            =========================
            COMIC
            =========================
            */

            case "comic":

                /*
                comic.html tiene su propio
                sistema de carga.
                */

                break;


            /*
            =========================
            CHAPTER
            =========================
            */

            case "chapter":

                /*
                chapter.html carga directamente:

                ../js/chapter.js

                Por eso NO inicializamos
                el lector aquí.
                */

                break;


            /*
            =========================
            SERIES
            =========================
            */

            case "series":

                /*
                La página de series
                puede inicializar su
                propio sistema.
                */

                break;


            /*
            =========================
            SEARCH
            =========================
            */

            case "search":

                /*
                El buscador puede
                inicializar su propio
                sistema.
                */

                break;


            /*
            =========================
            DEFAULT
            =========================
            */

            default:

                console.log(
                    "DarkensHorns page:",
                    page
                );

                break;

        }


        /*
        =========================
        LAZY LOAD FINAL
        =========================
        */

        initLazyLoad();


    }

    catch (error) {

        console.error(
            "DarkensHorns initialization error:",
            error
        );

    }

}


/**
 * Arranque.
 */
document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
