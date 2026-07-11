/*************************************************
 * DARKENSHORNS
 * SIDEBAR
 *************************************************/

import {
    loadComics,
    loadCharacters
} from "./data-loader.js";


/**
 * Renderiza lista de actualizaciones.
 */
function renderRecentUpdates(comics = []) {


    const container =
    document.querySelector(
        "#recent-list"
    );


    if (!container) return;


    container.innerHTML = "";


    const recent = [...comics]

        .sort((a,b) =>
            new Date(b.updated || 0) -
            new Date(a.updated || 0)
        )

        .slice(0,5);



    recent.forEach(comic => {


        const item =
        document.createElement("li");


        item.innerHTML = `

            <a href="pages/comic.html?id=${comic.id}">

                ${comic.title}

            </a>

        `;


        container.appendChild(item);


    });


}



/**
 * Renderiza personajes.
 */
function renderCharacters(characters = []) {


    const container =
    document.querySelector(
        "#characters-list"
    );


    if (!container) return;


    container.innerHTML = "";


    characters

    .slice(0,5)

    .forEach(character => {


        const item =
        document.createElement("div");


        item.className =
        "character-item";


        item.innerHTML = `

            <div class="character-avatar">

                <img
                src="${character.image ||
                "assets/placeholders/avatar.webp"}"

                alt="${character.name}">

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


    renderRecentUpdates(
        comics
    );


    renderCharacters(
        characters
    );


}
