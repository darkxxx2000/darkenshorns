"use strict";

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

document.addEventListener("DOMContentLoaded", initChapter);

async function initChapter() {
const params = new URLSearchParams(window.location.search);
const comicId = params.get("id") || params.get("comic");
const chapterId = params.get("chapter");

```
if (!comicId || !chapterId) {
    showError("Chapter information missing.");
    return;
}

try {
    const comicResponse = await fetch(
        `../data/comics/${encodeURIComponent(comicId)}.json`
    );

    if (!comicResponse.ok) {
        throw new Error(`Comic JSON not found: ${comicId}`);
    }

    currentComic = await comicResponse.json();
    allChapters = Array.isArray(currentComic.chapters)
        ? currentComic.chapters
        : [];

    currentChapter = findChapter(allChapters, chapterId);

    if (!currentChapter) {
        showError("Chapter not found.");
        return;
    }

    if (typeof currentChapter === "object" && currentChapter.file) {
        const chapterPath = buildChapterJSONPath(currentChapter);

        console.log("Loading chapter:", chapterPath);

        const chapterResponse = await fetch(chapterPath);

        if (!chapterResponse.ok) {
            throw new Error(
                `Chapter JSON not found: ${chapterPath}`
            );
        }

        const chapterData = await chapterResponse.json();

        currentChapter = {
            ...currentChapter,
            ...chapterData
        };
    }

    renderChapter();
    setupReaderLinks();
    setupNavigation();
    renderPreview();
    setupViewer();

} catch (error) {
    console.error("Chapter loading error:", error);
    showError("Unable to load chapter.");
}
```

}

function findChapter(chapters, chapterId) {
const search = String(chapterId).toLowerCase();

```
return chapters.find(chapter => {
    if (typeof chapter === "string") {
        return chapter.toLowerCase() === search;
    }

    if (!chapter || typeof chapter !== "object") {
        return false;
    }

    const id =
        chapter.id ||
        chapter.slug ||
        chapter.chapter ||
        chapter.number ||
        "";

    return String(id).toLowerCase() === search;
});
```

}

function buildChapterJSONPath(chapter) {
if (!chapter) return "";

```
if (chapter.path) {
    return normalizeDataPath(chapter.path);
}

const file = String(chapter.file || "").trim();
const folder = String(chapter.folder || "").trim();

if (!file) return "";

if (/^https?:\/\//i.test(file)) {
    return file;
}

if (file.startsWith("../")) {
    return file;
}

if (file.startsWith("data/")) {
    return `../${file}`;
}

if (file.startsWith("chapters/")) {
    return `../data/${file}`;
}

if (folder) {
    return (
        `../data/chapters/` +
        `${encodeURIComponent(currentComic.id)}/` +
        `${encodeURIComponent(folder)}/` +
        `${encodeURIComponent(file)}`
    );
}

return `../data/chapters/${encodeURIComponent(file)}`;
```

}

function normalizeDataPath(path) {
if (!path) return "";

```
if (/^https?:\/\//i.test(path)) {
    return path;
}

if (path.startsWith("../")) {
    return path;
}

if (path.startsWith("./")) {
    return path;
}

if (path.startsWith("data/")) {
    return `../${path}`;
}

return `../data/${path}`;
```

}

