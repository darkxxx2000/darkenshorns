"use strict";

/* ==========================================================
DARKENSHORNS
CHAPTER SYSTEM
========================================================== */

let currentComic = null;
let currentChapter = null;
let allChapters = [];

let viewerPages = [];
let viewerIndex = 0;
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


    const comicId =
        params.get("id") ||
        params.get("comic");


    const chapterId =
        params.get("chapter");


    if (
        !comicId ||
        !chapterId
    ) {

        showError(
            "Chapter information missing."
        );

        return;

    }


    try {

        /* ==================================================
           LOAD COMIC
        ================================================== */

        const comicPath =
            `../data/comics/` +
            `${encodeURIComponent(comicId)}.json`;


        const comicResponse =
            await fetch(
                comicPath
            );


        if (
            !comicResponse.ok
        ) {

            throw new Error(
                `Comic JSON not found: ${comicPath}`
            );

        }


        currentComic =
            await comicResponse.json();


        /* ==================================================
           GET ALL CHAPTERS
           
           Supports:
           
           1. Standard:
           comic.chapters[]
           
           2. Series:
           comic.series[].chapters[]
           ================================================== */

        allChapters =
            getAllChapters(
                currentComic
            );


        /* ==================================================
           FIND CHAPTER
           ================================================== */

        const chapterInfo =
            findChapter(
                allChapters,
                chapterId
            );


        if (
            !chapterInfo
        ) {

            throw new Error(
                `Chapter not found: ${chapterId}`
            );

        }


        /* ==================================================
           LOAD CHAPTER JSON
           ================================================== */

        let chapterData = {};


        if (
            typeof chapterInfo === "object" &&
            chapterInfo.file
        ) {

            const chapterPath =
                buildChapterJSONPath(
                    comicId,
                    chapterInfo
                );


            if (
                !chapterPath
            ) {

                throw new Error(
                    "Chapter path could not be created."
                );

            }


            console.log(
                "Loading chapter:",
                chapterPath
            );


            const chapterResponse =
                await fetch(
                    chapterPath
                );


            if (
                !chapterResponse.ok
            ) {

                throw new Error(
                    `Chapter JSON not found: ${chapterPath}`
                );

            }


            chapterData =
                await chapterResponse.json();

        }


        /* ==================================================
           MERGE CHAPTER INFO + CHAPTER DATA
           ================================================== */

        currentChapter =
            Object.assign(
                {},
                typeof chapterInfo === "object"
                    ? chapterInfo
                    : {
                        id: chapterInfo
                    },
                chapterData
            );


        /* ==================================================
           RENDER
           ================================================== */

        renderChapter();

        setupReaderLinks();

        setupNavigation();

        renderPreview();

        setupViewer();

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
GET ALL CHAPTERS
========================================================== */

function getAllChapters(
    comic
) {

    /* ======================================================
       STANDARD COMIC
       
       comic.chapters[]
       ====================================================== */

    if (
        Array.isArray(
            comic.chapters
        )
    ) {

        return comic.chapters;

    }


    /* ======================================================
       SERIES COMIC
       
       comic.series[].chapters[]
       ====================================================== */

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

                        if (
                            typeof chapter ===
                            "string"
                        ) {

                            chapters.push({

                                id:
                                    chapter,

                                seriesId:
                                    series.id

                            });

                            return;

                        }


                        if (
                            chapter &&
                            typeof chapter ===
                            "object"
                        ) {

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

                    }
                );

            }
        );


        return chapters;

    }


    return [];

}


/* ==========================================================
FIND CHAPTER
========================================================== */

function findChapter(
    chapters,
    chapterId
) {

    const search =
        String(
            chapterId
        ).toLowerCase();


    return chapters.find(
        chapter => {

            if (
                typeof chapter ===
                "string"
            ) {

                return (
                    chapter.toLowerCase() ===
                    search
                );

            }


            if (
                !chapter ||
                typeof chapter !==
                "object"
            ) {

                return false;

            }


            const id =
                chapter.id ||
                chapter.slug ||
                chapter.chapter ||
                chapter.number ||
                "";


            return (
                String(
                    id
                ).toLowerCase() ===
                search
            );

        }
    );

}


/* ==========================================================
BUILD CHAPTER JSON PATH
========================================================== */

