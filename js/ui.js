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
    renderComicCards
} from "./cards.js";

import {
    renderGalleryCards
} from "./gallery-cards.js";


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
                "#latest-comics"
            );

        const popularContainer =
            document.querySelector(
                "#popular-comics"
            );

        const favoriteContainer =
            document.querySelector(
                "#favorite-comics"
            );

        const featuredSeriesContainer =
            document.querySelector(
                "#featured-series"
            );

        const latestGalleryContainer =
            document.querySelector(
                "#latest-gallery"
            );

        const popularGalleryContainer =
            document.querySelector(
                "#popular-gallery"
            );


        /* =========================
           COMICS
        ========================= */

        const comics =
            await loadComics();


        if (Array.isArray(comics)) {


            /* =========================
               LATEST COMICS
            ========================= */

            const latestComics =
                [...comics]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.updated || 0
                            ) -
                            new Date(
                                a.updated || 0
                            )
                    )
                    .slice(
                        0,
                        8
                    );


            if (latestContainer) {

                renderComicCards(
                    latestContainer,
                    latestComics
                );

            }


            /* =========================
               POPULAR COMICS
            ========================= */

            const popularComics =
                [...comics]
                    .sort(
                        (a, b) =>
                            Number(
                                b.views || 0
                            ) -
                            Number(
                                a.views || 0
                            )
                    )
                    .slice(
                        0,
                        8
                    );


            if (popularContainer) {

                renderComicCards(
                    popularContainer,
                    popularComics
                );

            }


            /* =========================
               FAVORITES
            ========================= */

            if (favoriteContainer) {

                const favorites =
                    comics
                        .filter(
                            comic =>
                                comic &&
                                (
                                    comic.favorite === true ||
                                    comic.favorites === true ||
                                    comic.featured === true
                                )
                        )
                        .slice(
                            0,
                            8
                        );


                renderComicCards(
                    favoriteContainer,
                    favorites
                );

            }

        }


        /* =========================
           SERIES
        ========================= */

        const series =
            await loadSeries();


        if (
            featuredSeriesContainer &&
            Array.isArray(series)
        ) {

            renderComicCards(
                featuredSeriesContainer,
                series.slice(
                    0,
                    6
                )
            );

        }


        /* =========================
           GALLERY
        ========================= */

        const galleries =
            await loadGalleries();


        if (Array.isArray(galleries)) {


            /* =========================
               LATEST GALLERY
            ========================= */

            const latestGallery =
                [...galleries]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.updated || 0
                            ) -
                            new Date(
                                a.updated || 0
                            )
                    )
                    .slice(
                        0,
                        8
                    );


            if (latestGalleryContainer) {

                renderGalleryCards(
                    latestGalleryContainer,
                    latestGallery
                );

            }


            /* =========================
               POPULAR GALLERY
            ========================= */

            const popularGallery =
                [...galleries]
                    .sort(
                        (a, b) =>
                            Number(
                                b.views || 0
                            ) -
                            Number(
                                a.views || 0
                            )
                    )
                    .slice(
                        0,
                        8
                    );


            if (popularGalleryContainer) {

                renderGalleryCards(
                    popularGalleryContainer,
                    popularGallery
                );

            }

        }


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
