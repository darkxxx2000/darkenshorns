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

        renderComic(
            comic
        );

        loadChapters(
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
       CHAPTER COUNT
    ========================================= */

    const chaptersCount =
        document.getElementById(
            "comic-chapters"
        );

    if (chaptersCount) {

        const chapters =
            getAllChapters(
                comic
            );

        chaptersCount.textContent =
            chapters.length;

    }


    /* =========================================
       FIRST CHAPTER BUTTON
    ========================================= */

    const firstChapterButton =
        document.getElementById(
            "first-chapter-button"
        );

    if (
        firstChapterButton
    ) {

        const chapters =
            getAllChapters(
                comic
            );

        if (
            chapters.length >
            0
        ) {

            const firstChapter =
                chapters[0];

            const chapterId =
                getChapterIdentifier(
                    firstChapter
                );

            if (chapterId) {

                firstChapterButton.href =
                    buildChapterURL(
                        comic.id ||
                        getComicIdFromURL(),
                        chapterId
                    );

            }

        }

    }

}


/* =========================================
   GET ALL CHAPTERS
========================================= */

function getAllChapters(
    comic
) {

    /*
    =========================================
    STANDARD COMIC STRUCTURE

    comic.chapters[]
    =========================================
    */

    if (
        Array.isArray(
            comic.chapters
        )
    ) {

        return comic.chapters;

    }


    /*
    =========================================
    SERIES STRUCTURE

    comic.series[].chapters[]
    =========================================
    */

    if (
        Array.isArray(
            comic.series
        )
    ) {

        const chapters = [];

        comic.series.forEach(
            series => {

                if (
                    !Array.isArray(
                        series.chapters
                    )
                ) {

                    return;

                }

                series.chapters.forEach(
                    chapter => {

                        chapters.push({

                            ...chapter,

                            seriesId:
                                chapter.seriesId ||
                                series.id,

                            seriesTitle:
                                series.title,

                            seriesCover:
                                series.cover,

                            seriesDescription:
                                series.description

                        });

                    }
                );

            }
        );

        return chapters;

    }


    return [];

}


/* =========================================
   LOAD CHAPTERS
========================================= */

async function loadChapters(
    comicId,
    comic
) {

    const container =
        document.getElementById(
            "chapters-container"
        );

    if (!container) {

        return;

    }

    try {

        container.innerHTML =
            "";


        /*
        =========================================
        SERIES STRUCTURE
        =========================================
        */

        if (
            Array.isArray(
                comic.series
            )
        ) {

            renderSeriesChapters(
                comicId,
                comic,
                container
            );

            return;

        }


        /*
        =========================================
        STANDARD CHAPTER STRUCTURE
        =========================================
        */

        const chapters =
            Array.isArray(
                comic.chapters
            )
                ? comic.chapters
                : [];


        if (
            chapters.length ===
            0
        ) {

            container.innerHTML =
                "<p>No chapters available yet.</p>";

            return;

        }


        chapters.forEach(
            (
                chapter,
                index
            ) => {

                const item =
                    createChapterLink(
                        comicId,
                        chapter,
                        index
                    );

                container.appendChild(
                    item
                );

            }
        );

    }
    catch (error) {

        console.error(
            "Error loading chapters:",
            error
        );

        container.innerHTML =
            "<p>Unable to load chapters.</p>";

    }

}


/* =========================================
   RENDER SERIES + CHAPTERS
========================================= */

function renderSeriesChapters(
    comicId,
    comic,
    container
) {

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
        (
            currentSeries
        ) => {

            /*
            =========================================
            SERIES CONTAINER
            =========================================
            */

            const seriesBlock =
                document.createElement(
                    "div"
                );

            seriesBlock.className =
                "comic-series";


            /*
            =========================================
            SERIES TITLE
            =========================================
            */

            const seriesTitle =
                document.createElement(
                    "h3"
                );

            seriesTitle.className =
                "comic-series-title";

            seriesTitle.textContent =
                currentSeries.title ||
                "Untitled Series";


            seriesBlock.appendChild(
                seriesTitle
            );


            /*
            =========================================
            SERIES DESCRIPTION
            =========================================
            */

            if (
                currentSeries.description
            ) {

                const seriesDescription =
                    document.createElement(
                        "p"
                    );

                seriesDescription.className =
                    "comic-series-description";

                seriesDescription.textContent =
                    currentSeries.description;

                seriesBlock.appendChild(
                    seriesDescription
                );

            }


            /*
            =========================================
            CHAPTER LIST
            =========================================
            */

            const chapterList =
                document.createElement(
                    "div"
                );

            chapterList.className =
                "series-chapter-list";


            const chapters =
                Array.isArray(
                    currentSeries.chapters
                )
                    ? currentSeries.chapters
                    : [];


            if (
                chapters.length ===
                0
            ) {

                const empty =
                    document.createElement(
                        "p"
                    );

                empty.textContent =
                    "No chapters available yet.";

                chapterList.appendChild(
                    empty
                );

            }
            else {

                chapters.forEach(
                    (
                        chapter,
                        index
                    ) => {

                        const chapterData = {

                            ...chapter,

                            seriesId:
                                chapter.seriesId ||
                                currentSeries.id

                        };


                        const item =
                            createChapterLink(
                                comicId,
                                chapterData,
                                index
                            );


                        chapterList.appendChild(
                            item
                        );

                    }
                );

            }


            seriesBlock.appendChild(
                chapterList
            );


            container.appendChild(
                seriesBlock
            );

        }
    );

}


/* =========================================
   CREATE CHAPTER LINK
========================================= */

function createChapterLink(
    comicId,
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

    const chapterTitle =
        getChapterTitle(
            chapter,
            index
        );


    item.textContent =
        chapterTitle;


    /*
    =========================================
    CHAPTER ID
    =========================================
    */

    const chapterId =
        getChapterIdentifier(
            chapter
        );


    /*
    =========================================
    CHAPTER LINK
    =========================================
    */

    if (
        chapterId
    ) {

        item.href =
            buildChapterURL(
                comicId,
                chapterId
            );

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
   GET CHAPTER TITLE
========================================= */

function getChapterTitle(
    chapter,
    index
) {

    if (
        typeof chapter ===
        "string"
    ) {

        return chapter;

    }


    if (
        !chapter ||
        typeof chapter !==
        "object"
    ) {

        return `Chapter ${index + 1}`;

    }


    if (
        chapter.title
    ) {

        if (
            chapter.number !==
            undefined &&
            chapter.title.toLowerCase()
                .startsWith(
                    "chapter"
                )
        ) {

            return `Chapter ${chapter.number} - ${chapter.subtitle || ""}`
                .trim();

        }

        return chapter.title;

    }


    if (
        chapter.number !==
        undefined &&
        chapter.number !==
        null
    ) {

        return `Chapter ${chapter.number}`;

    }


    return `Chapter ${index + 1}`;

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
   BUILD CHAPTER URL
========================================= */

function buildChapterURL(
    comicId,
    chapterId
) {

    return (

        `chapter.html` +

        `?id=${encodeURIComponent(
            comicId
        )}` +

        `&chapter=${encodeURIComponent(
            chapterId
        )}`

    );

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

}


/* =========================================
   GET COMIC ID FROM URL
========================================= */

function getComicIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (

        params.get("id") ||
        params.get("comic") ||
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