function buildChapterJSONPath(
    comicId,
    chapter
) {

    if (
        !chapter
    ) {

        return "";

    }


    const file =
        typeof chapter.file === "string"
            ? chapter.file.trim()
            : "";


    const folder =
        typeof chapter.folder === "string"
            ? chapter.folder.trim()
            : "";


    if (
        !file
    ) {

        return "";

    }


    /* ======================================================
       EXPLICIT PATH
       ====================================================== */

    if (
        typeof chapter.path === "string" &&
        chapter.path.trim()
    ) {

        return normalizeDataPath(
            chapter.path.trim()
        );

    }


    /* ======================================================
       FULL EXTERNAL URL
       ====================================================== */

    if (
        file.startsWith(
            "http://"
        ) ||
        file.startsWith(
            "https://"
        )
    ) {

        return file;

    }


    /* ======================================================
       PATH ALREADY INSIDE DATA
       ====================================================== */

    if (
        file.startsWith(
            "data/"
        )
    ) {

        return `../${file}`;

    }


    if (
        file.startsWith(
            "chapters/"
        )
    ) {

        return `../data/${file}`;

    }


    /* ======================================================
       FOLDER + FILE
       
       Example:
       
       data/chapters/ai-chan/huge-dildo/chapter-01.json
       
       data/chapters/ryuko-matoi/Ryuko-vs-Huge-Dildo/file.json
       ====================================================== */

    if (
        folder
    ) {

        return (
            `../data/chapters/` +
            `${encodeURIComponent(comicId)}/` +
            `${encodeURIComponent(folder)}/` +
            `${encodeURIComponent(file)}`
        );

    }


    /* ======================================================
       FILE ONLY
       ====================================================== */

    return (
        `../data/chapters/` +
        `${encodeURIComponent(comicId)}/` +
        `${encodeURIComponent(file)}`
    );

}


/* ==========================================================
NORMALIZE DATA PATH
========================================================== */

function normalizeDataPath(
    path
) {

    if (
        !path
    ) {

        return "";

    }


    if (
        path.startsWith(
            "http://"
        ) ||
        path.startsWith(
            "https://"
        )
    ) {

        return path;

    }


    if (
        path.startsWith(
            "./"
        )
    ) {

        return path;

    }


    if (
        path.startsWith(
            "../"
        )
    ) {

        return path;

    }


    if (
        path.startsWith(
            "data/"
        )
    ) {

        return `../${path}`;

    }


    return (
        `../data/${path}`
    );

}


/* ==========================================================
RENDER CHAPTER
========================================================== */

function renderChapter() {

    if (
        !currentComic ||
        !currentChapter
    ) {

        return;

    }


    const comicTitle =
        currentComic.title ||
        "Comic";


    const chapterNumber =
        currentChapter.number ||
        "";


    const chapterTitle =
        currentChapter.title ||
        "Chapter";


    const subtitle =
        currentChapter.subtitle ||
        "";


    document.title =
        `${comicTitle} - ${chapterTitle}`;


    const comicName =
        document.getElementById(
            "comic-name"
        );


    if (
        comicName
    ) {

        comicName.textContent =
            comicTitle;

    }


    const chapterName =
        document.getElementById(
            "chapter-name"
        );


    if (
        chapterName
    ) {

        chapterName.textContent =
            chapterNumber
                ? `Chapter ${chapterNumber}: ${chapterTitle}`
                : chapterTitle;

    }


    const title =
        document.getElementById(
            "chapter-title"
        );


    if (
        title
    ) {

        title.textContent =
            chapterTitle;

    }


    const subtitleElement =
        document.getElementById(
            "chapter-subtitle"
        );


    if (
        subtitleElement
    ) {

        subtitleElement.textContent =
            subtitle;

    }


    const pages =
        getChapterPages();


    const pagesElement =
        document.getElementById(
            "chapter-pages"
        );


    if (
        pagesElement
    ) {

        pagesElement.textContent =
            `Pages: ${pages.length}`;

    }


    const dateElement =
        document.getElementById(
            "chapter-date"
        );


    if (
        dateElement
    ) {

        dateElement.textContent =
            `Date: ${
                currentChapter.date ||
                currentChapter.releaseDate ||
                currentChapter.updated ||
                "-"
            }`;

    }


    const comicId =
        currentComic.id ||
        "";


    const comicLink =
        document.getElementById(
            "comic-link"
        );


    if (
        comicLink &&
        comicId
    ) {

        comicLink.href =
            `comic.html?id=${encodeURIComponent(
                comicId
            )}`;

    }

}


