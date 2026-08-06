/*************************************************
 * DARKENSHORNS
 * GALLERY PAGE
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    loadGalleryPage
);

async function loadGalleryPage() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const galleryId =
        params.get("id");

    if (!galleryId) {

        showGalleryError(
            "Gallery not specified."
        );

        return;

    }

    try {

        const response =
            await fetch(
                `../data/gallery/${encodeURIComponent(galleryId)}.json`
            );

        if (!response.ok) {

            throw new Error(
                "Gallery not found."
            );

        }

        const gallery =
            await response.json();

        renderGallery(gallery);

    }

    catch (error) {

        console.error(error);

        showGalleryError(
            "Unable to load gallery."
        );

    }

}

function renderGallery(gallery) {

    setText(
        "gallery-title",
        gallery.title
    );

    setText(
        "gallery-author",
        gallery.author
    );

    setText(
        "gallery-updated",
        gallery.updated
    );

    setText(
        "gallery-description",
        gallery.description
    );

    setText(
        "gallery-tags",
        Array.isArray(gallery.tags)
            ? gallery.tags.join(", ")
            : ""
    );

    const cover =
        document.getElementById(
            "gallery-cover-image"
        );

    if (cover) {

        cover.src =
            normalizeAssetPath(
                gallery.cover
            );

        cover.alt =
            gallery.title;

    }

    renderCollections(
        gallery.collections || []
    );

}

function renderCollections(collections) {

    const container =
        document.getElementById(
            "gallery-collections-container"
        );

    if (!container) {

        return;

    }

    container.innerHTML = "";

    if (!collections.length) {

        container.innerHTML =
            "<p>No collections available.</p>";

        return;

    }

    collections.forEach(collection => {

        const item =
            document.createElement("a");

        item.className =
            "chapter-item";

        item.href =
            `gallery-view.html?id=${encodeURIComponent(collection.id)}`;

        item.innerHTML = `

<span class="chapter-number">
${collection.title}
</span>

`;

        container.appendChild(item);

    });

}

function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {

        el.textContent =
            value || "-";

    }

}

function normalizeAssetPath(path) {

    if (!path) {

        return "../assets/placeholders/cover-placeholder.webp";

    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        return path;

    }

    if (path.startsWith("../")) {

        return path;

    }

    return "../" + path;

}

function showGalleryError(message) {

    setText(
        "gallery-title",
        "Gallery not found"
    );

    setText(
        "gallery-description",
        message
    );

}
