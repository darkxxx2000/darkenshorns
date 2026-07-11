/*************************************************
 * DARKENSHORNS
 * CARDS
 *************************************************/

import { createElement } from "./utils.js";

/**
 * Crea una tarjeta de cómic.
 */
export function createComicCard(comic) {

    const card = createElement("article", "comic-card");

    card.dataset.id = comic.id || "";

    card.innerHTML = `

        <div class="comic-cover">

            <img
                src="${comic.cover || "assets/placeholders/cover.webp"}"
                alt="${comic.title || "Comic"}"
                loading="lazy">

            ${comic.status
                ? `<span class="card-badge">${comic.status}</span>`
                : ""}

        </div>

        <div class="card-info">

            <h3 class="card-title">
                ${comic.title || "Untitled"}
            </h3>

            <div class="card-author">
                ${comic.author || "Unknown Author"}
            </div>

            <p class="card-description">
                ${comic.description || ""}
            </p>

            <div class="card-footer">

                <span class="chapter-number">
                    ${comic.chapters
                        ? comic.chapters + " Chapters"
                        : ""}
                </span>

                <span class="card-date">
                    ${comic.updated || ""}
                </span>

            </div>

        </div>

    `;

    return card;

}

/**
 * Renderiza un listado de tarjetas.
 */
export function renderComicCards(container, comics = []) {

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(comics) || comics.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No comics available.
            </p>
        `;

        return;
    }

    const fragment = document.createDocumentFragment();

    comics.forEach(comic => {
        fragment.appendChild(createComicCard(comic));
    });

    container.appendChild(fragment);
}
