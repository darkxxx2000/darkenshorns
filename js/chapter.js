```javascript
"use strict";

/* ==========================================================
   DARKENSHORNS
   CHAPTER SYSTEM - FIXED
========================================================== */

let currentComic = null;
let currentChapter = null;
let allChapters = [];


/* ==========================================================
   IMAGE VIEWER
========================================================== */

let viewerIndex = 0;
let viewerPages = [];

let viewerScale = 1;

let isDragging = false;

let dragStartX = 0;
let dragStartY = 0;

let imagePositionX = 0;
let imagePositionY = 0;


/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initChapter
);


async function initChapter() {

    const params =
        new URLSearchParams(
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
        1. Load comic JSON
        */

        const comicResponse =
            await fetch(
                `../data/comics/${encodeURIComponent(comicId)}.json`
            );


        if (!comicResponse.ok) {

            throw new Error(
                `Comic not found: ${comicId}`
            );

        }


        currentComic =
            await comicResponse.json();


        /*
        2. Find chapter
        */

        const chapters =
            Array.isArray(
                currentComic.chapters
            )
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
        3. Chapter folder
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

                    if (
                        typeof chapter === "string"
                    ) {

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
        Render
        */

        renderChapter();

        setupReaderLinks();

        setupNavigation();

        renderPreview();


    }
    catch (error) {

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
   READER MODES
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


    /*
    Normal Mode

    Does NOT open another page.
    */

    if (grid) {

        grid.removeAttribute(
            "href"
        );


        grid.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openNormalMode();

            }
        );

    }


    /*
    Webtoon Mode

    Does NOT open another page.
    */

    if (webtoon) {

        webtoon.removeAttribute(
            "href"
        );


        webtoon.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openWebtoonMode();

            }
        );

    }

}


/* ==========================================================
   NORMAL MODE
========================================================== */

function openNormalMode() {

    const pages =
        getChapterPages();


    if (
        !pages.length
    ) {

        return;

    }


    viewerPages =
        pages;


    viewerIndex = 0;


    createViewer();


    showViewerImage();

}


/* ==========================================================
   WEBTOON MODE
========================================================== */

function openWebtoonMode() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {

        return;

    }


    const pages =
        getChapterPages();


    container.innerHTML =
        "";


    container.classList.add(
        "webtoon-mode"
    );


    pages.forEach(
        (page, index) => {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                getPageImageURL(
                    page,
                    index
                );


            image.alt =
                `Page ${index + 1}`;


            image.loading =
                "lazy";


            image.addEventListener(
                "click",
                () => {

                    viewerPages =
                        pages;

                    viewerIndex =
                        index;

                    createViewer();

                    showViewerImage();

                }
            );


            container.appendChild(
                image
            );

        }
    );

}


/* ==========================================================
   NORMAL PREVIEW
========================================================== */

function renderPreview() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    container.classList.remove(
        "webtoon-mode"
    );


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


        image.src =
            getPageImageURL(
                page,
                i
            );


        image.alt =
            `Page ${i + 1}`;


        image.loading =
            "lazy";


        /*
        Click opens viewer
        in same page.
        */

        image.addEventListener(
            "click",
            () => {

                viewerPages =
                    pages;


                viewerIndex =
                    i;


                createViewer();


                showViewerImage();

            }
        );


        container.appendChild(
            image
        );

    }

}


/* ==========================================================
   CREATE VIEWER
========================================================== */

function createViewer() {

    let viewer =
        document.getElementById(
            "image-viewer"
        );


    if (!viewer) {

        viewer =
            document.createElement(
                "div"
            );


        viewer.id =
            "image-viewer";


        viewer.innerHTML = `

            <button
                id="viewer-close"
                aria-label="Close">
                ×
            </button>

            <img
                id="viewer-image"
                alt="Page">

        `;


        document.body.appendChild(
            viewer
        );


        /*
        Close
        */

        document
            .getElementById(
                "viewer-close"
            )
            .addEventListener(
                "click",
                closeImageViewer
            );


        /*
        Right click
        = next image
        */

        viewer.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();

                nextViewerImage();

            }
        );


        /*
        Left click
        = previous image
        */

        viewer.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "viewer-image"
                ) {

                    previousViewerImage();

                }

            }
        );


        /*
        Mouse wheel
        = zoom
        */

        viewer.addEventListener(
            "wheel",
            event => {

                event.preventDefault();


                if (
                    event.deltaY < 0
                ) {

                    viewerScale +=
                        0.15;

                } else {

                    viewerScale -=
                        0.15;

                }


                viewerScale =
                    Math.max(
                        0.5,
                        Math.min(
                            viewerScale,
                            5
                        )
                    );


                updateViewerTransform();

            },
            {
                passive: false
            }
        );


        /*
        Drag start
        */

        viewer.addEventListener(
            "mousedown",
            event => {

                if (
                    event.button !== 0
                ) {

                    return;

                }


                if (
                    event.target.id !==
                    "viewer-image"
                ) {

                    return;

                }


                isDragging =
                    true;


                dragStartX =
                    event.clientX -
                    imagePositionX;


                dragStartY =
                    event.clientY -
                    imagePositionY;

            }
        );


        /*
        Drag move
        */

        document.addEventListener(
            "mousemove",
            event => {

                if (
                    !isDragging
                ) {

                    return;

                }


                imagePositionX =
                    event.clientX -
                    dragStartX;


                imagePositionY =
                    event.clientY -
                    dragStartY;


                updateViewerTransform();

            }
        );


        /*
        Drag end
        */

        document.addEventListener(
            "mouseup",
            () => {

                isDragging =
                    false;

            }
        );

    }


    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;


    viewer.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


/* ==========================================================
   SHOW VIEWER IMAGE
========================================================== */

function showViewerImage() {

    const image =
        document.getElementById(
            "viewer-image"
        );


    if (!image) {

        return;

    }


    image.src =
        getPageImageURL(
            viewerPages[
                viewerIndex
            ],
            viewerIndex
        );


    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;


    updateViewerTransform();

}


/* ==========================================================
   UPDATE VIEWER TRANSFORM
========================================================== */

function updateViewerTransform() {

    const image =
        document.getElementById(
            "viewer-image"
        );


    if (!image) {

        return;

    }


    image.style.transform =
        `translate(
            ${imagePositionX}px,
            ${imagePositionY}px
        )
        scale(
            ${viewerScale}
        )`;

}


/* ==========================================================
   NEXT IMAGE
========================================================== */

function nextViewerImage() {

    if (
        !viewerPages.length
    ) {

        return;

    }


    viewerIndex++;


    if (
        viewerIndex >=
        viewerPages.length
    ) {

        viewerIndex = 0;

    }


    showViewerImage();

}


/* ==========================================================
   PREVIOUS IMAGE
========================================================== */

function previousViewerImage() {

    if (
        !viewerPages.length
    ) {

        return;

    }


    viewerIndex--;


    if (
        viewerIndex < 0
    ) {

        viewerIndex =
            viewerPages.length - 1;

    }


    showViewerImage();

}


/* ==========================================================
   CLOSE VIEWER
========================================================== */

function closeImageViewer() {

    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (viewer) {

        viewer.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";

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
            ? allChapters[
                currentIndex - 1
            ]
            : null;


    const next =
        currentIndex >= 0 &&
        currentIndex <
            allChapters.length - 1

            ? allChapters[
                currentIndex + 1
            ]

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

        previousButton.style.display =
            "";

    } else {

        previousButton.style.display =
            "none";

    }


    if (next) {

        nextButton.href =
            buildChapterURL(
                next
            );

        nextButton.style.display =
            "";

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
        `?comic=${encodeURIComponent(
            currentComic.id
        )}` +
        `&folder=${encodeURIComponent(
            chapter.folder || ""
        )}` +
        `&chapter=${encodeURIComponent(
            chapter.id
        )}`
    );

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
    Direct URL
    */

    if (
        typeof page === "string"
    ) {

        if (
            page.startsWith(
                "http://"
            ) ||

            page.startsWith(
                "https://"
            ) ||

            page.startsWith(
                "../"
            )
        ) {

            return page;

        }


        if (
            page.includes("/") ||

            page.includes(
                ".webp"
            ) ||

            page.includes(
                ".jpg"
            ) ||

            page.includes(
                ".png"
            )
        ) {

            return `../${page}`;

        }

    }


    /*
    Object
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

        `${encodeURIComponent(
            currentComic.id
        )}/` +

        `${encodeURIComponent(
            getCurrentFolder()
        )}/` +

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
        params.get(
            "folder"
        ) ||

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
```
