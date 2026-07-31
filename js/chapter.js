"use strict";

let currentComic = null;
let currentChapter = null;
let allChapters = [];
let viewerPages = [];
let viewerIndex = 0;

document.addEventListener("DOMContentLoaded", initChapter);

async function initChapter() {
const params = new URLSearchParams(window.location.search);
const comicId = params.get("id");
const chapterId = params.get("chapter");

if (!comicId || !chapterId) {
    showError("Missing comic or chapter information.");
    return;
}

try {
    currentComic = await loadComic(comicId);

    if (!currentComic) {
        throw new Error(`Comic not found: ${comicId}`);
    }

    allChapters = Array.isArray(currentComic.chapters)
        ? currentComic.chapters
        : [];

    const chapterInfo = findChapter(
        allChapters,
        chapterId
    );

    if (!chapterInfo) {
        throw new Error(
            `Chapter not found: ${chapterId}`
        );
    }

    const chapterData =
        await loadChapterData(
            comicId,
            chapterInfo
        );

    currentChapter = {
        ...chapterInfo,
        ...chapterData
    };

    renderChapter();
    renderPages();
    setupNavigation();
    setupViewer();

} catch (error) {
    console.error(
        "Chapter loading error:",
        error
    );

    showError(
        "Unable to load this chapter."
    );
}

}

/* =========================================
LOAD COMIC
========================================= */

async function loadComic(comicId) {
const response = await fetch(
../data/comics/${encodeURIComponent(comicId)}.json
);

if (!response.ok) {
    throw new Error(
        `Comic JSON not found: ${comicId}`
    );
}

return await response.json();

}

/* =========================================
FIND CHAPTER
========================================= */

function findChapter(
chapters,
chapterId
) {
const target =
String(chapterId).toLowerCase();

return chapters.find(
    chapter => {

        if (
            typeof chapter ===
            "string"
        ) {
            return (
                chapter.toLowerCase() ===
                target
            );
        }

        if (
            !chapter ||
            typeof chapter !==
            "object"
        ) {
            return false;
        }

        return (
            String(
                chapter.id || ""
            ).toLowerCase() ===
            target
        );
    }
);

}

/* =========================================
LOAD CHAPTER JSON
========================================= */

async function loadChapterData(
comicId,
chapter
) {
const file =
String(
chapter.file || ""
).trim();

const folder =
    String(
        chapter.folder || ""
    ).trim();

if (!file) {
    throw new Error(
        "Chapter file is missing."
    );
}

/*
=========================================
ESTRUCTURA ACTUAL DEL PROYECTO

Ai-Chan:

data/chapters/
Ai-Chan/
AI-Story/
ai-chan-01.json

Ryuko:

data/chapters/
ryuko-matoi/
Ryuko-vs-Huge-Dildo/
ryuko-matoi-dildo-01.json
=========================================
*/

const chapterURL =
    `../data/chapters/` +
    `${encodeURIComponent(comicId)}/` +
    `${encodeURIComponent(folder)}/` +
    `${encodeURIComponent(file)}`;

console.log(
    "Loading chapter:",
    chapterURL
);

const response =
    await fetch(
        chapterURL
    );

if (!response.ok) {
    throw new Error(
        `Chapter JSON not found: ${chapterURL}`
    );
}

return await response.json();

}

/* =========================================
RENDER CHAPTER HEADER
========================================= */

function renderChapter() {
const comicName =
document.getElementById(
"comic-name"
);

if (comicName) {
    comicName.textContent =
        currentComic.title ||
        "Comic";
}

const chapterName =
    document.getElementById(
        "chapter-name"
    );

if (chapterName) {
    const number =
        currentChapter.number;

    const title =
        currentChapter.title ||
        "Chapter";

    chapterName.textContent =
        number
            ? `Chapter ${number}: ${title}`
            : title;
}

const breadcrumb =
    document.getElementById(
        "chapter-title"
    );

if (breadcrumb) {
    breadcrumb.textContent =
        currentChapter.title ||
        "Chapter";
}

const pages =
    getPages();

const pagesInfo =
    document.getElementById(
        "chapter-pages"
    );

if (pagesInfo) {
    pagesInfo.textContent =
        `Pages: ${pages.length}`;
}

const dateInfo =
    document.getElementById(
        "chapter-date"
    );

if (dateInfo) {
    dateInfo.textContent =
        `Date: ${
            currentChapter.date ||
            "-"
        }`;
}

const comicLink =
    document.getElementById(
        "comic-link"
    );

if (comicLink) {
    comicLink.href =
        `comic.html?id=${
            encodeURIComponent(
                currentComic.id
            )
        }`;
}

const backComic =
    document.getElementById(
        "back-comic"
    );

if (backComic) {
    backComic.href =
        `comic.html?id=${
            encodeURIComponent(
                currentComic.id
            )
        }`;
}

}

