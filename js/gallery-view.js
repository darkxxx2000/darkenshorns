/*************************************************
 * DARKENSHORNS
 * GALLERY VIEW
 *************************************************/

document.addEventListener(
    "DOMContentLoaded",
    loadGallery
);


/* =========================
   STATE
========================= */

let galleryImages = [];

let currentImage = 0;

let currentMode = "normal";

let zoomLevel = 1;


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
        "gallery-breadcrumb",
        gallery.title
    );


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

        setupReaderModes();

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

        galleryImages =
            gallery.images;

        renderImages(
            gallery.images
        );

        setupReaderModes();

        setupViewer();

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


    container.classList.add(
        "collections-mode"
    );


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
                        alt="${escapeHtml(
                            collection.title || ""
                        )}"
                        loading="lazy"
                    >

                </div>

                <div class="gallery-collection-info">

                    <h3>
                        ${escapeHtml(
                            collection.title || ""
                        )}
                    </h3>

                </div>

            `;


            const image =
                link.querySelector(
                    "img"
                );


            if (image) {

                image.onerror =
                    () => {

                        image.onerror =
                            null;

                        image.src =
                            "../assets/placeholders/cover.webp";

                    };

            }


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


    container.classList.remove(
        "collections-mode"
    );


    container.classList.add(
        "normal-mode"
    );


    if (
        !Array.isArray(images) ||
        !images.length
    ) {

        showEmptyContent();

        return;

    }


    images.forEach(
        (image, index) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "gallery-image-item";


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
                index < 4
                    ? "eager"
                    : "lazy";


            img.decoding =
                "async";


            img.dataset.index =
                index;


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

                    wrapper.classList.add(
                        "image-error"
                    );

                    img.remove();

                };


            wrapper.appendChild(
                img
            );


            container.appendChild(
                wrapper
            );

        }
    );

}


/* =========================
   READER MODES
========================= */

function setupReaderModes() {

    const normalButton =
        document.getElementById(
            "normal-mode-button"
        );


    const webtoonButton =
        document.getElementById(
            "webtoon-mode-button"
        );


    if (
        normalButton
    ) {

        normalButton.onclick =
            () => {

                setReaderMode(
                    "normal"
                );

            };

    }


    if (
        webtoonButton
    ) {

        webtoonButton.onclick =
            () => {

                setReaderMode(
                    "webtoon"
                );

            };

    }

}


function setReaderMode(
    mode
) {

    const container =
        document.getElementById(
            "preview-container"
        );


    if (!container) {

        return;

    }


    currentMode =
        mode;


    container.classList.remove(
        "normal-mode",
        "webtoon-mode"
    );


    container.classList.add(
        `${mode}-mode`
    );


    const normalButton =
        document.getElementById(
            "normal-mode-button"
        );


    const webtoonButton =
        document.getElementById(
            "webtoon-mode-button"
        );


    if (normalButton) {

        normalButton.classList.toggle(
            "active",
            mode === "normal"
        );

    }


    if (webtoonButton) {

        webtoonButton.classList.toggle(
            "active",
            mode === "webtoon"
        );

    }

}


/* =========================
   VIEWER
========================= */

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


    const previousButton =
        document.getElementById(
            "viewer-prev"
        );


    if (previousButton) {

        previousButton.onclick =
            event => {

                event.stopPropagation();

                previousImage();

            };

    }


    const nextButton =
        document.getElementById(
            "viewer-next"
        );


    if (nextButton) {

        nextButton.onclick =
            event => {

                event.stopPropagation();

                nextImage();

            };

    }


    const viewerImage =
        document.getElementById(
            "viewer-image"
        );


    if (viewerImage) {

        viewerImage.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                nextImage();

            }
        );


        viewerImage.addEventListener(
            "wheel",
            event => {

                event.preventDefault();

                if (
                    event.deltaY < 0
                ) {

                    zoomIn();

                } else {

                    zoomOut();

                }

            },
            {
                passive: false
            }
        );

    }


    document.addEventListener(
        "keydown",
        handleViewerKeyboard
    );

}


/* =========================
   OPEN VIEWER
========================= */

function openViewer(
    images,
    index
) {

    galleryImages =
        images;

    currentImage =
        index;

    zoomLevel =
        1;


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


    document.body.classList.add(
        "viewer-open"
    );


    updateViewer();

}


/* =========================
   UPDATE VIEWER
========================= */

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


    image.alt =
        `Gallery image ${currentImage + 1}`;


    image.style.transform =
        `scale(${zoomLevel})`;


    const counter =
        document.getElementById(
            "viewer-counter"
        );


    if (counter) {

        counter.textContent =
            `${currentImage + 1} / ${galleryImages.length}`;

    }

}


/* =========================
   NEXT
========================= */

function nextImage() {

    if (
        !galleryImages.length
    ) {

        return;

    }


    currentImage =
        (
            currentImage + 1
        ) %
        galleryImages.length;


    zoomLevel =
        1;


    updateViewer();

}


/* =========================
   PREVIOUS
========================= */

function previousImage() {

    if (
        !galleryImages.length
    ) {

        return;

    }


    currentImage =
        (
            currentImage - 1 +
            galleryImages.length
        ) %
        galleryImages.length;


    zoomLevel =
        1;


    updateViewer();

}


/* =========================
   ZOOM IN
========================= */

function zoomIn() {

    zoomLevel =
        Math.min(
            zoomLevel + 0.15,
            4
        );


    updateViewer();

}


/* =========================
   ZOOM OUT
========================= */

function zoomOut() {

    zoomLevel =
        Math.max(
            zoomLevel - 0.15,
            0.5
        );


    updateViewer();

}


/* =========================
   KEYBOARD
========================= */

function handleViewerKeyboard(
    event
) {

    const viewer =
        document.getElementById(
            "image-viewer"
        );


    if (
        !viewer ||
        !viewer.classList.contains(
            "active"
        )
    ) {

        return;

    }


    if (
        event.key === "Escape"
    ) {

        closeViewer();

    }


    if (
        event.key === "ArrowRight"
    ) {

        nextImage();

    }


    if (
        event.key === "ArrowLeft"
    ) {

        previousImage();

    }


    if (
        event.key === "+"
    ) {

        zoomIn();

    }


    if (
        event.key === "-"
    ) {

        zoomOut();

    }

}


/* =========================
   CLOSE VIEWER
========================= */

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


    document.body.classList.remove(
        "viewer-open"
    );


    const image =
        document.getElementById(
            "viewer-image"
        );


    if (image) {

        image.style.transform =
            "scale(1)";

    }


    zoomLevel =
        1;

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
   ESCAPE HTML
========================= */

function escapeHtml(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

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
        "gallery-breadcrumb",
        "Error"
    );


    const container =
        document.getElementById(
            "preview-container"
        );


    if (container) {

        container.innerHTML = `

            <p class="empty-message">
                ${escapeHtml(message)}
            </p>

        `;

    }

}
