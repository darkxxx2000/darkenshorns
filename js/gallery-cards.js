/*************************************************
 * DARKENSHORNS
 * GALLERY CARDS
 *************************************************/

function getGalleryPageUrl() {

    return window.location.pathname.includes("/pages/")
        ? "gallery-view.html"
        : "pages/gallery-view.html";

}


function getAssetUrl(path) {

    if (!path || typeof path !== "string") {
        return getFallbackCover();
    }

    path = path.trim();

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

    return window.location.pathname.includes("/pages/")
        ? `../${path}`
        : path;

}


function getFallbackCover() {

    return window.location.pathname.includes("/pages/")
        ? "../assets/placeholders/cover.webp"
        : "assets/placeholders/cover.webp";

}


export function createGalleryCard(gallery) {

    const card =
        document.createElement("article");

    card.className =
        "gallery-card";


    const cover =
        getAssetUrl(gallery.cover);


    const collections =
        Array.isArray(gallery.collections)
            ? gallery.collections.length
            : 0;


    card.innerHTML = `

<a
    class="gallery-card-link"
    href="${getGalleryPageUrl()}?id=${encodeURIComponent(gallery.id)}"
>

    <div class="gallery-card-cover">

        <img
            src="${cover}"
            alt="${gallery.title || "Gallery"}"
            loading="lazy"
            onerror="
                this.onerror=null;
                this.src='${getFallbackCover()}';
            "
        >

    </div>


    <div class="gallery-card-info">

        <h3 class="gallery-card-title">
            ${gallery.title || "Untitled Gallery"}
        </h3>


        ${
            gallery.description
                ? `
                <p class="gallery-card-description">
                    ${gallery.description}
                </p>
                `
                : ""
        }


        <div class="gallery-card-footer">

            <span>
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


    if (
        !Array.isArray(galleries) ||
        galleries.length === 0
    ) {

        container.innerHTML = `
            <p class="empty-message">
                No galleries available.
            </p>
        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    galleries.forEach(gallery => {

        fragment.appendChild(
            createGalleryCard(gallery)
        );

    });


    container.appendChild(
        fragment
    );

}
