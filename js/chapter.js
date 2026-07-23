"use strict";

/* ==========================================================
   DARKENSHORNS
   CHAPTER SYSTEM - FINAL FIXED
========================================================== */

let currentComic = null;
let currentChapter = null;
let allChapters = [];

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


    const comicId =
        params.get("comic") ||
        params.get("id");


    const chapterId =
        params.get("chapter");


    const folderParam =
        params.get("folder");


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
           LOAD COMIC JSON
        ================================================== */

        const comicResponse =
            await fetch(
                `../data/comics/${encodeURIComponent(comicId)}.json`
            );


        if (
            !comicResponse.ok
        ) {

            throw new Error(
                `Comic not found: ${comicId}`
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


        const chapterIndex =
            chapters.findIndex(
                chapter => {

                    if (
                        typeof chapter ===
                        "string"
                    ) {

                        return (
                            chapter
                                .replace(
                                    /\.json$/i,
                                    ""
                                )
                                .toLowerCase() ===
                            String(
                                chapterId
                            ).toLowerCase()
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
                        chapter.chapter;


                    return (
                        String(id)
                            .replace(
                                /\.json$/i,
                                ""
                            )
                            .toLowerCase() ===
                        String(
                            chapterId
                        )
                            .replace(
                                /\.json$/i,
                                ""
                            )
                            .toLowerCase()
                    );

                }
            );


        if (
            chapterIndex === -1
        ) {

            showError(
                "Chapter not found."
            );

            return;

        }


        const chapterInfo =
            chapters[
                chapterIndex
            ];


        /* ==================================================
           CHAPTER FOLDER
        ================================================== */

        let folder =
            folderParam ||
            "";


        if (
            !folder &&
            typeof chapterInfo ===
            "object" &&
            chapterInfo !== null
        ) {

            folder =
                chapterInfo.folder ||
                "";

        }


        /* ==================================================
           CHAPTER FILE
        ================================================== */

        let chapterFile =
            "";


        if (
            typeof chapterInfo ===
            "string"
        ) {

            chapterFile =
                chapterInfo;

        } else {

            chapterFile =
                chapterInfo.id ||
                chapterInfo.slug ||
                chapterInfo.chapter ||
                "";

        }


        chapterFile =
            chapterFile.replace(
                /\.json$/i,
                ""
            );


        if (
            !chapterFile
        ) {

            showError(
                "Chapter data is incomplete."
            );

            return;

        }


        /* ==================================================
           BUILD CHAPTER PATH
        ================================================== */

        let chapterPath;


        if (
            folder
        ) {

            chapterPath =
                `../data/chapters/` +
                `${encodeURIComponent(
                    comicId
                )}/` +
                `${encodeURIComponent(
                    folder
                )}/` +
                `${encodeURIComponent(
                    chapterFile
                )}.json`;

        } else {

            chapterPath =
                `../data/chapters/` +
                `${encodeURIComponent(
                    comicId
                )}/` +
                `${encodeURIComponent(
                    chapterFile
                )}.json`;

        }


        console.log(
            "Loading chapter:",
            chapterPath
        );


        /* ==================================================
           LOAD CHAPTER JSON
        ================================================== */

        const chapterResponse =
            await fetch(
                chapterPath
            );


        if (
            !chapterResponse.ok
        ) {

            throw new Error(
                `Cannot load chapter file: ${chapterPath}`
            );

        }


        currentChapter =
            await chapterResponse.json();


        /* ==================================================
           SAVE FOLDER
        ================================================== */

        if (
            !currentChapter.folder
        ) {

            currentChapter.folder =
                folder;

        }


        /* ==================================================
           SAVE CHAPTER ID
        ================================================== */

        if (
            !currentChapter.id
        ) {

            currentChapter.id =
                chapterFile;

        }


        /* ==================================================
           BUILD ALL CHAPTERS
        ================================================== */

        allChapters =
            chapters.map(
                (
                    chapter,
                    index
                ) => {

                    if (
                        typeof chapter ===
                        "string"
                    ) {

                        return {

                            id:
                                chapter.replace(
                                    /\.json$/i,
                                    ""
                                ),

                            title:
                                chapter.replace(
                                    /\.json$/i,
                                    ""
                                ),

                            folder:
                                folder,

                            index:
                                index

                        };

                    }


                    return {

                        ...chapter,

                        id:
                            chapter.id ||
                            chapter.slug ||
                            chapter.chapter,

                        index:
                            index

                    };

                }
            );


        /* ==================================================
           RENDER
        ================================================== */

        renderChapter();

        setupReaderLinks();

        setupNavigation();

        renderPreview();


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
   RENDER CHAPTER
========================================================== */

function renderChapter() {

    const comicTitle =
        currentComic.title ||
        "Comic";


    const chapterTitle =
        currentChapter.title ||
        currentChapter.chapter ||
        "Chapter";


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
            chapterTitle;

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


    const chapterPages =
        document.getElementById(
            "chapter-pages"
        );


    if (
        chapterPages
    ) {

        chapterPages.textContent =
            `Pages: ${pages.length}`;

    }


    const chapterDate =
        document.getElementById(
            "chapter-date"
        );


    if (
        chapterDate
    ) {

        chapterDate.textContent =
            `Date: ${
                currentChapter.releaseDate ||
                currentChapter.date ||
                currentComic.updated ||
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
   READER MODE BUTTONS
========================================================== */

function setupReaderLinks() {

    const gridButton =
        document.getElementById(
            "grid-reader"
        );


    const webtoonButton =
        document.getElementById(
            "webtoon-reader"
        );


    if (
        gridButton
    ) {

        gridButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                openNormalMode();

            }
        );

    }


    if (
        webtoonButton
    ) {

        webtoonButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                openWebtoonMode();

            }
        );

    }

}


/* ==========================================================
   NORMAL MODE
   SHOW ALL PAGES
========================================================== */

function openNormalMode() {

    renderPreview();

}


/* ==========================================================
   WEBTOON MODE
========================================================== */

function openWebtoonMode() {

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
                "error",
                function() {

                    console.error(
                        "Image failed:",
                        image.src
                    );

                }
            );


            image.addEventListener(
                "click",
                function() {

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
   SHOW ALL PAGES
========================================================== */

function renderPreview() {

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
                "error",
                function() {

                    console.error(
                        "Preview image failed:",
                        image.src
                    );

                }
            );


            image.addEventListener(
                "click",
                function() {

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
   CREATE VIEWER
========================================================== */

function createViewer() {

    let viewer =
        document.getElementById(
            "image-viewer"
        );


    if (
        !viewer
    ) {

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


        const closeButton =
            document.getElementById(
                "viewer-close"
            );


        if (
            closeButton
        ) {

            closeButton.addEventListener(
                "click",
                closeImageViewer
            );

        }


        /* ==================================================
           RIGHT CLICK = NEXT
        ================================================== */

        viewer.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

                nextViewerImage();

            }
        );


        /* ==================================================
           LEFT CLICK IMAGE = PREVIOUS
        ================================================== */

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


        /* ==================================================
           MOUSE WHEEL = ZOOM
        ================================================== */

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


        /* ==================================================
           DRAG START
        ================================================== */

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

            }
        );


        /* ==================================================
           DRAG MOVE
        ================================================== */

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


        /* ==================================================
           DRAG END
        ================================================== */

        document.addEventListener(
            "mouseup",
            function() {

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
        `Page ${viewerIndex + 1}`;


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


    document.body.style.overflow =
        "";

}


/* ==========================================================
   CHAPTER NAVIGATION
========================================================== */

function setupNavigation() {

    const currentChapterId =
        getCurrentChapterId();


    const currentIndex =
        allChapters.findIndex(
            chapter => {

                return (
                    String(
                        chapter.id ||
                        chapter.slug ||
                        chapter.chapter ||
                        ""
                    )
                        .replace(
                            /\.json$/i,
                            ""
                        )
                        .toLowerCase() ===
                    String(
                        currentChapterId
                    )
                        .replace(
                            /\.json$/i,
                            ""
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

    const comicId =
        currentComic.id ||
        getCurrentComicId();


    const chapterId =
        chapter.id ||
        chapter.slug ||
        chapter.chapter ||
        "";


    const folder =
        chapter.folder ||
        getCurrentFolder() ||
        "";


    return (
        `chapters.html` +
        `?comic=${encodeURIComponent(
            comicId
        )}` +
        `&folder=${encodeURIComponent(
            folder
        )}` +
        `&chapter=${encodeURIComponent(
            chapterId
        )}`
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


    if (
        Array.isArray(
            currentChapter.content
        )
    ) {

        return currentChapter.content;

    }


    if (
        typeof currentChapter.pages ===
        "number"
    ) {

        return Array.from(
            {
                length:
                    currentChapter.pages
            },
            (
                _,
                index
            ) => {

                return index + 1;

            }
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

    if (
        typeof page ===
        "string"
    ) {

        const value =
            page.trim();


        if (
            value.startsWith(
                "http://"
            ) ||
            value.startsWith(
                "https://"
            ) ||
            value.startsWith(
                "data:"
            )
        ) {

            return value;

        }


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


        if (
            value.includes("/")
        ) {

            return (
                `../${value}`
            );

        }


        return buildImagePath(
            value
        );

    }


    if (
        typeof page ===
        "object" &&
        page !== null
    ) {

        if (
            typeof page.url ===
            "string"
        ) {

            return normalizeImagePath(
                page.url
            );

        }


        if (
            typeof page.image ===
            "string"
        ) {

            return normalizeImagePath(
                page.image
            );

        }


        if (
            typeof page.src ===
            "string"
        ) {

            return normalizeImagePath(
                page.src
            );

        }


        if (
            typeof page.file ===
            "string"
        ) {

            return buildImagePath(
                page.file
            );

        }


        if (
            typeof page.filename ===
            "string"
        ) {

            return buildImagePath(
                page.filename
            );

        }

    }


    const number =
        String(
            index + 1
        ).padStart(
            3,
            "0"
        );


    return buildImagePath(
        `${number}.webp`
    );

}


/* ==========================================================
   BUILD IMAGE PATH
========================================================== */

function buildImagePath(
    filename
) {

    if (
        !filename
    ) {

        return "";

    }


    if (
        filename.startsWith(
            "../"
        ) ||
        filename.startsWith(
            "./"
        ) ||
        filename.startsWith(
            "/"
        ) ||
        filename.startsWith(
            "http://"
        ) ||
        filename.startsWith(
            "https://"
        )
    ) {

        return filename;

    }


    const comicId =
        currentComic.id ||
        getCurrentComicId();


    const folder =
        getCurrentFolder();


    if (
        folder
    ) {

        return (
            `../data/chapters/` +
            `${encodeURIComponent(
                comicId
            )}/` +
            `${encodeURIComponent(
                folder
            )}/` +
            `${encodeURIComponent(
                filename
            )}`
        );

    }


    return (
        `../data/chapters/` +
        `${encodeURIComponent(
            comicId
        )}/` +
        `${encodeURIComponent(
            filename
        )}`
    );

}


/* ==========================================================
   NORMALIZE IMAGE PATH
========================================================== */

function normalizeImagePath(
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
        ) ||
        path.startsWith(
            "data:"
        )
    ) {

        return path;

    }


    if (
        path.startsWith(
            "../"
        ) ||
        path.startsWith(
            "./"
        ) ||
        path.startsWith(
            "/"
        )
    ) {

        return path;

    }


    if (
        path.includes("/")
    ) {

        return `../${path}`;

    }


    return buildImagePath(
        path
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


    const urlFolder =
        params.get(
            "folder"
        );


    if (
        urlFolder
    ) {

        return urlFolder;

    }


    if (
        currentChapter &&
        currentChapter.folder
    ) {

        return currentChapter.folder;

    }


    const comicChapters =
        currentComic &&
        Array.isArray(
            currentComic.chapters
        )
            ? currentComic.chapters
            : [];


    const currentId =
        getCurrentChapterId();


    const chapterInfo =
        comicChapters.find(
            chapter => {

                if (
                    typeof chapter ===
                    "string"
                ) {

                    return (
                        chapter
                            .replace(
                                /\.json$/i,
                                ""
                            )
                            .toLowerCase() ===
                        String(
                            currentId
                        )
                            .replace(
                                /\.json$/i,
                                ""
                            )
                            .toLowerCase()
                    );

                }


                if (
                    !chapter
                ) {

                    return false;

                }


                return (
                    String(
                        chapter.id ||
                        chapter.slug ||
                        chapter.chapter ||
                        ""
                    )
                        .replace(
                            /\.json$/i,
                            ""
                        )
                        .toLowerCase() ===
                    String(
                        currentId
                    )
                        .replace(
                            /\.json$/i,
                            ""
                        )
                        .toLowerCase()
                );

            }
        );


    if (
        chapterInfo &&
        typeof chapterInfo ===
        "object"
    ) {

        return (
            chapterInfo.folder ||
            ""
        );

    }


    return "";

}


/* ==========================================================
   CURRENT CHAPTER ID
========================================================== */

function getCurrentChapterId() {

    if (
        currentChapter
    ) {

        return (
            currentChapter.id ||
            currentChapter.slug ||
            currentChapter.chapter ||
            ""
        );

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get(
            "chapter"
        ) ||
        ""
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
            "comic"
        ) ||
        params.get(
            "id"
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

        return;

    }


    console.error(
        message
    );

}
