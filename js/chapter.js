"use strict";

/* ==========================================================
   DARKENSHORNS
   UNIVERSAL CHAPTER READER

   NORMAL MODE
   WEBTOON MODE
   HD IMAGE VIEWER
   ZOOM
   DRAG
   KEYBOARD NAVIGATION
========================================================== */


let currentComic = null;

let currentChapter = null;

let allChapters = [];


/* ==========================================================
   VIEWER
========================================================== */

let viewerIndex = 0;

let viewerPages = [];

let viewerScale = 1;

let imagePositionX = 0;

let imagePositionY = 0;

let isDragging = false;

let dragStartX = 0;

let dragStartY = 0;


/* ==========================================================
   INIT
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initChapter
);


/* ==========================================================
   INIT CHAPTER
========================================================== */

async function initChapter() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const comicId =
        params.get("id") ||
        params.get("comic");


    const chapterNumber =
        Number(
            params.get("chapter")
        );


    if (
        !comicId ||
        !chapterNumber
    ) {

        showError(
            "Chapter information missing."
        );

        return;

    }


    try {

        /* ==================================================
           LOAD COMICS
        ================================================== */

        const comics =
            await loadJSON(
                "../data/comics.json"
            );


        /* ==================================================
           LOAD CHAPTERS
        ================================================== */

        allChapters =
            await loadJSON(
                "../data/chapters.json"
            );


        /* ==================================================
           FIND COMIC
        ================================================== */

        currentComic =
            comics.find(
                comic =>
                    String(
                        comic.id
                    ) ===
                    String(
                        comicId
                    )
            );


        if (
            !currentComic
        ) {

            showError(
                "Comic not found."
            );

            return;

        }


        /* ==================================================
           FIND CHAPTER
        ================================================== */

        currentChapter =
            allChapters.find(
                chapter => {

                    return (
                        String(
                            chapter.comicId
                        ) ===
                        String(
                            comicId
                        ) &&

                        Number(
                            chapter.number
                        ) ===
                        chapterNumber
                    );

                }
            );


        if (
            !currentChapter
        ) {

            showError(
                "Chapter not found."
            );

            return;

        }


        /* ==================================================
           RENDER
        ================================================== */

        renderChapter();


        setupReaderModes();


        setupNavigation();


        renderNormalMode();


    }
    catch (
        error
    ) {

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
   LOAD JSON
========================================================== */

async function loadJSON(
    url
) {

    const response =
        await fetch(
            url
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Cannot load " +
            url
        );

    }


    return await response.json();

}


/* ==========================================================
   RENDER CHAPTER
========================================================== */

