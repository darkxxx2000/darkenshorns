"use strict";

/* ==========================================================
   DARKENSHORNS
   CHAPTER SYSTEM - FIXED
========================================================== */

let currentComic = null;
let currentChapter = null;
let allChapters = [];


/* ==========================================================
   INIT
========================================================== */

document.addEventListener("DOMContentLoaded", initChapter);


async function initChapter() {

    const params = new URLSearchParams(
        window.location.search
    );

    /*
    Accept both formats:

    chapter.html?id=ryuko-matoi&chapter=Chapter-01

    and

    chapter.html?comic=ryuko-matoi&chapter=Chapter-01
    */

    const comicId =
        params.get("comic") ||
        params.get("id");

    const chapterId =
        params.get("chapter");


    if (!comicId || !chapterId) {

        showError(
            "Chapter information missing."
        );

        return;

    }


    try {

        /*
        1. Load the comic JSON
        */

        const comicResponse =
            await fetch(
                `../data/comics/${comicId}.json`
            );


        if (!comicResponse.ok) {

            throw new Error(
                `Comic not found: ${comicId}`
            );

        }


        currentComic =
            await comicResponse.json();


        /*
        2. Find the chapter
        */

        const chapters =
            Array.isArray(currentComic.chapters)
                ? currentComic.chapters
                : [];


        const chapterIndex =
            chapters.findIndex(
                chapter => {

                    const id =
                        typeof chapter === "string"
                            ? chapter
                            : chapter.id ||
                              chapter.slug ||
                              chapter.chapter;

                    return (
                        String(id).toLowerCase() ===
                        String(chapterId).toLowerCase()
                    );

                }
            );


        if (chapterIndex === -1) {

            showError(
                "Chapter not found."
            );

            return;

        }


        const chapterInfo =
            chapters[chapterIndex];


        /*
        3. Get chapter data
        */

        const folder =
            typeof chapterInfo === "string"
                ? ""
                : chapterInfo.folder || "";


        const chapterFile =
            typeof chapterInfo === "string"
                ? chapterInfo
                : chapterInfo.id ||
                  chapterInfo.slug ||
                  chapterInfo.chapter;


        if (!folder || !chapterFile) {

            showError(
                "Chapter data is incomplete."
            );

            return;

        }


        /*
        4. Load physical chapter JSON

        Example:

        data/chapters/
        ryuko-matoi/
        Ryuko-vs-Huge-Dildo/
        Chapter-01.json
        */

        const chapterResponse =
            await fetch(
                `../data/chapters/${encodeURIComponent(comicId)}/${encodeURIComponent(folder)}/${encodeURIComponent(chapterFile)}.json`
            );


        if (!chapterResponse.ok) {

            throw new Error(
                `Cannot load chapter file: ${chapterFile}`
            );

        }


        currentChapter =
            await chapterResponse.json();


        /*
        Store navigation data
        */

        allChapters =
            chapters.map(
                (chapter, index) => {

                    if (typeof chapter === "string") {

                        return {
                            id: chapter,
                            title: chapter,
                            folder: "",
                            index: index
                        };

                    }

                    return {
                        ...chapter,
                        index: index
                    };

                }
            );


        /*
        Render everything
        */

        renderChapter();

        setupReaderLinks();

        setupNavigation();

        renderPreview();


    } catch (error) {

        console.error(
            "Chapter loading error:",
            error
        );


        showError(
            "Unable to load chapter."
        );

    }

}


/* ==========================================================
   RENDER CHAPTER
========================================================== */

function renderChapter() {

    const comicTitle =
        currentComic.title ||
        "Comic";


    const chapterTitle =
        currentChapter.title ||
        "Chapter";


    document.title =
        `${comicTitle} - ${chapterTitle}`;


    document.getElementById(
        "comic-name"
    ).textContent =
        comicTitle;


    document.getElementById(
        "chapter-name"
    ).textContent =
        chapterTitle;


    document.getElementById(
        "chapter-title"
    ).textContent =
        chapterTitle;


    /*
    Number of pages
    */

    const pages =
        getChapterPages();


    document.getElementById(
        "chapter-pages"
    ).textContent =
        `Pages: ${pages.length}`;


    document.getElementById(
        "chapter-date"
    ).textContent =
        `Date: ${
            currentChapter.releaseDate ||
            currentChapter.date ||
            currentComic.updated ||
            "-"
        }`;


    /*
    Back to comic
    */

    document.getElementById(
        "comic-link"
    ).href =
        `comic.html?id=${encodeURIComponent(currentComic.id)}`;


    document.getElementById(
        "back-comic"
    ).href =
        `comic.html?id=${encodeURIComponent(currentComic.id)}`;

}


/* ==========================================================
   READER LINKS
========================================================== */

function setupReaderLinks() {

    const grid =
        document.getElementById(
            "grid-reader"
        );


    const webtoon =
        document.getElementById(
            "webtoon-reader"
        );


    const comicId =
        encodeURIComponent(
            currentComic.id
        );


    const folder =
        encodeURIComponent(
            getCurrentFolder()
        );


    const chapter =
        encodeURIComponent(
            getCurrentChapterId()
        );


    /*
    PAGE MODE
    */

    if (grid) {

        grid.href =
            `reader-grid.html?comic=${comicId}&folder=${folder}&chapter=${chapter}`;

    }


    /*
    WEBTOON MODE
    */

    if (webtoon) {

        webtoon.href =
            `reader-webtoon.html?comic=${comicId}&folder=${folder}&chapter=${chapter}`;

    }

}


