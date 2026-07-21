/*************************************************
 * DARKENSHORNS
 * DATA LOADER
 *************************************************/

/**
 * Detecta automáticamente la ruta base.
 * Funciona tanto desde index.html como desde /pages/.
 */
const BASE_PATH = window.location.pathname.includes("/pages/")
    ? "../data/"
    : "data/";


/**
 * Caché de archivos ya cargados.
 */
const cache = new Map();


/**
 * Carga cualquier archivo JSON.
 */
export async function loadJSON(filename) {

    if (cache.has(filename)) {
        return cache.get(filename);
    }

    try {

        const response =
            await fetch(BASE_PATH + filename);

        if (!response.ok) {

            throw new Error(
                `Unable to load ${filename}`
            );

        }

        const data =
            await response.json();

        cache.set(filename, data);

        return data;

    } catch (error) {

        console.error(
            `Error loading ${filename}:`,
            error
        );

        return [];

    }

}


/* ===========================
   DATASETS GENERALES
=========================== */

export const loadHome =
    () => loadJSON("home.json");


export const loadSeries =
    () => loadJSON("series.json");


export const loadCharacters =
    () => loadJSON("characters.json");


export const loadGenres =
    () => loadJSON("genres.json");


export const loadTags =
    () => loadJSON("tags.json");


export const loadGalleries =
    () => loadJSON("galleries.json");


export const loadShortComics =
    () => loadJSON("short-comics.json");


/* ===========================
   COMICS
=========================== */

/**
 * Carga todos los cómics.
 *
 * Ahora utiliza:
 *
 * data/comics-index.json
 *
 * que contiene:
 *
 * [
 *   "ryuko-matoi.json",
 *   "otro-comic.json"
 * ]
 */
export async function loadComics() {

    const files =
        await loadJSON(
            "comics-index.json"
        );


    if (!Array.isArray(files)) {

        console.error(
            "comics-index.json debe contener un array."
        );

        return [];

    }


    const comics =
        await Promise.all(

            files.map(
                file =>
                    loadJSON(
                        `comics/${file}`
                    )
            )

        );


    return comics.filter(
        comic =>
            comic &&
            typeof comic === "object" &&
            !Array.isArray(comic)
    );

}


/* ===========================
   COMIC INDIVIDUAL
=========================== */

/**
 * Obtiene un cómic por su ID.
 *
 * Ejemplo:
 *
 * getComicById("ryuko-matoi")
 */
export async function getComicById(id) {

    const comics =
        await loadComics();


    return comics.find(
        comic =>
            String(comic.id)
                .toLowerCase() ===
            String(id)
                .toLowerCase()
    );

}