function renderChapter() {

    const chapterTitle =
        currentChapter.title ||
        `Chapter ${currentChapter.number}`;


    const subtitle =
        currentChapter.subtitle ||
        "";


    const pages =
        getChapterPages();


    document.title =
        `${currentComic.title} - ${chapterTitle}`;


    const comicName =
        document.getElementById(
            "comic-name"
        );


    if (
        comicName
    ) {

        comicName.textContent =
            currentComic.title;

    }


    const chapterName =
        document.getElementById(
            "chapter-name"
        );


    if (
        chapterName
    ) {

        chapterName.textContent =
            `Chapter ${currentChapter.number}: ${chapterTitle}`;

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


    const chapterTitleElement =
        document.getElementById(
            "chapter-title"
        );


    if (
        chapterTitleElement
    ) {

        chapterTitleElement.textContent =
            `Chapter ${currentChapter.number}`;

    }


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
                "-"
            }`;

    }


    const comicId =
        currentComic.id ||
        getCurrentComicId();


    const comicURL =
        `comic.html?id=${
            encodeURIComponent(
                comicId
            )
        }`;


    const comicLink =
        document.getElementById(
            "comic-link"
        );


    if (
        comicLink
    ) {

        comicLink.href =
            comicURL;

    }


    const backComic =
        document.getElementById(
            "back-comic"
        );


    if (
        backComic
    ) {

        backComic.href =
            comicURL;

    }

}


/* ==========================================================
   READING MODE BUTTONS
========================================================== */

function setupReaderModes() {

    const normalButton =
        document.getElementById(
            "grid-reader"
        );


    const webtoonButton =
        document.getElementById(
            "webtoon-reader"
        );


    if (
        normalButton
    ) {

        normalButton.addEventListener(
            "click",
            function() {

                setActiveReaderButton(
                    normalButton,
                    webtoonButton
                );


                renderNormalMode();

            }
        );

    }


    if (
        webtoonButton
    ) {

        webtoonButton.addEventListener(
            "click",
            function() {

                setActiveReaderButton(
                    webtoonButton,
                    normalButton
                );


                renderWebtoonMode();

            }
        );

    }

}


/* ==========================================================
   ACTIVE READER BUTTON
========================================================== */

function setActiveReaderButton(
    activeButton,
    inactiveButton
) {

    if (
        activeButton
    ) {

        activeButton.classList.add(
            "active"
        );

    }


    if (
        inactiveButton
    ) {

        inactiveButton.classList.remove(
            "active"
        );

    }

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


    if (
        Array.isArray(
            currentChapter.content
        )
    ) {

        return currentChapter.content;

    }


    return [];

}


/* ==========================================================
   NORMAL MODE
========================================================== */

function renderNormalMode() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (
        !container
    ) {

        return;

    }


    const pages =
        getChapterPages();


    container.innerHTML =
        "";


    container.classList.remove(
        "webtoon-mode"
    );


    container.classList.add(
        "normal-mode"
    );


    if (
        !pages.length
    ) {

        container.innerHTML = `

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


            image.src =
                getPageImageURL(
                    page,
                    index
                );


            image.alt =
                `Page ${index + 1}`;


            image.loading =
                index < 4
                    ? "eager"
                    : "lazy";


            image.addEventListener(
                "click",
                function() {

                    openImageViewer(
                        pages,
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
   WEBTOON MODE
========================================================== */

function renderWebtoonMode() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (
        !container
    ) {

        return;

    }


    const pages =
        getChapterPages();


    container.innerHTML =
        "";


    container.classList.remove(
        "normal-mode"
    );


    container.classList.add(
        "webtoon-mode"
    );


    if (
        !pages.length
    ) {

        container.innerHTML = `

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


            image.src =
                getPageImageURL(
                    page,
                    index
                );


            image.alt =
                `Page ${index + 1}`;


            image.loading =
                index < 3
                    ? "eager"
                    : "lazy";


            image.addEventListener(
                "click",
                function() {

                    openImageViewer(
                        pages,
                        index
                    );

                }
            );


            image.addEventListener(
                "error",
                function() {

                    console.error(
                        "Webtoon image failed:",
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
   GET IMAGE URL
========================================================== */

function getPageImageURL(
    page,
    index
) {

    if (
        typeof page ===
        "string"
    ) {

        const value =
            page.trim();


        /*
        EXTERNAL URL
        */

        if (
            value.startsWith(
                "http://"
            ) ||
            value.startsWith(
                "https://"
            )
        ) {

            return value;

        }


        /*
        LOCAL URL
        */

        if (
            value.startsWith(
                "../"
            ) ||
            value.startsWith(
                "./"
            ) ||
            value.startsWith(
                "/"
            )
        ) {

            return value;

        }


        /*
        LOCAL FALLBACK
        */

        return buildLocalImagePath(
            value
        );

    }


    if (
        typeof page ===
        "object" &&
        page !== null
    ) {

        if (
            page.url
        ) {

            return page.url;

        }


        if (
            page.image
        ) {

            return page.image;

        }


        if (
            page.src
        ) {

            return page.src;

        }


        if (
            page.file
        ) {

            return buildLocalImagePath(
                page.file
            );

        }

    }


    return "";

}


/* ==========================================================
   LOCAL IMAGE PATH
========================================================== */

function buildLocalImagePath(
    filename
) {

    if (
        !filename
    ) {

        return "";

    }


    const folder =
        currentChapter.folder ||
        "";


    if (
        folder
    ) {

        return (
            `../uploads/comics/` +
            `${encodeURIComponent(
                folder
            )}/` +
            `${encodeURIComponent(
                filename
            )}`
        );

    }


    return (
        `../uploads/comics/` +
        `${encodeURIComponent(
            filename
        )}`
    );

}


/* ==========================================================
   OPEN IMAGE VIEWER
========================================================== */

function openImageViewer(
    pages,
    index
) {

    viewerPages =
        pages;


    viewerIndex =
        index;


    createViewer();


    showViewerImage();

}


/* ==========================================================
   CREATE VIEWER
========================================================== */

function createViewer() {

    let viewer =
        document.getElementById(
            "image-viewer"
        );


    if (
        viewer
    ) {

        viewer.classList.add(
            "active"
        );

        document.body.classList.add(
            "viewer-open"
        );

        return;

    }


    viewer =
        document.createElement(
            "div"
        );


    viewer.id =
        "image-viewer";


    viewer.innerHTML = `

        <button
            id="viewer-close"
            type="button"
            aria-label="Close viewer">
            ×
        </button>


        <button
            id="viewer-prev"
            type="button"
            aria-label="Previous image">
            ‹
        </button>


        <img
            id="viewer-image"
            alt="Comic page"
        >


        <button
            id="viewer-next"
            type="button"
            aria-label="Next image">
            ›
        </button>


        <div
            id="viewer-counter">
        </div>

    `;


    document.body.appendChild(
        viewer
    );


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
            function(event) {

                event.stopPropagation();

                closeImageViewer();

            }
        );

    }


    if (
        previousButton
    ) {

        previousButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                previousViewerImage();

            }
        );

    }


    if (
        nextButton
    ) {

        nextButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                nextViewerImage();

            }
        );

    }


    /*
    CLICK ON IMAGE
    PREVIOUS PAGE
    */

    viewer.addEventListener(
        "click",
        function(event) {

            if (
                event.target.id ===
                "viewer-image"
            ) {

                previousViewerImage();

            }

        }
    );


    /*
    CLICK BACKGROUND
    CLOSE
    */

    viewer.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                viewer
            ) {

                closeImageViewer();

            }

        }
    );


    /*
    RIGHT CLICK
    NEXT PAGE
    */

    viewer.addEventListener(
        "contextmenu",
        function(event) {

            event.preventDefault();

            if (
                event.target.id ===
                "viewer-image"
            ) {

                nextViewerImage();

            }

        }
    );


    /*
    MOUSE WHEEL
    ZOOM
    */

    viewer.addEventListener(
        "wheel",
        function(event) {

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
            passive:
                false
        }
    );


    /*
    DRAG START
    */

    viewer.addEventListener(
        "mousedown",
        function(event) {

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


            const image =
                document.getElementById(
                    "viewer-image"
                );


            if (
                image
            ) {

                image.classList.add(
                    "dragging"
                );

            }

        }
    );


    /*
    DRAG MOVE
    */

    document.addEventListener(
        "mousemove",
        function(event) {

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
    DRAG END
    */

    document.addEventListener(
        "mouseup",
        function() {

            isDragging =
                false;


            const image =
                document.getElementById(
                    "viewer-image"
                );


            if (
                image
            ) {

                image.classList.remove(
                    "dragging"
                );

            }

        }
    );


    /*
    KEYBOARD
    */

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
                "Escape"
            ) {

                closeImageViewer();

                return;

            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                nextViewerImage();

                return;

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                previousViewerImage();

                return;

            }

        }
    );


    viewer.classList.add(
        "active"
    );


    document.body.classList.add(
        "viewer-open"
    );

}


/* ==========================================================
   SHOW VIEWER IMAGE
========================================================== */

function showViewerImage() {

    const image =
        document.getElementById(
            "viewer-image"
        );


    const counter =
        document.getElementById(
            "viewer-counter"
        );


    if (
        !image ||
        !viewerPages.length
    ) {

        return;

    }


    const page =
        viewerPages[
            viewerIndex
        ];


    image.src =
        getPageImageURL(
            page,
            viewerIndex
        );


    image.alt =
        `Page ${
            viewerIndex + 1
        }`;


    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;


    updateViewerTransform();


    if (
        counter
    ) {

        counter.textContent =
            `${viewerIndex + 1} / ${viewerPages.length}`;

    }

}


/* ==========================================================
   UPDATE IMAGE TRANSFORM
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

        viewerIndex =
            0;

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


    if (
        viewer
    ) {

        viewer.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "viewer-open"
    );


    isDragging =
        false;


    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;

}


/* ==========================================================
   CHAPTER NAVIGATION
========================================================== */

function setupNavigation() {

    const currentNumber =
        Number(
            currentChapter.number
        );


    const previous =
        allChapters.find(
            chapter => {

                return (
                    String(
                        chapter.comicId
                    ) ===
                    String(
                        currentComic.id
                    ) &&

                    Number(
                        chapter.number
                    ) ===
                    currentNumber - 1
                );

            }
        );


    const next =
        allChapters.find(
            chapter => {

                return (
                    String(
                        chapter.comicId
                    ) ===
                    String(
                        currentComic.id
                    ) &&

                    Number(
                        chapter.number
                    ) ===
                    currentNumber + 1
                );

            }
        );


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

        } else {

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

        } else {

            nextButton.style.display =
                "none";

        }

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
        `?id=${
            encodeURIComponent(
                currentComic.id
            )
        }` +
        `&chapter=${
            encodeURIComponent(
                chapter.number
            )
        }`
    );

}


/* ==========================================================
   CURRENT COMIC ID
========================================================== */

function getCurrentComicId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get(
            "id"
        ) ||
        params.get(
            "comic"
        ) ||
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


    if (
        page
    ) {

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
