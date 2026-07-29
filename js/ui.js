/*************************************************
 * DARKENSHORNS
 * UI
 *************************************************/

import { loadComics, loadSeries } from "./data-loader.js";
import { renderComicCards } from "./cards.js";

/**
 * Inicializa la página de inicio.
 */
export async function initHomePage() {

    const latestContainer = document.querySelector("#latest-comics");
    const popularContainer = document.querySelector("#popular-comics");
    const featuredSeriesContainer = document.querySelector("#featured-series");

    /* -------------------------
       CÓMICS
    ------------------------- */

    const comics = await loadComics();

    if (latestContainer) {

        renderComicCards(
            latestContainer,
            comics.slice(0, 8)
        );

    }

    if (popularContainer) {

        renderComicCards(
            popularContainer,
            [...comics]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 8)
        );

    }

    /* -------------------------
       SERIES
    ------------------------- */

    const series = await loadSeries();

    if (featuredSeriesContainer) {

        renderComicCards(
            featuredSeriesContainer,
            series.slice(0, 6)
        );

    }

}

/**
 * Detecta automáticamente la página actual.
 */
export function detectCurrentPage() {

    const path = window.location.pathname.toLowerCase();

    if (
        path.endsWith("/") ||
        path.endsWith("index.html")
    ) {
        return "home";
    }

    if (path.includes("series")) return "series";
    if (path.includes("comic")) return "comic";
    if (path.includes("chapter")) return "chapter";
    if (path.includes("gallery")) return "gallery";
    if (path.includes("search")) return "search";

    return "unknown";

}
