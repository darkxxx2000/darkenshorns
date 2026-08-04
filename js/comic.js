/* =========================================
DARKENSHORNS - COMIC PAGE
========================================= */

document.addEventListener(
"DOMContentLoaded",
loadComicPage
);

/* =========================================
LOAD COMIC
========================================= */

async function loadComicPage() {

const params =
    new URLSearchParams(
        window.location.search
    );


const comicId =
    params.get("id");


if (!comicId) {

    showComicError(
        "No comic ID specified."
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
    RENDER BANNER
    =========================================
    */

    renderComicBanner(
        comic
    );


    /*
    =========================================
    RENDER BREADCRUMB
    =========================================
    */

    renderBreadcrumb(
        comic
    );


    /*
    =========================================
    RENDER SERIES
    =========================================
    */

    renderSeries(
        comicId,
        comic
    );


}
catch (error) {

    console.error(
        "Error loading comic:",
        error
    );


    showComicError(
        `Comic "${comicId}" could not be found.`
    );

}

}

/* =========================================
RENDER COMIC BANNER
========================================= */

function renderComicBanner(
comic
) {

const banner =
    document.getElementById(
        "comic-banner-image"
    );


if (!banner) {

    console.error(
        "comic-banner-image not found."
    );

    return;

}


/*
=========================================
BANNER SOURCE
=========================================

Supports:

comic.banner

or

comic.cover

as fallback.
*/

const bannerSource =
    comic.banner ||
    comic.cover ||
    "";


if (!bannerSource) {

    banner.src =
        "../assets/placeholders/banner-placeholder.webp";

    banner.alt =
        comic.title ||
        "Comic Banner";

    return;

}


banner.src =
    normalizeAssetPath(
        bannerSource
    );


banner.alt =
    comic.title ||
    "Comic Banner";


/*
=========================================
IMAGE ERROR FALLBACK
=========================================
*/

banner.onerror =
    function() {

        banner.onerror =
            null;

        banner.src =
            "../assets/placeholders/banner-placeholder.webp";

    };

}

/* =========================================
RENDER BREADCRUMB
========================================= */

function renderBreadcrumb(
comic
) {

const breadcrumb =
    document.getElementById(
        "breadcrumb-title"
    );


if (!breadcrumb) {

    return;

}


breadcrumb.textContent =
    comic.title ||
    "Comic";

}

/* =========================================
RENDER SERIES
========================================= */

function renderSeries(
comicId,
comic
) {

const container =
    document.getElementById(
        "series-container"
    );


if (!container) {

    console.error(
        "series-container not found."
    );

    return;

}


container.innerHTML =
    "";


const series =
    Array.isArray(
        comic.series
    )
        ? comic.series
        : [];


/*
=========================================
NO SERIES
=========================================
*/

if (
    series.length ===
    0
) {

    container.innerHTML =
        "<p>No series available yet.</p>";

    return;

}


/*
=========================================
CREATE SERIES CARDS
=========================================
*/

series.forEach(
    currentSeries => {

        const card =
            createSeriesCard(
                comicId,
                currentSeries
            );


        container.appendChild(
            card
        );

    }
);

}

/* =========================================
CREATE SERIES CARD
========================================= */

function createSeriesCard(
comicId,
series
) {

/*
=========================================
MAIN LINK
=========================================
*/

const link =
    document.createElement(
        "a"
    );


link.className =
    "comic-card series-card";


link.href =
    `series.html?id=${encodeURIComponent(
        comicId
    )}&series=${encodeURIComponent(
        series.id
    )}`;


/*
=========================================
COVER
=========================================
*/

const cover =
    document.createElement(
        "img"
    );


cover.className =
    "comic-card-cover";


cover.src =
    normalizeAssetPath(
        series.cover
    );


cover.alt =
    series.title ||
    "Series Cover";


cover.loading =
    "lazy";


/*
=========================================
COVER ERROR FALLBACK
=========================================
*/

cover.addEventListener(
    "error",
    function() {

        cover.src =
            "../assets/placeholders/cover-placeholder.webp";

    }
);


/*
=========================================
CONTENT
=========================================
*/

const content =
    document.createElement(
        "div"
    );


content.className =
    "comic-card-content";


/*
=========================================
TITLE
=========================================
*/

const title =
    document.createElement(
        "h3"
    );


title.className =
    "comic-card-title";


title.textContent =
    series.title ||
    "Untitled Series";


/*
=========================================
DESCRIPTION
=========================================
*/

const description =
    document.createElement(
        "p"
    );


description.className =
    "comic-card-description";


description.textContent =
    series.description ||
    "";


/*
=========================================
CHAPTER COUNT
=========================================
*/

const chapterCount =
    document.createElement(
        "span"
    );


chapterCount.className =
    "comic-card-meta";


const chapters =
    Array.isArray(
        series.chapters
    )
        ? series.chapters
        : [];


chapterCount.textContent =
    `${chapters.length} ${
        chapters.length === 1
            ? "Chapter"
            : "Chapters"
    }`;


/*
=========================================
BUILD CONTENT
=========================================
*/

content.appendChild(
    title
);


if (
    series.description
) {

    content.appendChild(
        description
    );

}


content.appendChild(
    chapterCount
);


/*
=========================================
BUILD CARD
=========================================
*/

link.appendChild(
    cover
);


link.appendChild(
    content
);


return link;

}

/* =========================================
ERROR
========================================= */

function showComicError(
message
) {

const breadcrumb =
    document.getElementById(
        "breadcrumb-title"
    );


if (breadcrumb) {

    breadcrumb.textContent =
        "Error";

}


const banner =
    document.getElementById(
        "comic-banner-image"
    );


if (banner) {

    banner.src =
        "../assets/placeholders/banner-placeholder.webp";

}


const seriesContainer =
    document.getElementById(
        "series-container"
    );


if (seriesContainer) {

    seriesContainer.innerHTML =
        `<p>${message}</p>`;

}

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


/*
=========================================
GENERIC PATH
=========================================
*/

return `../${path}`;

}
