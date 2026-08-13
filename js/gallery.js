/*************************************************
 * DARKENSHORNS
 * GALLERY LIST
 *************************************************/

import {
    loadGalleries
} from "./data-loader.js";

import {
    renderGalleryCards
} from "./gallery-cards.js";


document.addEventListener(
    "DOMContentLoaded",
    initGalleryPage
);


async function initGalleryPage() {

    const container =
        document.getElementById(
            "gallery-container"
        );


    if (!container) {
        return;
    }


    try {

        const galleries =
            await loadGalleries();


        if (!Array.isArray(galleries)) {

            renderGalleryCards(
                container,
                []
            );

            return;

        }


        renderGalleryCards(
            container,
            galleries
        );


    } catch (error) {

        console.error(
            "Gallery page error:",
            error
        );


        renderGalleryCards(
            container,
            []
        );

    }

}
