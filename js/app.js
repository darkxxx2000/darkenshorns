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

        const page = getCurrentPage();

        switch (page) {
            /*
            =========================
            HOME
            =========================
            */

            case "index":
            case "":
                await initHomePage();
                break;

            /*
            =========================
            COMIC
            =========================
            */

            case "comic":
                break;

            /*
            =========================
            CHAPTER
            =========================
            */

            case "chapter":
                break;

            /*
            =========================
            SERIES
            =========================
            */

            case "series":
                break;

            /*
            =========================
            SEARCH
            =========================
            */

            case "search":
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

    } catch (error) {
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
```
