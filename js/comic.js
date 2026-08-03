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
    RENDER MAIN COMIC INFORMATION
    =========================================
    */

    renderComic(
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
RENDER COMIC
========================================= */

function renderComic(
comic
) {

/* =========================================
   TITLE
========================================= */

const title =
    document.getElementById(
        "comic-title"
    );


if (title) {

    title.textContent =
        comic.title ||
        "Untitled Comic";

}


/* =========================================
   BREADCRUMB
========================================= */

const breadcrumb =
    document.getElementById(
        "breadcrumb-title"
    );


if (breadcrumb) {

    breadcrumb.textContent =
        comic.title ||
        "Comic";

}


/* =========================================
   COVER
========================================= */

const cover =
    document.getElementById(
        "comic-cover-image"
    );


if (
    cover &&
    comic.cover
) {

    cover.src =
        normalizeAssetPath(
            comic.cover
        );


    cover.alt =
        comic.title ||
        "Comic Cover";

}


/* =========================================
   AUTHOR
========================================= */

const author =
    document.getElementById(
        "comic-author"
    );


if (author) {

    author.textContent =
        comic.author ||
        "-";

}


/* =========================================
   STATUS
========================================= */

const status =
    document.getElementById(
        "comic-status"
    );


if (status) {

    status.textContent =
        comic.status ||
        "-";

}


/* =========================================
   UPDATED
========================================= */

const updated =
    document.getElementById(
        "comic-updated"
    );


if (updated) {

    updated.textContent =
        comic.updated ||
        "-";

}


/* =========================================
   DESCRIPTION
========================================= */

const description =
    document.getElementById(
        "comic-description"
    );


if (description) {

    description.textContent =
        comic.description ||
        "";

}


/* =========================================
   RATING
========================================= */

const rating =
    document.getElementById(
        "comic-rating"
    );


if (rating) {

    if (
        comic.rating !== undefined &&
        comic.rating !== null &&
        comic.rating !== ""
    ) {

        rating.textContent =
            `★ ${comic.rating}`;

    }
    else {

        rating.textContent =
            "★★★★★";

    }

}


/* =========================================
   GENRES
========================================= */

const genresContainer =
    document.getElementById(
        "comic-genres"
    );


if (genresContainer) {

    genresContainer.innerHTML =
        "";


    const genres =
        Array.isArray(
            comic.genres
        )
            ? comic.genres
            : [];


    genresContainer.textContent =
        genres.join(
            ", "
        );

}


/* =========================================
   TAGS
========================================= */

const tagsContainer =
    document.getElementById(
        "comic-tags"
    );


if (tagsContainer) {

    tagsContainer.innerHTML =
        "";


    const tags =
        Array.isArray(
            comic.tags
        )
            ? comic.tags
            : [];


    tagsContainer.textContent =
        tags.join(
            ", "
        );

}


/* =========================================
   CHARACTERS
========================================= */

const charactersContainer =
    document.getElementById(
        "characters-container"
    );


if (charactersContainer) {

    charactersContainer.innerHTML =
        "";


    const characters =
        Array.isArray(
            comic.characters
        )
            ? comic.characters
            : [];


    const characterNames =
        characters.map(
            character => {

                if (
                    typeof character ===
                    "string"
                ) {

                    return character;

                }


                if (
                    character &&
                    typeof character ===
                    "object"
                ) {

                    return (
                        character.name ||
                        ""
                    );

                }


                return "";

            }
        )
        .filter(
            name => name
        );


    charactersContainer.textContent =
        characterNames.join(
            ", "
        );

}


/* =========================================
   SERIES COUNT
========================================= */

const chaptersCount =
    document.getElementById(
        "comic-chapters"
    );


if (chaptersCount) {

    const series =
        Array.isArray(
            comic.series
        )
            ? comic.series
            : [];


    let totalChapters =
        0;


    series.forEach(
        currentSeries => {

            if (
                Array.isArray(
                    currentSeries.chapters
                )
            ) {

                totalChapters +=
                    currentSeries.chapters.length;

            }

        }
    );


    chaptersCount.textContent =
        totalChapters;

}

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


if (
    series.length ===
    0
) {

    container.innerHTML =
        "<p>No series available yet.</p>";

    return;

}


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
BUILD CARD
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


link.appendChild(
    cover
);


link.appendChild(
    content
);


/*
=========================================
IMAGE ERROR FALLBACK
=========================================
*/

cover.addEventListener(
    "error",
    function() {

        cover.src =
            "../assets/placeholders/cover-placeholder.webp";

    }
);


return link;

}

/* =========================================
ERROR
========================================= */

function showComicError(
message
) {

const title =
    document.getElementById(
        "comic-title"
    );


if (title) {

    title.textContent =
        "Comic Not Found";

}


const description =
    document.getElementById(
        "comic-description"
    );


if (description) {

    description.textContent =
        message;

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
