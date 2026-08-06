/*************************************************
 * DARKENSHORNS
 * GALLERY CARDS
 *************************************************/

import {
    createElement
} from "./utils.js";


function getGalleryPageUrl() {

    const insidePages =
        window.location.pathname.includes("/pages/");

    return insidePages
        ? "gallery-view.html"
        : "pages/gallery-view.html";

}


function getAssetUrl(path) {

    if (!path) {
        return getFallbackCover();
    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//") ||
        path.startsWith("data:")
    ) {
        return path;
    }

    if (path.startsWith("../")) {
        return path;
    }

    if (window.location.pathname.includes("/pages/")) {
        return `../${path}`;
    }

    return path;

}


function getFallbackCover() {

    return window.location.pathname.includes("/pages/")
        ? "../assets/placeholders/cover.webp"
        : "assets/placeholders/cover.webp";

}


export function createGalleryCard(gallery) {

    const card =
        createElement(
            "article",
            "comic-card"
        );

    const cover =
        getAssetUrl(gallery.cover);

    const collections =
        Array.isArray(gallery.collections)
            ? gallery.collections.length
            : 0;

    card.innerHTML = `

<a
class="comic-card-link"
href="${getGalleryPageUrl()}?id=${encodeURIComponent(gallery.id)}">

<div class="comic-cover">

<img
src="${cover}"
alt="${gallery.title}"
loading="lazy"
onerror="this.src='${getFallbackCover()}'">

</div>

<div class="card-info">

<h3 class="card-title">
${gallery.title}
</h3>

<p class="card-description">
${gallery.description || ""}
</p>

<div class="card-footer">

<span class="chapter-number">

${collections} Collections

</span>

</div>

</div>

</a>

`;

    return card;

}


export function renderGalleryCards(
    container,
    galleries = []
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!galleries.length) {

        container.innerHTML =

            `<p class="empty-message">
                No galleries available.
            </p>`;

        return;
    }

    galleries.forEach(gallery => {

        container.appendChild(

            createGalleryCard(gallery)

        );

    });

}
