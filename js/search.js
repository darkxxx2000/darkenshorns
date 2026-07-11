/*************************************************
 * DARKENSHORNS
 * SEARCH
 *************************************************/

/**
 * Normaliza un texto para hacer búsquedas.
 */
function normalize(text = "") {

    return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}

/**
 * Busca coincidencias.
 */
export function searchComics(comics = [], query = "") {

    const term = normalize(query);

    if (!term) return comics;

    return comics.filter(comic => {

        const title = normalize(comic.title);
        const author = normalize(comic.author);
        const description = normalize(comic.description);

        const genres = Array.isArray(comic.genres)
            ? comic.genres.join(" ")
            : "";

        const tags = Array.isArray(comic.tags)
            ? comic.tags.join(" ")
            : "";

        return (

            title.includes(term) ||

            author.includes(term) ||

            description.includes(term) ||

            normalize(genres).includes(term) ||

            normalize(tags).includes(term)

        );

    });

}

/**
 * Activa un buscador sobre un input.
 */
export function setupSearch(input, comics, callback) {

    if (!input) return;

    input.addEventListener("input", e => {

        const results = searchComics(

            comics,

            e.target.value

        );

        callback(results);

    });

}