/* ==========================================================
RENDER LINKS
========================================================== */

function setupReaderLinks() {

    const normal =
        document.getElementById(
            "grid-reader"
        );


    const webtoon =
        document.getElementById(
            "webtoon-reader"
        );


    const container =
        document.getElementById(
            "preview-container"
        );


    if (
        !container
    ) {

        return;

    }


    normal?.addEventListener(
        "click",
        () => {

            container.classList.remove(
                "webtoon-mode"
            );


            normal.classList.add(
                "active"
            );


            webtoon?.classList.remove(
                "active"
            );

        }
    );


    webtoon?.addEventListener(
        "click",
        () => {

            container.classList.add(
                "webtoon-mode"
            );


            webtoon.classList.add(
                "active"
            );


            normal?.classList.remove(
                "active"
            );

        }
    );

}


/* ==========================================================
RENDER PREVIEW
========================================================== */

function renderPreview() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (
        !container
    ) {

        console.error(
            "preview-container not found."
        );

        return;

    }


    const pages =
        getChapterPages();


    container.innerHTML =
        "";


    if (
        !pages.length
    ) {

        container.innerHTML =
            `
            <div class="reader-empty">
                No pages available.
            </div>
            `;

        return;

    }


    pages.forEach(
        (
            page,
            index
        ) => {

            const image =
                document.createElement(
                    "img"
                );


            const imageURL =
                getPageURL(
                    page
                );


            if (
                !imageURL
            ) {

                return;

            }


            image.src =
                imageURL;


            image.alt =
                `Page ${index + 1}`;


            image.loading =
                index < 3
                    ? "eager"
                    : "lazy";


            image.dataset.index =
                index;


            image.addEventListener(
                "click",
                function() {

                    openViewer(
                        index
                    );

                }
            );


            image.addEventListener(
                "error",
                function() {

                    console.error(
                        "Image failed:",
                        image.src
                    );

                }
            );


            container.appendChild(
                image
            );

        }
    );

}


/* ==========================================================
GET CHAPTER PAGES
========================================================== */

function getChapterPages() {

    if (
        !currentChapter
    ) {

        return [];

    }


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


    return [];

}


/* ==========================================================
IMAGE URL
========================================================== */

function getPageURL(
    page
) {

    let url =
        "";


    if (
        typeof page === "string"
    ) {

        url =
            page.trim();

    }
    else if (
        page &&
        typeof page === "object"
    ) {

        url =
            page.url ||
            page.image ||
            page.src ||
            page.path ||
            "";

    }


    if (
        !url
    ) {

        return "";

    }


    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        ) ||
        url.startsWith(
            "//"
        ) ||
        url.startsWith(
            "data:"
        )
    ) {

        return url;

    }


    if (
        url.startsWith(
            "./"
        ) ||
        url.startsWith(
            "../"
        )
    ) {

        return url;

    }


    if (
        url.startsWith(
            "assets/"
        )
    ) {

        return `../${url}`;

    }


    if (
        url.startsWith(
            "data/"
        )
    ) {

        return `../${url}`;

    }


    return (
        `../${url}`
    );

}


/* ==========================================================
VIEWER SETUP
========================================================== */

function setupViewer() {

    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (
        !viewer
    ) {

        return;

    }


    const closeButton =
        document.getElementById(
            "viewer-close"
        );


    const previousButton =
        document.getElementById(
            "viewer-prev"
        );


    const nextButton =
        document.getElementById(
            "viewer-next"
        );


    if (
        closeButton
    ) {

        closeButton.addEventListener(
            "click",
            closeViewer
        );

    }


    if (
        previousButton
    ) {

        previousButton.addEventListener(
            "click",
            previousImage
        );

    }


    if (
        nextButton
    ) {

        nextButton.addEventListener(
            "click",
            nextImage
        );

    }


    viewer.addEventListener(
        "wheel",
        function(event) {

            event.preventDefault();


            if (
                event.deltaY < 0
            ) {

                viewerScale +=
                    0.15;

            }
            else {

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


    viewer.addEventListener(
        "mousedown",
        startDrag
    );


    document.addEventListener(
        "mousemove",
        dragImage
    );


    document.addEventListener(
        "mouseup",
        stopDrag
    );


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                !viewer.classList.contains(
                    "active"
                )
            ) {

                return;

            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                nextImage();

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                previousImage();

            }


            if (
                event.key ===
                "Escape"
            ) {

                closeViewer();

            }

        }
    );

}


