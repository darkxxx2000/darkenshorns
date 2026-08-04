/* =========================================
DARKENSHORNS - SERIES PAGE
========================================= */

document.addEventListener(
"DOMContentLoaded",
loadSeriesPage
);

/* =========================================
LOAD SERIES PAGE
========================================= */

async function loadSeriesPage() {

const params =
    new URLSearchParams(
        window.location.search
    );


const comicId =
    params.get("id");


const seriesId =
    params.get("series");


if (!comicId || !seriesId) {

    showSeriesError(
        "Comic or series ID not specified."
    );

    return;

}


try {

    /*
    =========================================
    LOAD COMIC JSON
    =========================================
    */

    const response =
        await fetch(
            `../data/comics/${encodeURIComponent(comicId)}.json`
        );


    if (!response.ok) {

        throw new Error(
            `Comic not found: ${comicId}`
        );

    }


    const comic =
        await response.json();


    /*
    =========================================
    FIND SERIES INSIDE COMIC JSON
    =========================================
    */

    const series =
        Array.isArray(
            comic.series
        )
            ? comic.series.find(
                currentSeries =>
                    String(
                        currentSeries.id
                    ) === String(
                        seriesId
                    )
            )
            : null;


    if (!series) {

        throw new Error(
            `Series not found: ${seriesId}`
        );

    }


    /*
    =========================================
    RENDER SERIES
    =========================================
    */

    renderSeriesPage(
        comic,
        series
    );


}
catch (error) {

    console.error(
        "Error loading series:",
        error
    );


    showSeriesError(
        "The requested series could not be found."
    );

}

}

/* =========================================
RENDER SERIES PAGE
========================================= */

function renderSeriesPage(
comic,
series
) {

/*
=========================================
SERIES TITLE
=========================================
*/

const title =
    document.getElementById(
        "series-title"
    );


if (title) {

    title.textContent =
        series.title ||
        "Untitled Series";

}


/*
=========================================
SERIES DESCRIPTION
=========================================
*/

const description =
    document.getElementById(
        "series-description"
    );


if (description) {

    description.textContent =
        series.description ||
        "";

}


/*
=========================================
SERIES COVER
=========================================
*/

const cover =
    document.getElementById(
        "series-cover-image"
    );


if (cover) {

    if (series.cover) {

        cover.src =
            normalizeAssetPath(
                series.cover
            );

    }
    else {

        cover.src =
            "../assets/placeholders/cover-placeholder.webp";

    }


    cover.alt =
        series.title ||
        "Series Cover";


    cover.addEventListener(
        "error",
        function() {

            cover.src =
                "../assets/placeholders/cover-placeholder.webp";

        },
        {
            once: true
        }
    );

}


/*
=========================================
COMIC BREADCRUMB
=========================================
*/

const comicBreadcrumb =
    document.getElementById(
        "comic-breadcrumb"
    );


if (comicBreadcrumb) {

    comicBreadcrumb.textContent =
        comic.title ||
        "Comic";


    comicBreadcrumb.href =
        `comic.html?id=${encodeURIComponent(
            comic.id
        )}`;

}


/*
=========================================
SERIES BREADCRUMB
=========================================
*/

const seriesBreadcrumb =
    document.getElementById(
        "series-breadcrumb"
    );


if (seriesBreadcrumb) {

    seriesBreadcrumb.textContent =
        series.title ||
        "Series";

}


/*
=========================================
BACK TO COMIC BUTTON
=========================================
*/

const backButton =
    document.getElementById(
        "comic-back-button"
    );


if (backButton) {

    backButton.href =
        `comic.html?id=${encodeURIComponent(
            comic.id
        )}`;

}


/*
=========================================
SERIES RATING
=========================================
*/

const rating =
    document.getElementById(
        "series-rating"
    );


if (rating) {

    if (
        series.rating !== undefined &&
        series.rating !== null &&
        series.rating !== ""
    ) {

        rating.textContent =
            `★ ${series.rating}`;

    }
    else {

        rating.textContent =
            "★★★★★";

    }

}


/*
=========================================
RENDER CHAPTERS
=========================================
*/

renderChapters(
    comic.id,
    series
);

}

