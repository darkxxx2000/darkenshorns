/* =========================================
DARKENSHORNS - CHAPTER READER
========================================= */

document.addEventListener("DOMContentLoaded", loadChapterPage);

/* =========================================
LOAD CHAPTER PAGE
========================================= */

async function loadChapterPage() {
const params = new URLSearchParams(window.location.search);
const comicId = params.get("id");
const seriesId = params.get("series");
const chapterId = params.get("chapter");

if (!comicId || !seriesId || !chapterId) {
    showChapterError("Comic, series or chapter ID not specified.");
    return;
}

try {
    /* =========================================
       LOAD COMIC JSON
    ========================================= */

    const comicResponse = await fetch(
        `../data/comics/${encodeURIComponent(comicId)}.json`
    );

    if (!comicResponse.ok) {
        throw new Error(`Comic not found: ${comicId}`);
    }

    const comic = await comicResponse.json();

    /* =========================================
       FIND SERIES
    ========================================= */

    const series = Array.isArray(comic.series)
        ? comic.series.find(
            currentSeries =>
                String(currentSeries.id) === String(seriesId)
        )
        : null;

    if (!series) {
        throw new Error(`Series not found: ${seriesId}`);
    }

    /* =========================================
       FIND CHAPTER
    ========================================= */

    const chapter = Array.isArray(series.chapters)
        ? series.chapters.find(
            currentChapter =>
                typeof currentChapter === "object" &&
                String(currentChapter.id) === String(chapterId)
        )
        : null;

    if (!chapter) {
        throw new Error(`Chapter not found: ${chapterId}`);
    }

    /* =========================================
       BUILD CHAPTER JSON PATH
    ========================================= */

    const folder = chapter.folder || series.id;
    const file = chapter.file || `${chapterId}.json`;

    const chapterPath =
        `../data/chapters/` +
        `${encodeURIComponent(comicId)}/` +
        `${encodeURIComponent(folder)}/` +
        `${encodeURIComponent(file)}`;

    console.log("Loading chapter JSON:", chapterPath);

    /* =========================================
       LOAD CHAPTER JSON
    ========================================= */

    const chapterResponse = await fetch(chapterPath);

    if (!chapterResponse.ok) {
        throw new Error(
            `Chapter file not found: ${chapterPath}`
        );
    }

    const chapterData = await chapterResponse.json();

    /* =========================================
       RENDER CHAPTER
    ========================================= */

    renderChapterPage(
        comic,
        series,
        chapter,
        chapterData
    );

} catch (error) {
    console.error(
        "Error loading chapter:",
        error
    );

    showChapterError(
        "The requested chapter could not be loaded."
    );
}

}

/* =========================================
RENDER CHAPTER PAGE
========================================= */

function renderChapterPage(
comic,
series,
chapter,
chapterData
) {
/* =========================================
CHAPTER TITLE
========================================= */

const title =
    document.getElementById("chapter-title");

if (title) {
    title.textContent =
        chapterData.title ||
        chapter.title ||
        "Untitled Chapter";
}

/* =========================================
   CHAPTER SUBTITLE
========================================= */

const subtitle =
    document.getElementById("chapter-subtitle");

if (subtitle) {
    subtitle.textContent =
        chapterData.subtitle ||
        chapter.subtitle ||
        "";
}

/* =========================================
   COMIC TITLE
========================================= */

const comicTitle =
    document.getElementById("comic-title");

if (comicTitle) {
    comicTitle.textContent =
        comic.title ||
        "Comic";
}

/* =========================================
   SERIES TITLE
========================================= */

const seriesTitle =
    document.getElementById("series-title");

if (seriesTitle) {
    seriesTitle.textContent =
        series.title ||
        "Series";
}

/* =========================================
   BREADCRUMB
========================================= */

const breadcrumb =
    document.getElementById("breadcrumb-title");

if (breadcrumb) {
    breadcrumb.textContent =
        chapterData.title ||
        chapter.title ||
        "Chapter";
}

/* =========================================
   PAGES
========================================= */

const pages =
    Array.isArray(chapterData.pages)
        ? chapterData.pages
        : [];

if (pages.length === 0) {
    showChapterError(
        "This chapter has no pages."
    );
    return;
}

renderChapterPages(pages);

/* =========================================
   READER CONTROLS
========================================= */

setupReaderControls();

/* =========================================
   IMAGE VIEWER
========================================= */

setupImageViewer(pages);

}

/* =========================================
RENDER CHAPTER PAGES
========================================= */

