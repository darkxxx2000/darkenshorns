/*************************************************
 * DARKENSHORNS
 * GALLERY VIEW
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    loadGallery
);


/* =========================
   LOAD
========================= */

async function loadGallery() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");


    if (!id) {

        showError(
            "Gallery not specified."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `../data/gallery/${encodeURIComponent(id)}.json`
            );


        if (!response.ok) {

            throw new Error(
                "Gallery not found."
            );

        }


        const gallery =
            await response.json();


        renderGallery(
            gallery
        );


    } catch (error) {

        console.error(
            "Gallery loading error:",
            error
        );


        showError(
            "Unable to load gallery."
        );

    }

}


/* =========================
   GALLERY
========================= */

function renderGallery(
    gallery
) {

    setText(
        "gallery-title",
        gallery.title
    );


    setText(
        "gallery-description",
        gallery.description
    );


    setText(
        "gallery-breadcrumb",
        gallery.title
    );


    /* =========================
       COVER
    ========================= */

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
            gallery.title || "Gallery";

    }


    /* =========================
       COLLECTIONS
    ========================= */

    if (
        Array.isArray(
            gallery.collections
        )
    ) {

        renderCollections(
            gallery.collections
        );

        return;

    }


    /* =========================
       IMAGES
    ========================= */

    if (
        Array.isArray(
            gallery.images
        )
    ) {

        renderImages(
            gallery.images
        );

        return;

    }


    showEmptyContent();

}


/* =========================
   COLLECTIONS
========================= */

function renderCollections(
    collections
) {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (!collections.length) {

        showEmptyContent();

        return;

    }


    collections.forEach(
        collection => {

            const link =
                document.createElement(
                    "a"
                );


            link.className =
                "gallery-collection-card";


            link.href =
                `gallery-view.html?id=${encodeURIComponent(
                    collection.id
                )}`;


            link.innerHTML = `

                <div class="gallery-collection-cover">

                    <img
                        src="${normalizeAssetPath(
                            collection.cover
                        )}"
                        alt="${collection.title || ""}"
                        loading="lazy"
                    >

                </div>

                <div class="gallery-collection-info">

                    <h3>
                        ${collection.title || ""}
                    </h3>

                </div>

            `;


            const image =
                link.querySelector(
                    "img"
                );


            image.onerror =
                () => {

                    image.onerror =
                        null;

                    image.src =
                        "../assets/placeholders/cover.webp";

                };


            container.appendChild(
                link
            );

        }
    );

}


/* =========================
   IMAGES
========================= */

function renderImages(
    images
) {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(images) ||
        !images.length
    ) {

        showEmptyContent();

        return;

    }


    images.forEach(
        (image, index) => {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                normalizeAssetPath(
                    image
                );


            img.alt =
                `Gallery image ${index + 1}`;


            img.loading =
                "lazy";


            img.addEventListener(
                "click",
                () => {

                    openViewer(
                        images,
                        index
                    );

                }
            );


            img.onerror =
                () => {

                    img.style.display =
                        "none";

                };


            container.appendChild(
                img
            );

        }
    );


    setupViewer();

}


/* =========================
   VIEWER
========================= */

let galleryImages = [];

let currentImage = 0;


function setupViewer() {

    const closeButton =
        document.getElementById(
            "viewer-close"
        );


    if (closeButton) {

        closeButton.onclick =
            closeViewer;

    }


    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (viewer) {

        viewer.onclick =
            event => {

                if (
                    event.target === viewer
                ) {

                    closeViewer();

                }

            };

    }

}


function openViewer(
    images,
    index
) {

    galleryImages =
        images;

    currentImage =
        index;


    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (!viewer) {

        return;

    }


    viewer.classList.add(
        "active"
    );


    updateViewer();

}


function updateViewer() {

    if (
        !galleryImages.length
    ) {

        return;

    }


    const image =
        document.getElementById(
            "viewer-image"
        );


    if (!image) {

        return;

    }


    image.src =
        normalizeAssetPath(
            galleryImages[
                currentImage
            ]
        );

}


function closeViewer() {

    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (viewer) {

        viewer.classList.remove(
            "active"
        );

    }

}


/* =========================
   PATH
========================= */

function normalizeAssetPath(
    path
) {

    if (
        !path ||
        typeof path !== "string"
    ) {

        return "../assets/placeholders/cover.webp";

    }


    path =
        path.trim();


    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//") ||
        path.startsWith("data:")
    ) {

        return path;

    }


    if (
        path.startsWith("../")
    ) {

        return path;

    }


    if (
        path.startsWith("/")
    ) {

        return path;

    }


    return "../" + path;

}


/* =========================
   TEXT
========================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value || "";

}


/* =========================
   EMPTY
========================= */

function showEmptyContent() {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <p class="empty-message">
            No content available.
        </p>

    `;

}


/* =========================
   ERROR
========================= */

function showError(
    message
) {

    setText(
        "gallery-title",
        "Gallery not found"
    );


    setText(
        "gallery-description",
        message
    );

}