function renderChapter() {
const comicTitle = currentComic.title || "Comic";
const chapterNumber = currentChapter.number || "";
const chapterTitle = currentChapter.title || "Chapter";
const subtitle = currentChapter.subtitle || "";
const comicId = currentComic.id || getCurrentComicId();
const comicURL = `comic.html?id=${encodeURIComponent(comicId)}`;

```
document.title = `${comicTitle} - ${chapterTitle}`;

const comicName = document.getElementById("comic-name");
if (comicName) comicName.textContent = comicTitle;

const chapterName = document.getElementById("chapter-name");
if (chapterName) {
    chapterName.textContent = chapterNumber
        ? `Chapter ${chapterNumber}: ${chapterTitle}`
        : chapterTitle;

    if (subtitle) {
        chapterName.textContent += ` — ${subtitle}`;
    }
}

const title = document.getElementById("chapter-title");
if (title) title.textContent = chapterTitle;

const pages = getChapterPages();

const pagesInfo = document.getElementById("chapter-pages");
if (pagesInfo) {
    pagesInfo.textContent = `Pages: ${pages.length}`;
}

const dateInfo = document.getElementById("chapter-date");
if (dateInfo) {
    dateInfo.textContent =
        `Date: ${currentChapter.date || currentChapter.releaseDate || "-"}`;
}

const comicLink = document.getElementById("comic-link");
if (comicLink) comicLink.href = comicURL;

const backComic = document.getElementById("back-comic");
if (backComic) backComic.href = comicURL;
```

}

function setupReaderLinks() {
const normalButton = document.getElementById("grid-reader");
const webtoonButton = document.getElementById("webtoon-reader");

```
if (normalButton) {
    normalButton.addEventListener("click", () => {
        renderNormalMode();
        setActiveButton(normalButton);
    });
}

if (webtoonButton) {
    webtoonButton.addEventListener("click", () => {
        renderWebtoonMode();
        setActiveButton(webtoonButton);
    });
}
```

}

function setActiveButton(activeButton) {
document.querySelectorAll(".reader-button").forEach(button => {
button.classList.remove("active");
});

```
activeButton.classList.add("active");
```

}

function renderNormalMode() {
const container = document.getElementById("preview-container");
if (!container) return;

```
container.classList.remove("webtoon-mode");
renderImages(container);
```

}

function renderWebtoonMode() {
const container = document.getElementById("preview-container");
if (!container) return;

```
container.classList.add("webtoon-mode");
renderImages(container);
```

}

function renderPreview() {
renderNormalMode();
}

function renderImages(container) {
container.innerHTML = "";

```
const pages = getChapterPages();

if (!pages.length) {
    container.innerHTML =
        '<div class="reader-empty">No pages available.</div>';
    return;
}

pages.forEach((page, index) => {
    const image = document.createElement("img");

    image.src = getPageURL(page);
    image.alt = `Page ${index + 1}`;
    image.loading = index < 3 ? "eager" : "lazy";
    image.dataset.index = index;

    image.addEventListener("click", () => {
        openViewer(index);
    });

    image.addEventListener("error", () => {
        console.error("Image failed:", image.src);
    });

    container.appendChild(image);
});
```

}

function getChapterPages() {
if (!currentChapter) return [];

```
if (Array.isArray(currentChapter.pages)) {
    return currentChapter.pages;
}

if (Array.isArray(currentChapter.images)) {
    return currentChapter.images;
}

return [];
```

}

function getPageURL(page) {
if (typeof page === "string") {
return page;
}

```
if (page && typeof page === "object") {
    return page.url || page.src || page.image || "";
}

return "";
```

}

function setupViewer() {
const viewer = document.getElementById("image-viewer");
const image = document.getElementById("viewer-image");
const close = document.getElementById("viewer-close");
const next = document.getElementById("viewer-next");
const previous = document.getElementById("viewer-prev");

```
if (!viewer || !image) return;

close?.addEventListener("click", closeViewer);
next?.addEventListener("click", nextImage);
previous?.addEventListener("click", previousImage);

viewer.addEventListener("click", event => {
    if (event.target === viewer) {
        closeViewer();
    }
});

image.addEventListener("wheel", zoomImage, { passive: false });
image.addEventListener("mousedown", startDrag);

document.addEventListener("mousemove", dragImage);
document.addEventListener("mouseup", stopDrag);

document.addEventListener("keydown", event => {
    if (!viewer.classList.contains("active")) return;

    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") previousImage();
});
```

}

