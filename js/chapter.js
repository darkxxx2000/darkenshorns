"use strict";

/* ==========================================================
   DARKENSHORNS
   CHAPTER SYSTEM - FIXED
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


    if (!comicId || !chapterId) {

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


        if (!comicResponse.ok) {

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
                            String(chapter)
                                .toLowerCase() ===
                            String(chapterId)
                                .toLowerCase()
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
                            .toLowerCase() ===
                        String(chapterId)
                            .toLowerCase()
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
            chapters[
                chapterIndex
            ];


        /* ==================================================
           CHAPTER FOLDER
        ================================================== */

        let folder = "";


        if (
            typeof chapterInfo ===
            "object" &&
            chapterInfo !== null
        ) {

            folder =
                chapterInfo.folder ||
                "";

        }


        /*
        If URL contains folder,
        use it as priority.
        */

        if (folderParam) {

            folder =
                folderParam;

        }


        /* ==================================================
           CHAPTER FILE
        ================================================== */

        let chapterFile = "";


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


        if (
            !chapterFile
        ) {

            showError(
                "Chapter data is incomplete."
            );

            return;

        }


        /*
        If the chapter entry itself
        contains a file name, use it.
        */

        const chapterFileName =
            chapterFile.endsWith(
                ".json"
            )
                ? chapterFile
                : `${chapterFile}.json`;


        /* ==================================================
           BUILD CHAPTER PATH
        ================================================== */

        let chapterPath =
            "";


        if (folder) {

            chapterPath =
                `../data/chapters/` +
                `${encodeURIComponent(comicId)}/` +
                `${encodeURIComponent(folder)}/` +
                `${encodeURIComponent(chapterFileName)}`;

        } else {

            chapterPath =
                `../data/chapters/` +
                `${encodeURIComponent(comicId)}/` +
                `${encodeURIComponent(chapterFileName)}`;

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


        if (!chapterResponse.ok) {

            throw new Error(
                `Cannot load chapter file: ${chapterPath}`
            );

        }


        currentChapter =
            await chapterResponse.json();


        /*
        Save folder if missing
        */

        if (
            !currentChapter.folder &&
            folder
        ) {

            currentChapter.folder =
                folder;

        }


        /*
        Save chapter ID if missing
        */

        if (
            !currentChapter.id
        ) {

            currentChapter.id =
                chapterFile.replace(
                    /\.json$/i,
                    ""
                );

        }


        /* ==================================================
           NAVIGATION DATA
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
        currentChapter.chapter ||
        "Chapter";


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
            chapterTitle;

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


    /*
    NORMAL MODE
    */

    if (gridButton) {

        gridButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                openNormalMode();

            }
        );

    }


    /*
    WEBTOON MODE
    */

    if (webtoonButton) {

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
========================================================== */

function openNormalMode() {

    const pages =
        getChapterPages();


    if (
        !pages.length
    ) {

        console.warn(
            "No chapter pages found."
        );

        return;

    }


    viewerPages =
        pages;


    viewerIndex =
        0;


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

        console.warn(
            "#preview-container not found."
        );

        return;

    }


    const pages =
        getChapterPages();


    if (
        !pages.length
    ) {

        console.warn(
            "No chapter pages found."
        );

        return;

    }


    container.innerHTML =
        "";


    container.classList.add(
        "webtoon-mode"
    );


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
            i < 3
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


        const closeButton =
            document.getElementById(
                "viewer-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeImageViewer
            );

        }


        /*
        RIGHT CLICK
        NEXT IMAGE
        */

        viewer.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

                nextViewerImage();

            }
        );


        /*
        LEFT CLICK
        PREVIOUS IMAGE
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
                passive: false
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


    if (
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
                    ).toLowerCase() ===
                    String(
                        currentChapterId
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


    if (
        nextButton
    ) {

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
        `chapter.html` +
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


    /*
    pages: []
    */

    if (
        Array.isArray(
            currentChapter.pages
        )
    ) {

        return currentChapter.pages;

    }


    /*
    images: []
    */

    if (
        Array.isArray(
            currentChapter.images
        )
    ) {

        return currentChapter.images;

    }


    /*
    content: []
    */

    if (
        Array.isArray(
            currentChapter.content
        )
    ) {

        return currentChapter.content;

    }


    /*
    pages as number
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

    /*
    ================================================
    STRING
    ================================================
    */

    if (
        typeof page ===
        "string"
    ) {

        const value =
            page.trim();


        /*
        Absolute URL
        */

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


        /*
        Already relative from chapter page
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
        If the value contains a folder path,
        use it relative to the site root.
        */

        if (
            value.includes("/")
        ) {

            return (
                `../${value}`
            );

        }


        /*
        Plain filename:
        001.webp
        page-01.jpg
        image.png
        */

        return buildImagePath(
            value
        );

    }


    /*
    ================================================
    OBJECT
    ================================================
    */

    if (
        typeof page ===
        "object" &&
        page !== null
    ) {

        /*
        url
        */

        if (
            typeof page.url ===
            "string"
        ) {

            return normalizeImagePath(
                page.url
            );

        }


        /*
        image
        */

        if (
            typeof page.image ===
            "string"
        ) {

            return normalizeImagePath(
                page.image
            );

        }


        /*
        src
        */

        if (
            typeof page.src ===
            "string"
        ) {

            return normalizeImagePath(
                page.src
            );

        }


        /*
        file
        */

        if (
            typeof page.file ===
            "string"
        ) {

            return buildImagePath(
                page.file
            );

        }


        /*
        filename
        */

        if (
            typeof page.filename ===
            "string"
        ) {

            return buildImagePath(
                page.filename
            );

        }

    }


    /*
    ================================================
    FALLBACK
    ================================================

    If JSON says:

    "pages": 10

    Generates:

    001.webp
    002.webp
    003.webp
    etc.
    */

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


    /*
    If filename already has
    a full or relative path.
    */

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


    /*
    Standard chapter structure:

    data/
      chapters/
        comic-id/
          folder/
            001.webp
            002.webp
    */

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


    /*
    Fallback if chapter has
    no folder.
    */

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
                        chapter ===
                        currentId
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
                    ).toLowerCase() ===
                    String(
                        currentId
                    ).toLowerCase()
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

        return;

    }


    /*
    Fallback if chapter-page
    does not exist.
    */

    console.error(
        message
    );

}