/* ==========================================================
OPEN VIEWER
========================================================== */

function openViewer(
    index
) {

    viewerPages =
        getChapterPages();


    viewerIndex =
        index;


    resetImagePosition();


    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (
        !viewer
    ) {

        return;

    }


    viewer.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    showViewerImage();

}


/* ==========================================================
SHOW VIEWER IMAGE
========================================================== */

function showViewerImage() {

    const image =
        document.getElementById(
            "viewer-image"
        );


    if (
        !image ||
        !viewerPages.length
    ) {

        return;

    }


    image.src =
        getPageURL(
            viewerPages[
                viewerIndex
            ]
        );


    image.alt =
        `Page ${viewerIndex + 1}`;


    updateViewerTransform();

}


/* ==========================================================
NEXT IMAGE
========================================================== */

function nextImage() {

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

        viewerIndex =
            0;

    }


    resetImagePosition();

    showViewerImage();

}


/* ==========================================================
PREVIOUS IMAGE
========================================================== */

function previousImage() {

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


    resetImagePosition();

    showViewerImage();

}


/* ==========================================================
CLOSE VIEWER
========================================================== */

function closeViewer() {

    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (
        !viewer
    ) {

        return;

    }


    viewer.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";


    resetImagePosition();

}


/* ==========================================================
RESET IMAGE POSITION
========================================================== */

function resetImagePosition() {

    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;


    updateViewerTransform();

}


/* ==========================================================
TRANSFORM
========================================================== */

function updateViewerTransform() {

    const image =
        document.getElementById(
            "viewer-image"
        );


    if (
        !image
    ) {

        return;

    }


    image.style.transform =
        `translate(${imagePositionX}px, ${imagePositionY}px) scale(${viewerScale})`;

}


/* ==========================================================
DRAG
========================================================== */

function startDrag(
    event
) {

    if (
        event.target.id !==
        "viewer-image"
    ) {

        return;

    }


    if (
        event.button !== 0
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


function dragImage(
    event
) {

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


function stopDrag() {

    isDragging =
        false;

}


/* ==========================================================
CHAPTER NAVIGATION
========================================================== */

function setupNavigation() {

    const currentIndex =
        allChapters.findIndex(
            chapter => {

                return (
                    String(
                        getChapterIdentifier(
                            chapter
                        )
                    ).toLowerCase() ===
                    String(
                        getChapterIdentifier(
                            currentChapter
                        )
                    ).toLowerCase()
                );

            }
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


    if (
        previousButton
    ) {

        if (
            previous
        ) {

            previousButton.href =
                buildChapterURL(
                    previous
                );

            previousButton.style.display =
                "";

        }
        else {

            previousButton.style.display =
                "none";

        }

    }


    if (
        nextButton
    ) {

        if (
            next
        ) {

            nextButton.href =
                buildChapterURL(
                    next
                );

            nextButton.style.display =
                "";

        }
        else {

            nextButton.style.display =
                "none";

        }

    }

}


/* ==========================================================
CHAPTER IDENTIFIER
========================================================== */

function getChapterIdentifier(
    chapter
) {

    if (
        !chapter
    ) {

        return "";

    }


    if (
        typeof chapter ===
        "string"
    ) {

        return chapter;

    }


    return (
        chapter.id ||
        chapter.slug ||
        chapter.chapter ||
        chapter.number ||
        ""
    );

}


/* ==========================================================
BUILD CHAPTER URL
========================================================== */

function buildChapterURL(
    chapter
) {

    const comicId =
        currentComic &&
        currentComic.id
            ? currentComic.id
            : "";


    const chapterId =
        getChapterIdentifier(
            chapter
        );


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


/* ==========================================================
ERROR
========================================================== */

function showError(
    message
) {

    console.error(
        "Chapter error:",
        message
    );


    const container =
        document.getElementById(
            "preview-container"
        );


    if (
        container
    ) {

        container.innerHTML =
            `
            <div class="reader-error">
                ${message}
            </div>
            `;

    }


    const title =
        document.getElementById(
            "chapter-title"
        );


    if (
        title
    ) {

        title.textContent =
            "Error";

    }

}