function openViewer(index) {
const viewer = document.getElementById("image-viewer");
if (!viewer || !viewerPages.length) return;

```
viewerIndex = index;
resetImagePosition();
showViewerImage();

viewer.classList.add("active");
document.body.style.overflow = "hidden";
```

}

function showViewerImage() {
const image = document.getElementById("viewer-image");
if (!image || !viewerPages.length) return;

```
image.src = getPageURL(viewerPages[viewerIndex]);
image.alt = `Page ${viewerIndex + 1}`;

updateViewerTransform();
```

}

function nextImage() {
if (!viewerPages.length) return;

```
viewerIndex = (viewerIndex + 1) % viewerPages.length;
resetImagePosition();
showViewerImage();
```

}

function previousImage() {
if (!viewerPages.length) return;

```
viewerIndex =
    (viewerIndex - 1 + viewerPages.length) %
    viewerPages.length;

resetImagePosition();
showViewerImage();
```

}

function closeViewer() {
const viewer = document.getElementById("image-viewer");
if (!viewer) return;

```
viewer.classList.remove("active");
document.body.style.overflow = "";
```

}

function zoomImage(event) {
event.preventDefault();

```
viewerScale += event.deltaY < 0 ? 0.1 : -0.1;
viewerScale = Math.max(0.5, Math.min(viewerScale, 5));

updateViewerTransform();
```

}

function resetImagePosition() {
viewerScale = 1;
imagePositionX = 0;
imagePositionY = 0;
}

function updateViewerTransform() {
const image = document.getElementById("viewer-image");
if (!image) return;

```
image.style.transform =
    `translate(${imagePositionX}px, ${imagePositionY}px) scale(${viewerScale})`;
```

}

function startDrag(event) {
if (
event.target.id !== "viewer-image" ||
event.button !== 0
) {
return;
}

```
isDragging = true;
dragStartX = event.clientX - imagePositionX;
dragStartY = event.clientY - imagePositionY;
```

}

function dragImage(event) {
if (!isDragging) return;

```
imagePositionX = event.clientX - dragStartX;
imagePositionY = event.clientY - dragStartY;

updateViewerTransform();
```

}

function stopDrag() {
isDragging = false;
}

function setupNavigation() {
const currentIndex = allChapters.findIndex(chapter => {
return (
String(getChapterIdentifier(chapter)).toLowerCase() ===
String(getChapterIdentifier(currentChapter)).toLowerCase()
);
});

```
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
    document.getElementById("previous-chapter");

const nextButton =
    document.getElementById("next-chapter");

if (previousButton) {
    if (previous) {
        previousButton.href = buildChapterURL(previous);
        previousButton.style.display = "";
    } else {
        previousButton.style.display = "none";
    }
}

if (nextButton) {
    if (next) {
        nextButton.href = buildChapterURL(next);
        nextButton.style.display = "";
    } else {
        nextButton.style.display = "none";
    }
}
```

}

function getChapterIdentifier(chapter) {
if (!chapter) return "";

```
if (typeof chapter === "string") {
    return chapter;
}

return (
    chapter.id ||
    chapter.slug ||
    chapter.chapter ||
    chapter.number ||
    ""
);
```

}

function buildChapterURL(chapter) {
const comicId = currentComic.id || getCurrentComicId();
const chapterId = getChapterIdentifier(chapter);

```
return (
    `chapter.html?id=${encodeURIComponent(comicId)}` +
    `&chapter=${encodeURIComponent(chapterId)}`
);
```

}

function getCurrentComicId() {
const params = new URLSearchParams(window.location.search);

```
return (
    params.get("id") ||
    params.get("comic") ||
    ""
);
```

}

function showError(message) {
const page = document.querySelector(".chapter-page");

```
if (page) {
    page.innerHTML = `
        <section class="error-message">
            <h1>${message}</h1>
            <a href="../index.html">Return Home</a>
        </section>
    `;
}

console.error(message);
```

}