function renderChapterPages(pages) {
const container =
document.getElementById("preview-container");

if (!container) {
    console.error(
        "preview-container not found."
    );
    return;
}

container.innerHTML = "";

pages.forEach(
    (pageUrl, index) => {

        if (!pageUrl) {
            return;
        }

        const image =
            document.createElement("img");

        image.src =
            normalizeAssetPath(pageUrl);

        image.alt =
            `Page ${index + 1}`;

        image.loading =
            index === 0
                ? "eager"
                : "lazy";

        image.decoding =
            "async";

        image.dataset.pageIndex =
            index;

        image.addEventListener(
            "click",
            () => {

                openImageViewer(
                    pages,
                    index
                );

            }
        );

        image.addEventListener(
            "error",
            () => {

                console.error(
                    "Failed to load page:",
                    pageUrl
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
READER CONTROLS
========================================= */

function setupReaderControls() {
const normalButton =
document.getElementById(
"normal-mode-button"
);

const webtoonButton =
    document.getElementById(
        "webtoon-mode-button"
    );

const container =
    document.getElementById(
        "preview-container"
    );

if (!container) {
    return;
}

if (normalButton) {
    normalButton.addEventListener(
        "click",
        () => {

            container.classList.remove(
                "webtoon-mode"
            );

            normalButton.classList.add(
                "active"
            );

            if (webtoonButton) {
                webtoonButton.classList.remove(
                    "active"
                );
            }

        }
    );
}

if (webtoonButton) {
    webtoonButton.addEventListener(
        "click",
        () => {

            container.classList.add(
                "webtoon-mode"
            );

            webtoonButton.classList.add(
                "active"
            );

            if (normalButton) {
                normalButton.classList.remove(
                    "active"
                );
            }

        }
    );
}

}

/* =========================================
IMAGE VIEWER SETUP
========================================= */

let viewerPages = [];
let viewerIndex = 0;
let viewerScale = 1;

function setupImageViewer(pages) {
viewerPages = pages;

const viewer =
    document.getElementById(
        "image-viewer"
    );

const image =
    document.getElementById(
        "viewer-image"
    );

const closeButton =
    document.getElementById(
        "viewer-close"
    );

if (!viewer || !image) {
    return;
}

if (closeButton) {
    closeButton.addEventListener(
        "click",
        closeImageViewer
    );
}

viewer.addEventListener(
    "click",
    event => {

        if (
            event.target === viewer
        ) {
            closeImageViewer();
        }

    }
);

image.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        if (viewerScale > 1) {
            return;
        }

        nextViewerImage();

    }
);

image.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

        if (event.deltaY < 0) {
            viewerScale += 0.15;
        } else {
            viewerScale -= 0.15;
        }

        viewerScale =
            Math.max(
                1,
                Math.min(
                    viewerScale,
                    5
                )
            );

        image.style.transform =
            `scale(${viewerScale})`;

    },
    { passive: false }
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
            event.key === "Escape"
        ) {
            closeImageViewer();
        }

        if (
            event.key === "ArrowRight"
        ) {
            nextViewerImage();
        }

        if (
            event.key === "ArrowLeft"
        ) {
            previousViewerImage();
        }

    }
);

}

/* =========================================
OPEN IMAGE VIEWER
========================================= */

function openImageViewer(
pages,
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

if (!viewer || !image) {
    return;
}

viewerPages =
    pages;

viewerIndex =
    index;

viewerScale =
    1;

image.style.transform =
    "scale(1)";

image.src =
    normalizeAssetPath(
        viewerPages[viewerIndex]
    );

image.alt =
    `Page ${viewerIndex + 1}`;

viewer.classList.add(
    "active"
);

document.body.style.overflow =
    "hidden";

}

/* =========================================
CLOSE IMAGE VIEWER
========================================= */

function closeImageViewer() {
const viewer =
document.getElementById(
"image-viewer"
);

const image =
    document.getElementById(
        "viewer-image"
    );

if (!viewer) {
    return;
}

viewer.classList.remove(
    "active"
);

document.body.style.overflow =
    "";

viewerScale =
    1;

if (image) {
    image.style.transform =
        "scale(1)";
}

}

/* =========================================
NEXT IMAGE
========================================= */

function nextViewerImage() {
if (
viewerPages.length === 0
) {
return;
}

if (
    viewerIndex <
    viewerPages.length - 1
) {
    viewerIndex++;

    updateViewerImage();
}

}

/* =========================================
PREVIOUS IMAGE
========================================= */

function previousViewerImage() {
if (
viewerPages.length === 0
) {
return;
}

if (
    viewerIndex > 0
) {
    viewerIndex--;

    updateViewerImage();
}

}

/* =========================================
UPDATE VIEWER IMAGE
========================================= */

function updateViewerImage() {
const image =
document.getElementById(
"viewer-image"
);

if (!image) {
    return;
}

viewerScale =
    1;

image.style.transform =
    "scale(1)";

image.src =
    normalizeAssetPath(
        viewerPages[viewerIndex]
    );

image.alt =
    `Page ${viewerIndex + 1}`;

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

/* =========================================
   EXTERNAL URL
========================================= */

if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("data:")
) {
    return path;
}

/* =========================================
   ALREADY RELATIVE
========================================= */

if (
    path.startsWith("../")
) {
    return path;
}

/* =========================================
   ROOT ASSET
========================================= */

if (
    path.startsWith("assets/")
) {
    return `../${path}`;
}

return `../${path}`;

}

/* =========================================
ERROR
========================================= */

function showChapterError(
message
) {
const title =
document.getElementById(
"chapter-title"
);

const subtitle =
    document.getElementById(
        "chapter-subtitle"
    );

const container =
    document.getElementById(
        "preview-container"
    );

if (title) {
    title.textContent =
        "Chapter Not Found";
}

if (subtitle) {
    subtitle.textContent =
        message;
}

if (container) {
    container.innerHTML =
        `<p>${message}</p>`;
}

}
