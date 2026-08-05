/* =========================================
DARKENSHORNS - SERIES PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadSeriesPage
);


/* =========================================
HELPERS
========================================= */

function getText(value) {

    return typeof value === "string"
        ? value.trim()
        : "";

}

function getList(value) {

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    return getText(value);

}


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


        const series =
            Array.isArray(comic.series)
                ? comic.series.find(
                    item =>
                        String(item.id) ===
                        String(seriesId)
                )
                : null;


        if (!series) {

            throw new Error(
                `Series not found: ${seriesId}`
            );

        }


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

    const title =
        document.getElementById(
            "series-title"
        );

    if (title) {

        title.textContent =
            getText(series.title);

    }


    const description =
        document.getElementById(
            "series-description"
        );

    if (description) {

        description.textContent =
            getText(series.description);

    }


    const cover =
        document.getElementById(
            "series-cover-image"
        );

    if (cover) {

        cover.src =
            series.cover
                ? normalizeAssetPath(series.cover)
                : "../assets/placeholders/cover-placeholder.webp";

        cover.alt =
            getText(series.title);

        cover.onerror =
            () => {

                cover.src =
                    "../assets/placeholders/cover-placeholder.webp";

            };

    }


    const comicBreadcrumb =
        document.getElementById(
            "comic-breadcrumb"
        );

    if (comicBreadcrumb) {

        comicBreadcrumb.textContent =
            getText(comic.title);

        comicBreadcrumb.href =
            `comic.html?id=${encodeURIComponent(comic.id)}`;

    }


    const seriesBreadcrumb =
        document.getElementById(
            "series-breadcrumb"
        );

    if (seriesBreadcrumb) {

        seriesBreadcrumb.textContent =
            getText(series.title);

    }


    const backButton =
        document.getElementById(
            "comic-back-button"
        );

    if (backButton) {

        backButton.href =
            `comic.html?id=${encodeURIComponent(comic.id)}`;

    }


    /* =========================================
       SERIES INFORMATION
    ========================================= */

    const set = (id, value) => {

        const el =
            document.getElementById(id);

        if (el) {

            el.textContent = value;

        }

    };


    set(
        "series-author",
        getText(comic.author)
    );

    set(
        "series-status",
        getText(comic.status)
    );

    set(
        "series-genres",
        getList(comic.genres)
    );

    set(
        "series-characters",
        getList(comic.characters)
    );

    set(
        "series-name",
        getText(series.title)
    );

    set(
        "series-updated",
        getText(comic.updated)
    );

    set(
        "series-rating",
        getText(comic.rating)
    );


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

        return;

    }

    container.innerHTML = "";

    const chapters =
        Array.isArray(series.chapters)
            ? series.chapters
            : [];
    
/*
=========================================
NO CHAPTERS
=========================================
*/

if (!chapters.length) {

    container.innerHTML =
        "<p>No chapters available yet.</p>";

    return;

}


/*
=========================================
CREATE CHAPTER LINKS
=========================================
*/

chapters.forEach((chapter, index) => {

    container.appendChild(
        createChapterLink(
            comicId,
            series.id,
            chapter,
            index
        )
    );

});

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
        document.createElement("a");

    item.className =
        "chapter-item";


    let chapterTitle =
        `Chapter ${index + 1}`;

    if (chapter && typeof chapter === "object") {

        if (chapter.title) {

            chapterTitle =
                chapter.title;

        }
        else if (chapter.number != null) {

            chapterTitle =
                `Chapter ${chapter.number}`;

        }

    }


    item.href = "#";

    const chapterId =
        getChapterIdentifier(chapter);

    if (chapterId) {

        item.href =
            `chapter.html?id=${encodeURIComponent(comicId)}&series=${encodeURIComponent(seriesId)}&chapter=${encodeURIComponent(chapterId)}`;

    }
    else {

        item.addEventListener(
            "click",
            event => event.preventDefault()
        );

    }


    const title =
        document.createElement("span");

    title.className =
        "chapter-number";

    title.textContent =
        chapterTitle;


    item.appendChild(title);


    const subtitle =
        document.createElement("span");

    subtitle.className =
        "chapter-date";

    if (chapter && typeof chapter === "object") {

        subtitle.textContent =
            chapter.subtitle ||
            chapter.date ||
            "";

    }

    if (subtitle.textContent) {

        item.appendChild(subtitle);

    }

    return item;

}


/* =========================================
GET CHAPTER IDENTIFIER
========================================= */

function getChapterIdentifier(
    chapter
) {

    if (typeof chapter === "string") {

        return chapter;

    }

    if (!chapter || typeof chapter !== "object") {

        return "";

    }

    return (
        chapter.id ||
        chapter.slug ||
        chapter.number ||
        chapter.file ||
        ""
    );

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

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//") ||
        path.startsWith("data:")
    ) {

        return path;

    }

    if (path.startsWith("../")) {

        return path;

    }

    if (path.startsWith("assets/")) {

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

    const set = (id, value) => {

        const el =
            document.getElementById(id);

        if (el) {

            el.textContent = value;

        }

    };


    set(
        "series-title",
        "Series Not Found"
    );

    set(
        "series-description",
        message
    );


    const chapters =
        document.getElementById(
            "series-chapters-container"
        );

    if (chapters) {

        chapters.innerHTML =
            `<p>${message}</p>`;

    }

}
