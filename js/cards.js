```js
/*************************************************
 * DARKENSHORNS
 * CARDS
 *************************************************/

import { createElement } from "./utils.js";


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
 * Detecta automáticamente la ruta correcta
 * para las imágenes.
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

    if (
        !path
    ) {

        return getFallbackCover();

    }


    /*
    Si la imagen ya es una URL absoluta,
    no modificamos la ruta.
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
    Si la ruta empieza con ../,
    respetamos la ruta original.
    */

    if (
        path.startsWith("../")
    ) {

        return path;

    }


    /*
    Desde /pages/
    */

    const isInsidePages =
        window.location.pathname.includes("/pages/");


    if (
        isInsidePages
    ) {

        return `../${path}`;

    }


    /*
    Desde Home
    */

    return path;

}


/**
 * Imagen de portada por defecto.
 */
function getFallbackCover() {

    const isInsidePages =
        window.location.pathname.includes("/pages/");


    return isInsidePages
        ? "../assets/placeholders/cover.webp"
        : "assets/placeholders/cover.webp";

}


/**
 * Obtiene el número de capítulos.
 *
 * chapters puede ser:
 *
 * - Array de objetos
 * - Array de strings
 * - Número
 * - Undefined
 */
function getChapterCount(
    chapters
) {

    if (
        Array.isArray(chapters)
    ) {

        return chapters.length;

    }


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


    card.dataset.id =
        comic.id || "";


    /*
    ==========================================
    URL DE LA FICHA DEL CÓMIC
    ==========================================
    */

    const comicUrl =
        `${getComicPageUrl()}?id=${encodeURIComponent(
            comic.id || ""
        )}`;


    /*
    ==========================================
    PORTADA
    ==========================================
    */

    const coverUrl =
        getAssetUrl(
            comic.cover
        );


    /*
    ==========================================
    CAPÍTULOS
    ==========================================
    */

    const chapterCount =
        getChapterCount(
            comic.chapters
        );


    /*
    ==========================================
    TARJETA
    ==========================================
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
 * Renderiza un listado de tarjetas.
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

```
