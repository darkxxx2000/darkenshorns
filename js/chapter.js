```js
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


    if (!comicId || !chapterId) {

        showError(
            "Chapter information missing."
        );

        return;

    }


    try {

        /* ==================================================
           LOAD COMIC
        ================================================== */

        const comicResponse =
            await fetch(
                `../data/comics/${encodeURIComponent(comicId)}.json`
            );


        if (!comicResponse.ok) {

            throw new Error(
                `Comic JSON not found: ${comicId}`
            );

        }


        currentComic =
            await comicResponse.json();


        /* ==================================================
           FIND CHAPTER
        ================================================== */

        const chapters =
            Array.isArray(
                currentComic.chapters
            )
                ? currentComic.chapters
                : [];


        allChapters =
            chapters;


        currentChapter =
            findChapter(
                chapters,
                chapterId
            );


        if (!currentChapter) {

            showError(
                "Chapter not found."
            );

            return;

        }


        /* ==================================================
           LOAD CHAPTER JSON
        ================================================== */

        if (
            typeof currentChapter === "object" &&
            currentChapter.file
        ) {

            const chapterPath =
                buildChapterJSONPath(
                    currentChapter
                );


            console.log(
                "Loading chapter:",
                chapterPath
            );


            const chapterResponse =
                await fetch(
                    chapterPath
                );


            if (!chapterResponse.ok) {

                throw new Error(
                    `Chapter JSON not found: ${chapterPath}`
                );

            }


            const chapterData =
                await chapterResponse.json();


            currentChapter = {

                ...currentChapter,

                ...chapterData

            };

        }


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
                typeof chapter === "string"
            ) {

                return (
                    chapter.toLowerCase() ===
                    search
                );

            }


            if (
                !chapter ||
                typeof chapter !== "object"
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

/*
   IMPORTANTE:

   Esta función NO asume que el nombre de la carpeta
   sea igual al ID del cómic.

   Utiliza las propiedades declaradas en el propio capítulo:

   {
       "file": "ai-chan-01.json",
       "folder": "AI-Story"
   }

   También acepta:

   1. chapter.path
   2. chapter.file con ruta completa
   3. chapter.folder + chapter.file
   4. rutas relativas a data/
   5. rutas relativas a chapters/

   Esto permite utilizar el mismo sistema para todos
   los cómics y contenidos.
*/

function buildChapterJSONPath(
    chapter
) {

    if (!chapter) {

        return "";

    }


    /*
    ==========================================================
    1. PATH EXPLÍCITO
    ==========================================================
    */

    if (
        typeof chapter.path === "string" &&
        chapter.path.trim()
    ) {

        return normalizeDataPath(
            chapter.path
        );

    }


    /*
    ==========================================================
    2. FILE
    ==========================================================
    */

    const file =
        typeof chapter.file === "string"
            ? chapter.file.trim()
            : "";


    const folder =
        typeof chapter.folder === "string"
            ? chapter.folder.trim()
            : "";


    if (!file) {

        return "";

    }


    /*
    ==========================================================
    3. FILE YA CONTIENE RUTA
    ==========================================================
    */

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


    if (
        file.startsWith(
            "../"
        )
    ) {

        return file;

    }


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


    /*
    ==========================================================
    4. FOLDER + FILE
    ==========================================================
    */

    if (folder) {

        return (
            `../data/chapters/` +
            `${encodeURIComponent(folder)}/` +
            `${encodeURIComponent(file)}`
        );

    }


    /*
    ==========================================================
    5. SOLO FILE
    ==========================================================
    */

    return (
        `../data/chapters/` +
        `${encodeURIComponent(file)}`
    );

}


/* ==========================================================
   NORMALIZE DATA PATH
========================================================== */

function normalizeDataPath(
    path
) {

    if (!path) {

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
        `../data/` +
        path
    );

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


    if (comicName) {

        comicName.textContent =
            comicTitle;

    }


    const chapterName =
        document.getElementById(
            "chapter-name"
        );


    if (chapterName) {

        chapterName.textContent =

            chapterNumber

                ? `Chapter ${chapterNumber}: ${chapterTitle}`

                : chapterTitle;


        if (subtitle) {

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


    if (chapterTitleElement) {

        chapterTitleElement.textContent =
            chapterTitle;

    }


    const pages =
        getChapterPages();


    const chapterPages =
        document.getElementById(
            "chapter-pages"
        );


    if (chapterPages) {

        chapterPages.textContent =
            `Pages: ${pages.length}`;

    }


    const chapterDate =
        document.getElementById(
            "chapter-date"
        );


    if (chapterDate) {

        chapterDate.textContent =

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


    if (comicLink) {

        comicLink.href =
            comicURL;

    }


    const backComic =
        document.getElementById(
            "back-comic"
        );


    if (backComic) {

        backComic.href =
            comicURL;

    }

}


/* ==========================================================
   READING MODE BUTTONS
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


    if (normalButton) {

        normalButton.addEventListener(
            "click",
            function() {

                renderNormalMode();

                setActiveButton(
                    normalButton
                );

            }
        );

    }


    if (webtoonButton) {

        webtoonButton.addEventListener(
            "click",
            function() {

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


    if (!container) {

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


    if (!container) {

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
   RENDER PREVIEW
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


    if (!pages.length) {

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

    if (!currentChapter) {

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

    let url = "";


    if (
        typeof page === "string"
    ) {

        url =
            page;

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


    if (!url) {

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


    return `../${url}`;

}


/* ==========================================================
   VIEWER SETUP
========================================================== */

function setupViewer() {

    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (!viewer) {

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


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeViewer
        );

    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            previousImage
        );

    }


    if (nextButton) {

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


    viewerScale =
        1;


    imagePositionX =
        0;


    imagePositionY =
        0;


    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (!viewer) {

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

    if (!viewerPages.length) {

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

    if (!viewerPages.length) {

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


    if (!viewer) {

        return;

    }


    viewer.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

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

}


/* ==========================================================
   TRANSFORM
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

    if (!isDragging) {

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


    if (previousButton) {

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

    }


    if (nextButton) {

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

}


/* ==========================================================
   CHAPTER IDENTIFIER
========================================================== */

function getChapterIdentifier(
    chapter
) {

    if (!chapter) {

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
   CURRENT COMIC ID
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


    console.error(
        message
    );

}
```

