/*************************************************
 * DARKENSHORNS
 * UI
 *************************************************/

import {
    loadComics,
    loadSeries,
    loadGalleries
} from "./data-loader.js";

import {
    createComicCard
} from "./cards.js";

import {
    createGalleryCard
} from "./gallery-cards.js";


/**
 * Añade tipo y etiqueta a una tarjeta.
 */
function prepareCard(card, type) {

    if (!card) {
        return card;
    }

    card.classList.add(
        "feed-card",
        `feed-${type}`
    );

    const label =
        document.createElement("span");

    label.className =
        "feed-type-label";

    label.textContent =
        type.toUpperCase();

    card.appendChild(label);

    return card;

}


/**
 * Renderiza contenido mixto.
 */
function renderFeed(
    container,
    items = []
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!Array.isArray(items) || !items.length) {

        container.innerHTML = `
            <p class="empty-message">
                No content available.
            </p>
        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    items.forEach(item => {

        if (!item || !item.type) {
            return;
        }


        let card = null;


        /* =========================
           COMIC
        ========================= */

        if (item.type === "comic") {

            card =
                createComicCard(
                    item.data
                );

        }


        /* =========================
           GALLERY
        ========================= */

        if (item.type === "gallery") {

            card =
                createGalleryCard(
                    item.data
                );

        }


        if (!card) {
            return;
        }


        prepareCard(
            card,
            item.type
        );


        fragment.appendChild(
            card
        );

    });


    container.appendChild(
        fragment
    );

}


/**
 * Convierte comics y galleries
 * en un único listado.
 */
function combineContent(
    comics = [],
    galleries = []
) {

    const content = [];


    comics.forEach(comic => {

        if (!comic) {
            return;
        }

        content.push({
            type: "comic",
            data: comic
        });

    });


    galleries.forEach(gallery => {

        if (!gallery) {
            return;
        }

        content.push({
            type: "gallery",
            data: gallery
        });

    });


    return content;

}


/**
 * Inicializa Home.
 */
export async function initHomePage() {

    try {


        /* =========================
           CONTAINERS
        ========================= */

        const latestContainer =
            document.querySelector(
                "#latest-feed"
            );

        const popularContainer =
            document.querySelector(
                "#popular-feed"
            );

        const favoriteContainer =
            document.querySelector(
                "#favorite-feed"
            );


        /* =========================
           CARGAR DATOS
        ========================= */

        const [
            comics,
            galleries
        ] = await Promise.all([

            loadComics(),

            loadGalleries()

        ]);


        const validComics =
            Array.isArray(comics)
                ? comics
                : [];


        const validGalleries =
            Array.isArray(galleries)
                ? galleries
                : [];


        /* =========================
           LATEST
        ========================= */

        const latestContent =
            combineContent(
                validComics,
                validGalleries
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.data.updated || 0
                    ) -
                    new Date(
                        a.data.updated || 0
                    )
            )
            .slice(
                0,
                8
            );


        renderFeed(
            latestContainer,
            latestContent
        );


        /* =========================
           POPULAR
        ========================= */

        const popularContent =
            combineContent(
                validComics,
                validGalleries
            )
            .sort(
                (a, b) =>
                    Number(
                        b.data.views || 0
                    ) -
                    Number(
                        a.data.views || 0
                    )
            )
            .slice(
                0,
                8
            );


        renderFeed(
            popularContainer,
            popularContent
        );


        /* =========================
           FAVORITES
        ========================= */

        const favoriteContent =
            combineContent(
                validComics.filter(
                    item =>
                        item &&
                        (
                            item.favorite === true ||
                            item.favorites === true ||
                            item.featured === true
                        )
                ),
                validGalleries.filter(
                    item =>
                        item &&
                        (
                            item.favorite === true ||
                            item.favorites === true ||
                            item.featured === true
                        )
                )
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.data.updated || 0
                    ) -
                    new Date(
                        a.data.updated || 0
                    )
            )
            .slice(
                0,
                8
            );


        renderFeed(
            favoriteContainer,
            favoriteContent
        );


    } catch (error) {

        console.error(
            "DarkensHorns Home error:",
            error
        );

    }

}


/**
 * Detecta página actual.
 */
export function detectCurrentPage() {

    const path =
        window.location.pathname
            .toLowerCase();


    if (
        path.endsWith("/") ||
        path.endsWith("index.html")
    ) {

        return "home";

    }


    if (
        path.includes("series")
    ) {

        return "series";

    }


    if (
        path.includes("comic")
    ) {

        return "comic";

    }


    if (
        path.includes("chapter")
    ) {

        return "chapter";

    }


    if (
        path.includes("gallery")
    ) {

        return "gallery";

    }


    if (
        path.includes("search")
    ) {

        return "search";

    }


    return "unknown";

}
