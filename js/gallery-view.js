/*************************************************
 * DARKENSHORNS
 * GALLERY VIEW
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    loadGallery
);


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


    renderImages(
        gallery.images || []
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

        console.error(
            "preview-container not found."
        );

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(images) ||
        !images.length
    ) {

        container.innerHTML = `
            <p class="empty-message">
                No images available.
            </p>
        `;

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

        viewer.addEventListener(
            "click",
            event => {

                if (
                    event.target === viewer
                ) {

                    closeViewer();

                }

            }
        );

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
        path.startsWith(
            "http://"
        ) ||
        path.startsWith(
            "https://"
        ) ||
        path.startsWith(
            "//"
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
        )
    ) {

        return path;

    }


    if (
        path.startsWith(
            "/"
        )
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