/* =========================================
RENDER CHAPTERS
========================================= */

function renderChapters(
comicId,
series
) {

const container =
    document.getElementById(
        "series-chapters-container"
    );


if (!container) {

    console.error(
        "series-chapters-container not found."
    );

    return;

}


container.innerHTML =
    "";


const chapters =
    Array.isArray(
        series.chapters
    )
        ? series.chapters
        : [];


/*
=========================================
NO CHAPTERS
=========================================
*/

if (
    chapters.length ===
    0
) {

    container.innerHTML =
        "<p>No chapters available yet.</p>";

    return;

}


/*
=========================================
CREATE CHAPTER LINKS
=========================================
*/

chapters.forEach(
    (
        chapter,
        index
    ) => {

        const item =
            createChapterLink(
                comicId,
                series.id,
                chapter,
                index
            );


        container.appendChild(
            item
        );

    }
);

}

/* =========================================
CREATE CHAPTER LINK
========================================= */

function createChapterLink(
comicId,
seriesId,
chapter,
index
) {

const item =
    document.createElement(
        "a"
    );


item.className =
    "chapter-item";


/*
=========================================
CHAPTER TITLE
=========================================
*/

let chapterTitle =
    `Chapter ${index + 1}`;


if (
    chapter &&
    typeof chapter ===
    "object"
) {

    if (
        chapter.title
    ) {

        chapterTitle =
            chapter.title;

    }
    else if (
        chapter.number !== undefined &&
        chapter.number !== null
    ) {

        chapterTitle =
            `Chapter ${chapter.number}`;

    }

}


/*
=========================================
TITLE
=========================================
*/

const title =
    document.createElement(
        "span"
    );


title.className =
    "chapter-number";


title.textContent =
    chapterTitle;


item.appendChild(
    title
);


/*
=========================================
SUBTITLE
=========================================
*/

if (
    chapter &&
    chapter.subtitle
) {

    const subtitle =
        document.createElement(
            "span"
        );


    subtitle.className =
        "chapter-date";


    subtitle.textContent =
        chapter.subtitle;


    item.appendChild(
        subtitle
    );

}


/*
=========================================
CHAPTER IDENTIFIER
=========================================
*/

const chapterId =
    getChapterIdentifier(
        chapter
    );


/*
=========================================
LINK TO CHAPTER
=========================================
*/

if (chapterId) {

    item.href =
        `chapter.html` +
        `?id=${encodeURIComponent(
            comicId
        )}` +
        `&series=${encodeURIComponent(
            seriesId
        )}` +
        `&chapter=${encodeURIComponent(
            chapterId
        )}`;

}
else {

    item.href =
        "#";


    item.addEventListener(
        "click",
        event => {

            event.preventDefault();

        }
    );

}


return item;

}

/* =========================================
GET CHAPTER IDENTIFIER
========================================= */

function getChapterIdentifier(
chapter
) {

if (
    typeof chapter ===
    "string"
) {

    return chapter;

}


if (
    chapter &&
    typeof chapter ===
    "object"
) {

    return (

        chapter.id ||

        chapter.slug ||

        chapter.chapter ||

        chapter.number ||

        chapter.file ||

        ""

    );

}


return "";

}

/* =========================================
NORMALIZE ASSET PATH
========================================= */

function normalizeAssetPath(
path
) {

if (!path) {

    return "";

}


/*
=========================================
EXTERNAL URL
=========================================
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
ALREADY CORRECT FROM /pages/
=========================================
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
ROOT ASSET PATH
=========================================
*/

if (
    path.startsWith(
        "assets/"
    )
) {

    return `../${path}`;

}


return `../${path}`;

}

/* =========================================
ERROR
========================================= */

function showSeriesError(
message
) {

const title =
    document.getElementById(
        "series-title"
    );


if (title) {

    title.textContent =
        "Series Not Found";

}


const description =
    document.getElementById(
        "series-description"
    );


if (description) {

    description.textContent =
        message;

}


const chapters =
    document.getElementById(
        "series-chapters-container"
    );


if (chapters) {

    chapters.innerHTML =
        `<p>${message}</p>`;

}

}