/* ==========================================================
   CHAPTER NAVIGATION
========================================================== */

function setupNavigation() {

    const currentIndex =
        allChapters.findIndex(
            chapter =>
                String(
                    chapter.id
                ).toLowerCase() ===
                String(
                    getCurrentChapterId()
                ).toLowerCase()
        );


    const previous =
        currentIndex > 0
            ? allChapters[currentIndex - 1]
            : null;


    const next =
        currentIndex >= 0 &&
        currentIndex < allChapters.length - 1
            ? allChapters[currentIndex + 1]
            : null;


    const previousButton =
        document.getElementById(
            "previous-chapter"
        );


    const nextButton =
        document.getElementById(
            "next-chapter"
        );


    if (previous) {

        previousButton.href =
            buildChapterURL(
                previous
            );

    } else {

        previousButton.style.display =
            "none";

    }


    if (next) {

        nextButton.href =
            buildChapterURL(
                next
            );

    } else {

        nextButton.style.display =
            "none";

    }

}


/* ==========================================================
   BUILD CHAPTER URL
========================================================== */

function buildChapterURL(
    chapter
) {

    return (
        `chapter.html` +
        `?comic=${encodeURIComponent(currentComic.id)}` +
        `&folder=${encodeURIComponent(chapter.folder || "")}` +
        `&chapter=${encodeURIComponent(chapter.id)}`
    );

}


/* ==========================================================
   PREVIEW
========================================================== */

function renderPreview() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const pages =
        getChapterPages();


    const limit =
        Math.min(
            pages.length,
            12
        );


    for (
        let i = 0;
        i < limit;
        i++
    ) {

        const image =
            document.createElement(
                "img"
            );


        const page =
            pages[i];


        const imageURL =
            getPageImageURL(
                page,
                i
            );


        image.src =
            imageURL;


        image.alt =
            `Page ${i + 1}`;


        image.loading =
            "lazy";


        image.addEventListener(
            "click",
            () => {

                window.location.href =
                    `reader-grid.html` +
                    `?comic=${encodeURIComponent(currentComic.id)}` +
                    `&folder=${encodeURIComponent(getCurrentFolder())}` +
                    `&chapter=${encodeURIComponent(getCurrentChapterId())}` +
                    `&page=${i + 1}`;

            }
        );


        container.appendChild(
            image
        );

    }

}


/* ==========================================================
   GET PAGES
========================================================== */

function getChapterPages() {

    /*
    Supports:

    "pages": []

    or

    "images": []

    or

    "content": []
    */

    if (
        Array.isArray(
            currentChapter.pages
        )
    ) {

        return currentChapter.pages;

    }


    if (
        Array.isArray(
            currentChapter.images
        )
    ) {

        return currentChapter.images;

    }


    if (
        Array.isArray(
            currentChapter.content
        )
    ) {

        return currentChapter.content;

    }


    /*
    If pages is a number,
    generate page names.
    */

    if (
        typeof currentChapter.pages ===
        "number"
    ) {

        return Array.from(
            {
                length:
                    currentChapter.pages
            },
            (_, index) =>
                index + 1
        );

    }


    return [];

}


/* ==========================================================
   IMAGE URL
========================================================== */

function getPageImageURL(
    page,
    index
) {

    /*
    If JSON contains direct URL
    */

    if (
        typeof page === "string"
    ) {

        if (
            page.startsWith("http://") ||
            page.startsWith("https://") ||
            page.startsWith("../")
        ) {

            return page;

        }


        /*
        Relative image path
        */

        if (
            page.includes("/") ||
            page.includes(".webp") ||
            page.includes(".jpg") ||
            page.includes(".png")
        ) {

            return `../${page}`;

        }

    }


    /*
    If page is an object
    */

    if (
        typeof page === "object" &&
        page !== null
    ) {

        if (page.url) {

            return page.url;

        }

        if (page.image) {

            return page.image;

        }

        if (page.src) {

            return page.src;

        }

    }


    /*
    Fallback:
    001.webp
    002.webp
    etc.

    Located in:

    data/chapters/
    comicId/
    folder/
    */

    const number =
        String(
            index + 1
        ).padStart(
            3,
            "0"
        );


    return (
        `../data/chapters/` +
        `${encodeURIComponent(currentComic.id)}/` +
        `${encodeURIComponent(getCurrentFolder())}/` +
        `${number}.webp`
    );

}


/* ==========================================================
   CURRENT FOLDER
========================================================== */

function getCurrentFolder() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("folder") ||
        currentChapter.folder ||
        ""
    );

}


/* ==========================================================
   CURRENT CHAPTER ID
========================================================== */

function getCurrentChapterId() {

    return (
        currentChapter.id ||
        currentChapter.slug ||
        currentChapter.chapter ||
        ""
    );

}


/* ==========================================================
   ERROR
========================================================== */

function showError(
    message
) {

    const page =
        document.querySelector(
            ".chapter-page"
        );


    if (page) {

        page.innerHTML = `

        <section class="error-message">

            <h1>
                ${message}
            </h1>

            <a href="../index.html">
                Return Home
            </a>

        </section>

        `;

    }

}
