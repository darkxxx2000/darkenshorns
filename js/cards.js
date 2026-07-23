/*************************************************
 * DARKENSHORNS
 * CARDS
 *************************************************/

import {
    createElement
} from "./utils.js";


/**
 * Detecta automáticamente la ruta hacia comic.html.
 *
 * Desde Home:
 * pages/comic.html
 *
 * Desde una página dentro de /pages/:
 * comic.html
 */
function getComicPageUrl() {

    const isInsidePages =
        window.location.pathname.includes("/pages/");

    return isInsidePages
        ? "comic.html"
        : "pages/comic.html";

}


/**
 * Detecta automáticamente la ruta
 * de los assets.
 *
 * Desde Home:
 * assets/...
 *
 * Desde /pages/:
 * ../assets/...
 */
function getAssetUrl(
    path
) {

    /*
    Si no existe portada,
    usamos el placeholder.
    */

    if (
        !path
    ) {

        return getFallbackCover();

    }


    /*
    URLs externas.
    */

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//") ||
        path.startsWith("data:")
    ) {

        return path;

    }


    /*
    Rutas que ya comienzan
    con ../
    */

    if (
        path.startsWith("../")
    ) {

        return path;

    }


    const isInsidePages =
        window.location.pathname.includes("/pages/");


    /*
    Desde /pages/
    */

    if (
        isInsidePages
    ) {

        return `../${path}`;

    }


    /*
    Desde Home.
    */

    return path;

}


/**
 * Portada por defecto.
 */
function getFallbackCover() {

    const isInsidePages =
        window.location.pathname.includes("/pages/");


    return isInsidePages
        ? "../assets/placeholders/cover.webp"
        : "assets/placeholders/cover.webp";

}


/**
 * Obtiene la cantidad de capítulos.
 *
 * Evita mostrar:
 *
 * [object Object]
 *
 * cuando chapters es un array
 * de objetos.
 */
function getChapterCount(
    chapters
) {

    /*
    Array de capítulos.
    */

    if (
        Array.isArray(
            chapters
        )
    ) {

        return chapters.length;

    }


    /*
    Si ya es un número.
    */

    if (
        typeof chapters ===
        "number"
    ) {

        return chapters;

    }


    return 0;

}


/**
 * Crea una tarjeta de cómic.
 */
export function createComicCard(
    comic
) {

    const card =
        createElement(
            "article",
            "comic-card"
        );


    /*
    ID DEL CÓMIC
    */

    card.dataset.id =
        comic.id || "";


    /*
    URL DEL CÓMIC
    */

    const comicUrl =
        `${getComicPageUrl()}?id=${encodeURIComponent(
            comic.id || ""
        )}`;


    /*
    PORTADA
    */

    const coverUrl =
        getAssetUrl(
            comic.cover
        );


    /*
    CAPÍTULOS
    */

    const chapterCount =
        getChapterCount(
            comic.chapters
        );


    /*
    TARJETA
    */

    card.innerHTML = `

        <a
            href="${comicUrl}"
            class="comic-card-link"
            aria-label="Read ${comic.title || "Comic"}"
        >

            <div class="comic-cover">

                <img
                    src="${coverUrl}"
                    alt="${comic.title || "Comic"}"
                    loading="lazy"
                >

                ${
                    comic.status
                    ? `
                        <span class="card-badge">
                            ${comic.status}
                        </span>
                    `
                    : ""
                }

            </div>


            <div class="card-info">

                <h3 class="card-title">
                    ${comic.title || "Untitled"}
                </h3>


                ${
                    comic.subtitle
                    ? `
                        <div class="card-subtitle">
                            ${comic.subtitle}
                        </div>
                    `
                    : ""
                }


                <div class="card-author">
                    ${comic.author || "Unknown Author"}
                </div>


                <p class="card-description">
                    ${comic.description || ""}
                </p>


                <div class="card-footer">

                    <span class="chapter-number">

                        ${chapterCount} Chapters

                    </span>


                    <span class="card-date">

                        ${comic.updated || ""}

                    </span>

                </div>

            </div>

        </a>

    `;


    return card;

}


/**
 * Renderiza un listado de cómics.
 */
export function renderComicCards(
    container,
    comics = []
) {

    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    /*
    Sin resultados.
    */

    if (
        !Array.isArray(comics) ||
        comics.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                No comics available.
            </p>

        `;

        return;

    }


    /*
    Fragmento para mejorar
    el rendimiento.
    */

    const fragment =
        document.createDocumentFragment();


    comics.forEach(
        comic => {

            fragment.appendChild(
                createComicCard(
                    comic
                )
            );

        }
    );


    container.appendChild(
        fragment
    );

}
