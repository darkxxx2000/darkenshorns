/*************************************************
 * DARKENSHORNS
 * APP
 *************************************************/

import { detectCurrentPage, initHomePage } from "./ui.js";

/**
 * Inicializa la aplicación.
 */
async function initializeApp() {

    try {

        const currentPage = detectCurrentPage();

        switch (currentPage) {

            case "home":
                await initHomePage();
                break;

            case "series":
                // Se implementará más adelante
                break;

            case "comic":
                // Se implementará más adelante
                break;

            case "chapter":
                // Se implementará más adelante
                break;

            case "gallery":
                // Se implementará más adelante
                break;

            case "search":
                // Se implementará más adelante
                break;

            default:
                console.warn("Unknown page.");
                break;

        }

    } catch (error) {

        console.error("Application initialization failed:", error);

    }

}

/**
 * Inicio
 */
document.addEventListener("DOMContentLoaded", initializeApp);