/* =========================================
GET PAGES
========================================= */

function getPages() {
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

/* =========================================
RENDER PAGES
========================================= */

function renderPages() {
const container =
document.getElementById(
"preview-container"
);

if (!container) {
    console.error(
        "preview-container not found."
    );

    return;
}

const pages =
    getPages();

if (
    pages.length ===
    0
) {
    container.innerHTML =
        "<p>No pages available.</p>";

    return;
}

viewerPages =
    pages;

container.innerHTML =
    "";

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
                    "Failed to load image:",
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

/* =========================================
PAGE URL
========================================= */

function getPageURL(
page
) {
if (
typeof page ===
"string"
) {
return page;
}

if (
    page &&
    typeof page ===
    "object"
) {
    return (
        page.url ||
        page.src ||
        page.image ||
        ""
    );
}

return "";

}

/* =========================================
CHAPTER NAVIGATION
========================================= */

function setupNavigation() {
const currentId =
String(
currentChapter.id ||
""
);

const index =
    allChapters.findIndex(
        chapter => {

            const id =
                typeof chapter ===
                "string"
                    ? chapter
                    : chapter.id;

            return (
                String(id) ===
                currentId
            );
        }
    );

const previous =
    index > 0
        ? allChapters[
            index - 1
        ]
        : null;

const next =
    index >= 0 &&
    index <
        allChapters.length - 1
        ? allChapters[
            index + 1
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
    } else {
        nextButton.style.display =
            "none";
    }
}

}

/* =========================================
BUILD CHAPTER URL
========================================= */

function buildChapterURL(
chapter
) {
const chapterId =
typeof chapter ===
"string"
? chapter
: chapter.id;

return (
    `chapter.html?id=${
        encodeURIComponent(
            currentComic.id
        )
    }&chapter=${
        encodeURIComponent(
            chapterId
        )
    }`
);

}

/* =========================================
VIEWER
========================================= */

function setupViewer() {
const viewer =
document.getElementById(
"image-viewer"
);

const close =
    document.getElementById(
        "viewer-close"
    );

const previous =
    document.getElementById(
        "viewer-prev"
    );

const next =
    document.getElementById(
        "viewer-next"
    );

if (
    close
) {
    close.addEventListener(
        "click",
        closeViewer
    );
}

if (
    previous
) {
    previous.addEventListener(
        "click",
        previousImage
    );
}

if (
    next
) {
    next.addEventListener(
        "click",
        nextImage
    );
}

if (
    viewer
) {
    viewer.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                viewer
            ) {
                closeViewer();
            }
        }
    );
}

document.addEventListener(
    "keydown",
    event => {

        if (
            !viewer ||
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
            closeViewer();
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
    }
);

}

/* =========================================
OPEN VIEWER
========================================= */

function openViewer(
index
) {
const viewer =
document.getElementById(
"image-viewer"
);

const image =
    document.getElementById(
        "viewer-image"
    );

if (
    !viewer ||
    !image
) {
    return;
}

viewerIndex =
    index;

image.src =
    getPageURL(
        viewerPages[
            viewerIndex
        ]
    );

viewer.classList.add(
    "active"
);

document.body.style.overflow =
    "hidden";

}

/* =========================================
NEXT IMAGE
========================================= */

function nextImage() {
if (
!viewerPages.length
) {
return;
}

viewerIndex =
    (
        viewerIndex + 1
    ) %
    viewerPages.length;

updateViewerImage();

}

/* =========================================
PREVIOUS IMAGE
========================================= */

function previousImage() {
if (
!viewerPages.length
) {
return;
}

viewerIndex =
    (
        viewerIndex -
        1 +
        viewerPages.length
    ) %
    viewerPages.length;

updateViewerImage();

}

/* =========================================
UPDATE VIEWER
========================================= */

function updateViewerImage() {
const image =
document.getElementById(
"viewer-image"
);

if (!image) {
    return;
}

image.src =
    getPageURL(
        viewerPages[
            viewerIndex
        ]
    );

}

/* =========================================
CLOSE VIEWER
========================================= */

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

/* =========================================
ERROR
========================================= */

function showError(
message
) {
const container =
document.getElementById(
"preview-container"
);

if (
    container
) {
    container.innerHTML =
        `<p>${message}</p>`;
}

console.error(
    message
);

}
