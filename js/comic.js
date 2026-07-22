/* =========================================
   DARKENSHORNS - COMIC PAGE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadComicPage();
});


/* =========================================
   LOAD COMIC
========================================= */

async function loadComicPage() {

    const params = new URLSearchParams(window.location.search);
    const comicId = params.get("id");

    if (!comicId) {
        showComicError("No comic ID specified.");
        return;
    }

    try {

        /*
        IMPORTANT:
        comic.html is inside /pages/
        Therefore ../data/ is required
        */

        const response = await fetch(`../data/comics/${comicId}.json`);

        if (!response.ok) {
            throw new Error(`Comic not found: ${comicId}`);
        }

        const comic = await response.json();

        renderComic(comic);

        loadChapters(comicId);

    } catch (error) {

        console.error("Error loading comic:", error);

        showComicError(
            `Comic "${comicId}" could not be found.`
        );

    }

}


/* =========================================
   RENDER COMIC
========================================= */

function renderComic(comic) {

    /* TITLE */

    const title = document.getElementById("comic-title");

    if (title) {
        title.textContent = comic.title || "Untitled Comic";
    }


    /* BREADCRUMB */

    const breadcrumb = document.getElementById("breadcrumb-title");

    if (breadcrumb) {
        breadcrumb.textContent =
            comic.title || "Comic";
    }


    /* COVER */

    const cover = document.getElementById("comic-cover-image");

    if (cover && comic.cover) {

        cover.src = normalizeAssetPath(comic.cover);

        cover.alt =
            comic.title || "Comic Cover";

    }


    /* BANNER */

    const banner = document.getElementById("comic-banner-image");

    if (banner && comic.banner) {

        banner.src = normalizeAssetPath(comic.banner);

        banner.alt =
            comic.title || "Comic Banner";

    }


    /* AUTHOR */

    const author =
        document.getElementById("comic-author");

    if (author) {
        author.textContent =
            comic.author || "-";
    }


    /* STATUS */

    const status =
        document.getElementById("comic-status");

    if (status) {
        status.textContent =
            comic.status || "-";
    }


    /* UPDATED */

    const updated =
        document.getElementById("comic-updated");

    if (updated) {
        updated.textContent =
            comic.updated || "-";
    }


    /* DESCRIPTION */

    const description =
        document.getElementById("comic-description");

    if (description) {
        description.textContent =
            comic.description || "";
    }


    /* RATING */

    const rating =
        document.getElementById("comic-rating");

    if (rating) {

        if (comic.rating) {

            rating.textContent =
                `★ ${comic.rating}`;

        } else {

            rating.textContent =
                "★★★★★";

        }

    }


    /* GENRES */

    const genresContainer =
        document.getElementById("comic-genres");

    if (genresContainer) {

        genresContainer.innerHTML = "";

        const genres =
            Array.isArray(comic.genres)
                ? comic.genres
                : [];

        genres.forEach(genre => {

            const tag =
                document.createElement("span");

            tag.textContent = genre;

            genresContainer.appendChild(tag);

        });

    }


    /* TAGS */

    const tagsContainer =
        document.getElementById("comic-tags");

    if (tagsContainer) {

        tagsContainer.innerHTML = "";

        const tags =
            Array.isArray(comic.tags)
                ? comic.tags
                : [];

        tags.forEach(tagName => {

            const tag =
                document.createElement("span");

            tag.textContent = tagName;

            tagsContainer.appendChild(tag);

        });

    }


    /* CHARACTERS */

    const charactersContainer =
        document.getElementById(
            "characters-container"
        );

    if (charactersContainer) {

        charactersContainer.innerHTML = "";

        const characters =
            Array.isArray(comic.characters)
                ? comic.characters
                : [];

        characters.forEach(character => {

            const item =
                document.createElement("div");

            item.className =
                "character-card";

            item.textContent =
                typeof character === "string"
                    ? character
                    : character.name || "";

            charactersContainer.appendChild(item);

        });

    }


    /* CHAPTER COUNT */

    const chaptersCount =
        document.getElementById(
            "comic-chapters"
        );

    if (chaptersCount) {

        const chapters =
            Array.isArray(comic.chapters)
                ? comic.chapters
                : [];

        chaptersCount.textContent =
            chapters.length;

    }


    /* FIRST CHAPTER */

    const firstChapterButton =
        document.getElementById(
            "first-chapter-button"
        );

    if (
        firstChapterButton &&
        Array.isArray(comic.chapters) &&
        comic.chapters.length > 0
    ) {

        const firstChapter =
            comic.chapters[0];

        const chapterId =
            typeof firstChapter === "string"
                ? firstChapter
                : firstChapter.id ||
                  firstChapter.slug ||
                  firstChapter.chapter;

        if (chapterId) {

            firstChapterButton.href =
                `chapter.html?id=${comic.id || getComicIdFromURL()}&chapter=${encodeURIComponent(chapterId)}`;

        }

    }

}


/* =========================================
   LOAD CHAPTERS
========================================= */

async function loadChapters(comicId) {

    const container =
        document.getElementById(
            "chapters-container"
        );

    if (!container) {
        return;
    }

    try {

        /*
        We use the chapter information
        from the comic JSON.

        The comic JSON should contain
        something like:

        "chapters": [
            {
                "id": "Chapter-01",
                "title": "Chapter 01",
                "folder": "Ryuko-vs-Huge-Dildo"
            }
        ]
        */

        const response =
            await fetch(
                `../data/comics/${comicId}.json`
            );

        if (!response.ok) {
            throw new Error(
                "Comic JSON not found"
            );
        }

        const comic =
            await response.json();

        const chapters =
            Array.isArray(comic.chapters)
                ? comic.chapters
                : [];

        container.innerHTML = "";

        if (chapters.length === 0) {

            container.innerHTML =
                "<p>No chapters available yet.</p>";

            return;

        }

        chapters.forEach((chapter, index) => {

            const item =
                document.createElement("a");

            item.className =
                "chapter-item";

            const chapterTitle =
                typeof chapter === "string"
                    ? chapter
                    : chapter.title ||
                      `Chapter ${index + 1}`;

            item.textContent =
                chapterTitle;

            /*
            Chapter page link.
            */

            const chapterId =
                typeof chapter === "string"
                    ? chapter
                    : chapter.id ||
                      chapter.slug ||
                      chapter.chapter ||
                      "";

            item.href =
                `chapter.html?comic=${encodeURIComponent(comicId)}&chapter=${encodeURIComponent(chapterId)}`;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Error loading chapters:",
            error
        );

        container.innerHTML =
            "<p>Unable to load chapters.</p>";

    }

}


/* =========================================
   ERROR
========================================= */

function showComicError(message) {

    const title =
        document.getElementById(
            "comic-title"
        );

    if (title) {
        title.textContent =
            "Comic Not Found";
    }

    const description =
        document.getElementById(
            "comic-description"
        );

    if (description) {
        description.textContent =
            message;
    }

}


/* =========================================
   GET ID
========================================= */

function getComicIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id") || "";

}


/* =========================================
   ASSET PATH
========================================= */

function normalizeAssetPath(path) {

    if (!path) {
        return "";
    }

    /*
    Paths beginning with ../
    are already correct.
    */

    if (
        path.startsWith("../") ||
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        return path;

    }

    /*
    If JSON stores:

    assets/comics/ryuko.jpg

    convert to:

    ../assets/comics/ryuko.jpg
    */

    return `../${path}`;

}
