/*************************************************
 * DARKENSHORNS
 * DATA LOADER
 *************************************************/

const DATA_PATH = "../data";

/**
 * Cargar un archivo JSON
 */

export async function loadJSON(file) {

    try {

        const response = await fetch(`${DATA_PATH}/${file}`);

        if (!response.ok) {

            throw new Error(`Error loading ${file}`);

        }

        return await response.json();

    }

    catch (error) {

        console.error(error);

        return [];

    }

}


/**
 * Comics
 */

export async function loadComics() {

    return await loadJSON("comics.json");

}


/**
 * Series
 */

export async function loadSeries() {

    return await loadJSON("series.json");

}


/**
 * Characters
 */

export async function loadCharacters() {

    return await loadJSON("characters.json");

}


/**
 * Galleries
 */

export async function loadGalleries() {

    return await loadJSON("galleries.json");

}


/**
 * Genres
 */

export async function loadGenres() {

    return await loadJSON("genres.json");

}


/**
 * Tags
 */

export async function loadTags() {

    return await loadJSON("tags.json");

}


/**
 * Short Comics
 */

export async function loadShortComics() {

    return await loadJSON("short-comics.json");

}


/**
 * Home
 */

export async function loadHome() {

    return await loadJSON("home.json");

}
