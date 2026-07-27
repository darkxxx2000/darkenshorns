/*************************************************
 * DARKENSHORNS
 * SIDEBAR
 *************************************************/

import {
    loadComics,
    loadCharacters,
    loadSeries,
    loadGenres
} from "./data-loader.js";


/**
 * Renderiza lista de actualizaciones.
 */
function renderRecentUpdates(comics = []) {

    const container =
        document.querySelector("#recent-list");

    if (!container) return;

    container.innerHTML = "";

    const recent = [...comics]
        .sort((a, b) =>
            new Date(b.updated || 0) -
            new Date(a.updated || 0)
        )
        .slice(0, 5);

    recent.forEach(comic => {

        const item =
            document.createElement("li");

        const link =
            document.createElement("a");

        link.href =
    link.href =
    `pages/characters.html?id=${encodeURIComponent(character.id)}`;

        link.textContent =
            comic.title;

        item.appendChild(link);

        container.appendChild(item);

    });

}


/**
 * Renderiza géneros.
 */
function renderGenres(genres = []) {

    const container =
        document.querySelector("#categories-list");

    if (!container) return;

    container.innerHTML = "";

    genres
        .slice(0, 5)
        .forEach(genre => {

            const item =
                document.createElement("li");

            const link =
                document.createElement("a");

            const id =
                typeof genre === "object"
                    ? genre.id
                    : genre;

            const name =
                typeof genre === "object"
                    ? genre.name
                    : genre;

            link.href =
                `pages/series.html?genre=${encodeURIComponent(id)}`;

            link.textContent =
                name;

            item.appendChild(link);

            container.appendChild(item);

        });

}


/**
 * Renderiza series.
 */
function renderSeries(series = []) {

    const container =
        document.querySelector("#series-list");

    if (!container) return;

    container.innerHTML = "";

    series
        .slice(0, 5)
        .forEach(serie => {

            const item =
                document.createElement("li");

            const link =
                document.createElement("a");

            const id =
                typeof serie === "object"
                    ? serie.id
                    : serie;

            const name =
                typeof serie === "object"
                    ? serie.title || serie.name
                    : serie;

            link.href =
                `pages/series.html?id=${encodeURIComponent(id)}`;

            link.textContent =
                name;

            item.appendChild(link);

            container.appendChild(item);

        });

}


/**
 * Renderiza personajes.
 */
function renderCharacters(characters = []) {

    const container =
        document.querySelector("#characters-list");

    if (!container) return;

    container.innerHTML = "";

    characters
        .slice(0, 5)
        .forEach(character => {

            const item =
                document.createElement("div");

            item.className =
                "character-item";

            const link =
                document.createElement("a");

            link.href =
                `pages/characters.html?id=${encodeURIComponent(character.id)}`;

            link.className =
                "character-link";

            link.innerHTML = `

                <div class="character-avatar">

                    <img
                        src="${character.image ||
                        "assets/placeholders/avatar.webp"}"

                        alt="${character.name}"
                    >

                </div>

                <div class="character-info">

                    <span class="character-name">

                        ${character.name}

                    </span>

                    <span class="character-series">

                        ${character.series || ""}

                    </span>

                </div>

            `;

            item.appendChild(link);

            container.appendChild(item);

        });

}


/**
 * Inicializa sidebar.
 */
export async function initSidebar() {

    const comics =
        await loadComics();

    const characters =
        await loadCharacters();

    const series =
        await loadSeries();

    const genres =
        await loadGenres();


    renderRecentUpdates(
        comics
    );

    renderCharacters(
        characters
    );

    renderSeries(
        series
    );

    renderGenres(
        genres
    );

}
