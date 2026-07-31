"use strict";

let currentComic = null;
let currentChapter = null;

document.addEventListener("DOMContentLoaded", initChapter);

async function initChapter() {
const params = new URLSearchParams(window.location.search);
const comicId = params.get("id");
const chapterId = params.get("chapter");

if (!comicId || !chapterId) {
    console.error("Missing comic or chapter ID.");
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

    const chapterInfo = Array.isArray(currentComic.chapters)
        ? currentComic.chapters.find(
            chapter =>
                chapter &&
                typeof chapter === "object" &&
                String(chapter.id) === String(chapterId)
        )
        : null;

    if (!chapterInfo) {
        throw new Error(
            `Chapter not found: ${chapterId}`
        );
    }

    const folder = String(
        chapterInfo.folder || ""
    ).trim();

    const file = String(
        chapterInfo.file || ""
    ).trim();

    if (!folder || !file) {
        throw new Error(
            "Chapter folder or file is missing."
        );
    }

    const chapterURL =
        `../data/chapters/` +
        `${encodeURIComponent(comicId)}/` +
        `${encodeURIComponent(folder)}/` +
        `${encodeURIComponent(file)}`;

    console.log(
        "Loading chapter:",
        chapterURL
    );

    const chapterResponse =
        await fetch(chapterURL);

    if (!chapterResponse.ok) {
        throw new Error(
            `Chapter JSON not found: ${chapterURL}`
        );
    }

    const chapterData =
    await chapterResponse.json();

currentChapter = Object.assign(
    {},
    chapterInfo,
    chapterData
);

renderChapter();

} catch (error) {
    console.error(
        "Chapter loading error:",
        error
    );

    const container =
        document.querySelector(
            "#preview-container"
        );

    if (container) {
        container.innerHTML =
            "<p>Error loading chapter.</p>";
    }
}

}

function renderChapter() {
const title =
document.querySelector(
"#chapter-title"
);

if (title) {
    title.textContent =
        currentChapter.title ||
        "Chapter";
}

const subtitle =
    document.querySelector(
        "#chapter-subtitle"
    );

if (subtitle) {
    subtitle.textContent =
        currentChapter.subtitle ||
        "";
}

const container =
    document.querySelector(
        "#preview-container"
    );

if (!container) {
    console.error(
        "preview-container not found."
    );
    return;
}

const pages =
    currentChapter.pages ||
    currentChapter.images ||
    [];

if (!Array.isArray(pages) || !pages.length) {
    container.innerHTML =
        "<p>No images found in this chapter.</p>";

    console.error(
        "No pages found:",
        currentChapter
    );

    return;
}

container.innerHTML = "";

pages.forEach(
    (page, index) => {

        const image =
            document.createElement(
                "img"
            );

        const imageURL =
            typeof page === "string"
                ? page
                : page &&
                  (
                      page.url ||
                      page.src ||
                      page.image ||
                      ""
                  );

        image.src = imageURL;

        image.alt =
            `Page ${index + 1}`;

        image.loading =
            index < 3
                ? "eager"
                : "lazy";

        image.addEventListener(
            "click",
            () => {
                openImage(
                    imageURL
                );
            }
        );

        image.addEventListener(
            "error",
            () => {
                console.error(
                    "Image failed to load:",
                    imageURL
                );
            }
        );

        container.appendChild(
            image
        );
    }
);

}

function openImage(src) {
const viewer =
document.querySelector(
"#image-viewer"
);

const image =
    document.querySelector(
        "#viewer-image"
    );

if (!viewer || !image) {
    return;
}

image.src = src;

viewer.classList.add(
    "active"
);

document.body.style.overflow =
    "hidden";

}

function closeViewer() {
const viewer =
document.querySelector(
"#image-viewer"
);

if (viewer) {
    viewer.classList.remove(
        "active"
    );
}

document.body.style.overflow =
    "";

}

document.addEventListener(
"click",
event => {

    if (
        event.target.matches(
            "#viewer-close"
        )
    ) {
        closeViewer();
    }
}

);
