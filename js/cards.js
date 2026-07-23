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
 *
 * También acepta URLs externas.
 */
function getAssetUrl(
    path
) {

    /*
    =========================================
    SIN PORTADA
    =========================================
    */

    if (
        !path ||
        typeof path !== "string"
    ) {

        return getFallbackCover();

    }


    /*
    Limpiar espacios
    */

    path =
        path.trim();


    /*
    Si después de limpiar
    quedó vacío.
    */

    if (
        !path
    ) {

        return getFallbackCover();

    }


    /*
    =========================================
    URL EXTERNA
    =========================================

    Ejemplo:

    https://ejemplo.com/imagen.jpg

    */

    if (
        path.startsWith(
            "http://"
        ) ||

        path.startsWith(
            "https://"
        ) ||

        path.startsWith(
            "//"
        ) ||

        path.startsWith(
            "data:"
        )
    ) {

        return path;

    }


    /*
    =========================================
    RUTA ABSOLUTA
    =========================================

    Ejemplo:

    /assets/comics/cover.jpg

    */

    if (
        path.startsWith("/")
    ) {

        return path;

    }


    /*
    =========================================
    RUTA YA PREPARADA
    =========================================

    Ejemplo:

    ../assets/comics/cover.jpg

    */

    if (
        path.startsWith(
            "../"
        )
    ) {

        return path;

    }


    /*
    =========================================
    DETECTAR SI ESTAMOS EN /pages/
    =========================================
    */

    const isInsidePages =
        window.location.pathname.includes(
            "/pages/"
        );


    /*
    =========================================
    DESDE /pages/
    =========================================

    JSON:

    assets/comics/cover.jpg

    Resultado:

    ../assets/comics/cover.jpg

    */

    if (
        isInsidePages
    ) {

        return `../${path}`;

    }


    /*
    =========================================
    DESDE HOME
    =========================================

    JSON:

    assets/comics/cover.jpg

    Resultado:

    assets/comics/cover.jpg

    */

    return path;

}


/**
 * Portada por defecto.
 */
function getFallbackCover() {

    const isInsidePages =
        window.location.pathname.includes(
            "/pages/"
        );


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
    =========================================
    ARRAY DE CAPÍTULOS
    =========================================
    */

    if (
        Array.isArray(
            chapters
        )
    ) {

        return chapters.length;

    }


    /*
    =========================================
    NÚMERO
    =========================================
    */

    if (
        typeof chapters ===
        "number"
    ) {

        return chapters;

    }


    /*
    =========================================
    STRING NUMÉRICO
    =========================================
    */

    if (
        typeof chapters ===
        "string"
    ) {

        const number =
            Number(
                chapters
            );


        if (
            !Number.isNaN(
                number
            )
        ) {

            return number;

        }

    }


    return 0;

}


/**
 * Crea una tarjeta de cómic.
 */
export function createComicCard(
    comic
) {

    /*
    =========================================
    VALIDACIÓN
    =========================================
    */

    if (
        !comic ||
        typeof comic !== "object"
    ) {

        return createElement(
            "article",
            "comic-card"
        );

    }


    /*
    =========================================
    CREAR TARJETA
    =========================================
    */

    const card =
        createElement(
            "article",
            "comic-card"
        );


    /*
    =========================================
    ID DEL CÓMIC
    =========================================
    */

    const comicId =
        comic.id || "";


    card.dataset.id =
        comicId;


    /*
    =========================================
    URL DEL CÓMIC
    =========================================
    */

    const comicUrl =
        `${getComicPageUrl()}?id=${encodeURIComponent(
            comicId
        )}`;


    /*
    =========================================
    PORTADA
    =========================================
    */

    const coverUrl =
        getAssetUrl(
            comic.cover
        );


    /*
    =========================================
    CAPÍTULOS
    =========================================
    */

    const chapterCount =
        getChapterCount(
            comic.chapters
        );


    /*
    =========================================
    TÍTULO
    =========================================
    */

    const comicTitle =
        comic.title ||
        "Untitled";


    /*
    =========================================
    AUTOR
    =========================================
    */

    const comicAuthor =
        comic.author ||
        "Unknown Author";


    /*
    =========================================
    TARJETA
    =========================================
    */

    card.innerHTML = `

        <a
            href="${comicUrl}"
            class="comic-card-link"
            aria-label="Read ${comicTitle}"
        >

            <div class="comic-cover">

                <img
                    src="${coverUrl}"
                    alt="${comicTitle}"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${getFallbackCover()}';"
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
                    ${comicTitle}
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
                    ${comicAuthor}
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

    /*
    =========================================
    VALIDAR CONTENEDOR
    =========================================
    */

    if (
        !container
    ) {

        return;

    }


    /*
    =========================================
    LIMPIAR CONTENEDOR
    =========================================
    */

    container.innerHTML =
        "";


    /*
    =========================================
    SIN RESULTADOS
    =========================================
    */

    if (
        !Array.isArray(
            comics
        ) ||

        comics.length ===
        0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                No comics available.
            </p>

        `;

        return;

    }


    /*
    =========================================
    FRAGMENTO
    =========================================
    */

    const fragment =
        document.createDocumentFragment();


    /*
    =========================================
    CREAR TARJETAS
    =========================================
    */

    comics.forEach(
        comic => {

            const card =
                createComicCard(
                    comic
                );


            fragment.appendChild(
                card
            );

        }
    );


    /*
    =========================================
    INSERTAR TARJETAS
    =========================================
    */

    container.appendChild(
        fragment
    );

}
