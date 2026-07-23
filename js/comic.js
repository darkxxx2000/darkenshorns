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
        comic.html está dentro de /pages/
        Por eso usamos ../data/
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
        RENDER COMIC
        =========================================
        */

        renderComic(
            comic
        );


        /*
        =========================================
        LOAD CHAPTERS
        =========================================
        */

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
       BANNER
    ========================================= */

    const banner =
        document.getElementById(
            "comic-banner-image"
        );


    if (
        banner &&
        comic.banner
    ) {

        banner.src =
            normalizeAssetPath(
                comic.banner
            );


        banner.alt =
            comic.title ||
            "Comic Banner";

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


        genres.forEach(
            genre => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.textContent =
                    genre;


                genresContainer.appendChild(
                    tag
                );

            }
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


        tags.forEach(
            tagName => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.textContent =
                    tagName;


                tagsContainer.appendChild(
                    tag
                );

            }
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


        characters.forEach(
            character => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "character-card";


                if (
                    typeof character ===
                    "string"
                ) {

                    item.textContent =
                        character;

                }
                else if (
                    character &&
                    typeof character ===
                    "object"
                ) {

                    item.textContent =
                        character.name ||
                        "";

                }


                charactersContainer.appendChild(
                    item
                );

            }
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
            Array.isArray(
                comic.chapters
            )
                ? comic.chapters
                : [];


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
        firstChapterButton &&
        Array.isArray(
            comic.chapters
        ) &&
        comic.chapters.length > 0
    ) {

        const firstChapter =
            comic.chapters[0];


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

        /*
        =========================================
        USE CHAPTERS FROM COMIC JSON
        =========================================
        */

        const chapters =
            Array.isArray(
                comic.chapters
            )
                ? comic.chapters
                : [];


        container.innerHTML =
            "";


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


    /*
    =========================================
    USE TITLE
    =========================================
    */

    if (
        chapter.title
    ) {

        return chapter.title;

    }


    /*
    =========================================
    USE NUMBER
    =========================================
    */

    if (
        chapter.number !==
        undefined &&
        chapter.number !==
        null
    ) {

        return `Chapter ${chapter.number}`;

    }


    /*
    =========================================
    FALLBACK
    =========================================
    */

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

            chapter.folder ||

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

    Example:

    assets/comics/cover.webp

    Becomes:

    ../assets/comics/cover.webp
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
