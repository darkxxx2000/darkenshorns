/*************************************************
 * DARKENSHORNS
 * CARDS
 *************************************************/

import {
    createElement
} from "./utils.js";


/**
 * Detecta automáticamente la ruta hacia comic.html.
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
 */
function getAssetUrl(
    path
) {

    if (
        !path ||
        typeof path !== "string"
    ) {

        return getFallbackCover();

    }


    path =
        path.trim();


    if (
        !path
    ) {

        return getFallbackCover();

    }


    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//") ||
        path.startsWith("data:")
    ) {

        return path;

    }


    if (
        path.startsWith("/")
    ) {

        return path;

    }


    if (
        path.startsWith("../")
    ) {

        return path;

    }


    const isInsidePages =
        window.location.pathname.includes("/pages/");


    if (
        isInsidePages
    ) {

        return `../${path}`;

    }


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
 * Obtiene texto desde JSON.
 */
function getText(
    value
) {

    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value.trim();

    }


    return "";

}


/**
 * Obtiene capítulos.
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
        typeof chapters === "number"
    ) {

        return chapters;

    }


    if (
        typeof chapters === "string"
    ) {

        const number =
            Number(chapters);


        if (
            !Number.isNaN(number)
        ) {

            return number;

        }

    }


    return 0;

}


/**
 * Crea tarjeta de cómic.
 */
export function createComicCard(
    comic
) {


    if (
        !comic ||
        typeof comic !== "object"
    ) {

        return createElement(
            "article",
            "comic-card"
        );

    }


    const card =
        createElement(
            "article",
            "comic-card"
        );


    const comicId =
        getText(
            comic.id
        );


    card.dataset.id =
        comicId;


    const comicUrl =
        `${getComicPageUrl()}?id=${encodeURIComponent(
            comicId
        )}`;


    const coverUrl =
        getAssetUrl(
            comic.cover
        );


    const chapterCount =
        getChapterCount(
            comic.chapters
        );


    const comicTitle =
        getText(
            comic.title
        );


    const comicAuthor =
        getText(
            comic.author
        );


    const comicSeries =
        getText(
            comic.series
        );


    const comicSubtitle =
        getText(
            comic.subtitle
        );


    const comicDescription =
        getText(
            comic.description
        );


    const comicStatus =
        getText(
            comic.status
        );


    const comicUpdated =
        getText(
            comic.updated
        );



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
                    comicStatus
                    ?
                    `
                    <span class="card-badge">
                        ${comicStatus}
                    </span>
                    `
                    :
                    ""
                }


            </div>



            <div class="card-info">



                ${
                    comicTitle
                    ?
                    `
                    <h3 class="card-title">
                        ${comicTitle}
                    </h3>
                    `
                    :
                    ""
                }




                ${
                    comicSubtitle
                    ?
                    `
                    <div class="card-subtitle">
                        ${comicSubtitle}
                    </div>
                    `
                    :
                    ""
                }





                ${
                    comicSeries
                    ?
                    `
                    <div class="card-series">
                        ${comicSeries}
                    </div>
                    `
                    :
                    ""
                }





                ${
                    comicAuthor
                    ?
                    `
                    <div class="card-author">
                        ${comicAuthor}
                    </div>
                    `
                    :
                    ""
                }




                ${
                    comicDescription
                    ?
                    `
                    <p class="card-description">
                        ${comicDescription}
                    </p>
                    `
                    :
                    ""
                }




                <div class="card-footer">



                    <span class="chapter-number">

                        ${chapterCount} Chapters

                    </span>




                    ${
                        comicUpdated
                        ?
                        `
                        <span class="card-date">
                            ${comicUpdated}
                        </span>
                        `
                        :
                        ""
                    }




                </div>



            </div>



        </a>



    `;


    return card;

}



/**
 * Renderiza lista de cómics.
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


            const card =
                createComicCard(
                    comic
                );


            fragment.appendChild(
                card
            );


        }
    );



    container.appendChild(
        fragment
    );


}
