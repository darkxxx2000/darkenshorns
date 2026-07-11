/*************************************************
 * DARKENSHORNS
 * FILTERS
 *************************************************/


/**
 * Filtra por género.
 */
export function filterByGenre(items = [], genre) {

    if (!genre) return items;


    return items.filter(item => {

        if (!Array.isArray(item.genres)) {

            return false;

        }


        return item.genres

            .map(g => g.toLowerCase())

            .includes(genre.toLowerCase());

    });

}


/**
 * Filtra por estado.
 * Ej: Ongoing, Completed
 */
export function filterByStatus(items = [], status) {

    if (!status) return items;


    return items.filter(item =>

        item.status?.toLowerCase() === status.toLowerCase()

    );

}


/**
 * Filtra por autor.
 */
export function filterByAuthor(items = [], author) {

    if (!author) return items;


    return items.filter(item =>

        item.author

        ?.toLowerCase()

        .includes(author.toLowerCase())

    );

}


/**
 * Filtra por etiquetas.
 */
export function filterByTag(items = [], tag) {

    if (!tag) return items;


    return items.filter(item => {

        if (!Array.isArray(item.tags)) {

            return false;

        }


        return item.tags

            .map(t => t.toLowerCase())

            .includes(tag.toLowerCase());

    });

}


/**
 * Ordenamientos.
 */
export function sortItems(items = [], type) {


    const copy = [...items];


    switch(type) {


        case "title":

            return copy.sort((a,b) =>

                a.title.localeCompare(b.title)

            );


        case "recent":

            return copy.sort((a,b) =>

                new Date(b.updated) -

                new Date(a.updated)

            );


        case "views":

            return copy.sort((a,b) =>

                (b.views || 0) -

                (a.views || 0)

            );


        case "rating":

            return copy.sort((a,b) =>

                (b.rating || 0) -

                (a.rating || 0)

            );


        default:

            return items;

    }

}


/**
 * Aplica múltiples filtros juntos.
 */
export function applyFilters(items, options = {}) {


    let result = [...items];


    if (options.genre) {

        result = filterByGenre(

            result,

            options.genre

        );

    }


    if (options.status) {

        result = filterByStatus(

            result,

            options.status

        );

    }


    if (options.author) {

        result = filterByAuthor(

            result,

            options.author

        );

    }


    if (options.tag) {

        result = filterByTag(

            result,

            options.tag

        );

    }


    if (options.sort) {

        result = sortItems(

            result,

            options.sort

        );

    }


    return result;

}
