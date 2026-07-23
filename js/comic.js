"use strict";

/* ==========================================================
   DARKENSHORNS
   CHAPTER READER
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

        /*
        ==========================================
        LOAD COMIC
        ==========================================
        */

        currentComic =
            await loadComic(
                comicId
            );


        if (
            !currentComic
        ) {

            throw new Error(
                "Comic not found."
            );

        }


        /*
        ==========================================
        CHAPTER LIST
        ==========================================
        */

        allChapters =
            Array.isArray(
                currentComic.chapters
            )

                ? currentComic.chapters

                : [];


        /*
        ==========================================
        FIND CHAPTER
        ==========================================
        */

        currentChapter =
            findChapter(
                allChapters,
                chapterId
            );


        if (
            !currentChapter
        ) {

            throw new Error(
                "Chapter not found."
            );

        }


        /*
        ==========================================
        LOAD CHAPTER DATA
        ==========================================
        */

        currentChapter =
            await loadChapterData(
                comicId,
                currentChapter
            );


        /*
        ==========================================
        RENDER
        ==========================================
        */

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
            error.message ||
            "Unable to load chapter."
        );

    }

}


/* ==========================================================
   LOAD COMIC
========================================================== */

async function loadComic(
    comicId
) {

    const response =
        await fetch(
            `../data/comics/${encodeURIComponent(comicId)}.json`
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Comic JSON not found."
        );

    }


    return await response.json();

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
        )
        .trim()
        .toLowerCase();


    return chapters.find(
        chapter => {

            if (
                typeof chapter ===
                "string"
            ) {

                return (
                    chapter
                        .trim()
                        .toLowerCase() ===
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


            const identifiers = [

                chapter.id,

                chapter.slug,

                chapter.chapter,

                chapter.number,

                chapter.file,

                chapter.folder

            ];


            return identifiers.some(
                identifier => {

                    return (

                        identifier !==
                        undefined &&

                        identifier !==
                        null &&

                        String(
                            identifier
                        )
                        .trim()
                        .toLowerCase() ===
                        search

                    );

                }
            );

        }
    );

}


/* ==========================================================
   LOAD CHAPTER DATA
========================================================== */

async function loadChapterData(
    comicId,
    chapter
) {

    /*
    Si el capítulo ya contiene
    las páginas, no necesitamos
    otro JSON.
    */

    if (
        chapter &&
        typeof chapter ===
        "object"
    ) {

        if (
            Array.isArray(
                chapter.pages
            )
        ) {

            return chapter;

        }


        if (
            Array.isArray(
                chapter.images
            )
        ) {

            return chapter;

        }

    }


    /*
    ==========================================
    TRY CHAPTER FILE
    ==========================================
    */

    const possibleFiles = [];


    if (
        chapter &&
        typeof chapter ===
        "object"
    ) {

        if (
            chapter.file
        ) {

            possibleFiles.push(
                chapter.file
            );

        }

    }


    /*
    ==========================================
    CHAPTER ID
    ==========================================
    */

    const chapterId =
        getChapterIdentifier(
            chapter
        );


    /*
    ==========================================
    POSSIBLE JSON PATHS
    ==========================================
    */

    possibleFiles.push(

        `${chapterId}.json`,

        `${chapterId.toLowerCase()}.json`

    );


    /*
    ==========================================
    CHAPTER FOLDER
    ==========================================
    */

    const folder =
        chapter &&
        typeof chapter ===
        "object"

            ? (
                chapter.folder ||
                chapter.slug ||
                chapter.id ||
                ""
            )

            : chapterId;


    /*
    ==========================================
    TRY POSSIBLE CHAPTER JSON
    ==========================================
    */

    for (
        const file of possibleFiles
    ) {

        const paths = [

            `../data/chapters/${encodeURIComponent(comicId)}/${file}`,

            `../data/chapters/${encodeURIComponent(comicId)}/${encodeURIComponent(folder)}/${file}`,

            `../data/chapters/${encodeURIComponent(folder)}/${file}`,

            `../data/chapters/${encodeURIComponent(folder)}.json`

        ];


        for (
            const path of paths
        ) {

            try {

                const response =
                    await fetch(
                        path
                    );


                if (
                    !response.ok
                ) {

                    continue;

                }


                const data =
                    await response.json();


                return {

                    ...chapter,

                    ...data

                };

            }
            catch (
                error
            ) {

                /*
                Intentional:
                try next path.
                */

            }

        }

    }


    /*
    ==========================================
    TRY GLOBAL pages.json
    ==========================================
    */

    try {

        const response =
            await fetch(
                "../data/pages.json"
            );


        if (
            response.ok
        ) {

            const pagesData =
                await response.json();


            const pages =
                findPagesInGlobalData(
                    pagesData,
                    comicId,
                    chapter
                );


            if (
                pages.length
            ) {

                return {

                    ...chapter,

                    pages

                };

            }

        }

    }
    catch (
        error
    ) {

        console.warn(
            "Unable to load pages.json:",
            error
        );

    }


    /*
    ==========================================
    NO DATA FOUND
    ==========================================
    */

    return {

        ...chapter,

        pages: []

    };

}


/* ==========================================================
   FIND PAGES IN GLOBAL DATA
========================================================== */

function findPagesInGlobalData(
    data,
    comicId,
    chapter
) {

    if (
        !data
    ) {

        return [];

    }


    /*
    Direct array.
    */

    if (
        Array.isArray(data)
    ) {

        /*
        Array of page objects.
        */

        const filtered =
            data.filter(
                item => {

                    if (
                        typeof item !==
                        "object"
                    ) {

                        return false;

                    }


                    const itemComic =
                        item.comicId ||
                        item.comic ||
                        item.comic_id;


                    const itemChapter =
                        item.chapterId ||
                        item.chapter ||
                        item.chapter_id;


                    const currentChapterId =
                        getChapterIdentifier(
                            chapter
                        );


                    return (

                        String(
                            itemComic || ""
                        )
                        .toLowerCase() ===
                        String(
                            comicId
                        )
                        .toLowerCase()

                        &&

                        String(
                            itemChapter || ""
                        )
                        .toLowerCase() ===
                        String(
                            currentChapterId
                        )
                        .toLowerCase()

                    );

                }
            );


        return filtered
            .map(
                item => {

                    return (
                        item.url ||
                        item.image ||
                        item.src ||
                        ""

                    );

                }
            )
            .filter(Boolean);

    }


    /*
    Object keyed by comic.
    */

    const comicData =
        data[comicId];


    if (
        comicData
    ) {

        const chapterId =
            getChapterIdentifier(
                chapter
            );


        if (
            Array.isArray(
                comicData[chapterId]
            )
        ) {

            return comicData[
                chapterId
            ];

        }

    }


    /*
    Object containing chapters.
    */

    if (
        Array.isArray(
            data.chapters
        )
    ) {

        const chapterId =
            getChapterIdentifier(
                chapter
            );


        const found =
            data.chapters.find(
                item => {

                    if (
                        !item ||
                        typeof item !==
                        "object"
                    ) {

                        return false;

                    }


                    return (

                        String(
                            item.id ||
                            item.slug ||
                            item.chapter ||
                            ""
                        )
                        .toLowerCase() ===

                        String(
                            chapterId
                        )
                        .toLowerCase()

                    );

                }
            );


        if (
            found
        ) {

            return (

                found.pages ||
                found.images ||
                []

            );

        }

    }


    return [];

}


/* ==========================================================
   RENDER CHAPTER
========================================================== */

function renderChapter() {

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


        if (
            subtitle
        ) {

            chapterName.textContent =

                chapterNumber

                    ? `Chapter ${chapterNumber}: ${chapterTitle} — ${subtitle}`

                    : `${chapterTitle} — ${subtitle}`;

        }

    }


    const chapterTitleElement =
        document.getElementById(
            "chapter-title"
        );


    if (
        chapterTitleElement
    ) {

        chapterTitleElement.textContent =
            chapterTitle;

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
                "-"
            }`;

    }


    const comicId =
        currentComic.id ||
        getCurrentComicId();


    const comicURL =
        `comic.html?id=${encodeURIComponent(
            comicId
        )}`;


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
   READER BUTTONS
========================================================== */

function setupReaderLinks() {

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
            () => {

                renderNormalMode();

                setActiveButton(
                    normalButton
                );

            }
        );

    }


    if (
        webtoonButton
    ) {

        webtoonButton.addEventListener(
            "click",
            () => {

                renderWebtoonMode();

                setActiveButton(
                    webtoonButton
                );

            }
        );

    }

}


/* ==========================================================
   ACTIVE BUTTON
========================================================== */

function setActiveButton(
    activeButton
) {

    document
        .querySelectorAll(
            ".reader-button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    activeButton.classList.add(
        "active"
    );

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


    container.classList.remove(
        "webtoon-mode"
    );


    renderImages(
        container
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


    container.classList.add(
        "webtoon-mode"
    );


    renderImages(
        container
    );

}


/* ==========================================================
   RENDER IMAGES
========================================================== */

function renderPreview() {

    renderNormalMode();

}


/* ==========================================================
   RENDER IMAGES
========================================================== */

function renderImages(
    container
) {

    container.innerHTML =
        "";


    const pages =
        getChapterPages();


    if (
        !pages.length
    ) {

        container.innerHTML = `

            <div class="reader-empty">

                No pages available.

            </div>

        `;

        console.warn(
            "No pages found for chapter:",
            currentChapter
        );

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
                getPageURL(
                    page
                );


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
                () => {

                    openViewer(
                        index
                    );

                }
            );


            image.addEventListener(
                "error",
                () => {

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
   GET PAGES
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
   PAGE URL
========================================================== */

function getPageURL(
    page
) {

    let url = "";


    if (
        typeof page ===
        "string"
    ) {

        url =
            page;

    }
    else if (
        page &&
        typeof page ===
        "object"
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


    /*
    External image.
    */

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


    /*
    Already relative to /pages/.
    */

    if (
        url.startsWith(
            "../"
        )
    ) {

        return url;

    }


    /*
    Images stored in data/chapters.
    */

    if (
        url.startsWith(
            "data/"
        )
    ) {

        return `../${url}`;

    }


    /*
    Assets stored from root.
    */

    if (
        url.startsWith(
            "assets/"
        )
    ) {

        return `../${url}`;

    }


    /*
    Generic relative path.
    */

    return `../${url}`;

}


/* ==========================================================
   VIEWER
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


    const prevButton =
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
        prevButton
    ) {

        prevButton.addEventListener(
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
        event => {

            if (
                !viewer.classList.contains(
                    "active"
                )
            ) {

                return;

            }


            event.preventDefault();


            viewerScale +=

                event.deltaY < 0

                    ? 0.15

                    : -0.15;


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
        event => {

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
   NEXT
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
   PREVIOUS
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
   CLOSE
========================================================== */

function closeViewer() {

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


    document.body.style.overflow =
        "";

}


/* ==========================================================
   RESET
========================================================== */

function resetImagePosition() {

    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;

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

        `translate(
            ${imagePositionX}px,
            ${imagePositionY}px
        )
        scale(
            ${viewerScale}
        )`;

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
        event.button !==
        0
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
   NAVIGATION
========================================================== */

function setupNavigation() {

    const currentIdentifier =
        getChapterIdentifier(
            currentChapter
        );


    const currentIndex =
        allChapters.findIndex(
            chapter => {

                return (

                    String(
                        getChapterIdentifier(
                            chapter
                        )
                    )
                    .toLowerCase() ===

                    String(
                        currentIdentifier
                    )
                    .toLowerCase()

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
   IDENTIFIER
========================================================== */

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


/* ==========================================================
   BUILD CHAPTER URL
========================================================== */

function buildChapterURL(
    chapter
) {

    const comicId =
        currentComic.id ||
        getCurrentComicId();


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
   CURRENT COMIC
========================================================== */

function getCurrentComicId() {

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


    console.error(
        message
    );

}
