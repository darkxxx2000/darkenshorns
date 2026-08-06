/*************************************************
 * DARKENSHORNS
 * DATA LOADER
 *************************************************/


/**
 * Detecta automáticamente la ruta base.
 * Funciona desde index.html y desde /pages/
 */
const BASE_PATH = window.location.pathname.includes("/pages/")
    ? "../data/"
    : "data/";


/**
 * Caché de archivos cargados.
 */
const cache = new Map();



/**
 * Carga cualquier JSON.
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


    } catch(error) {

        console.error(
            "Error loading JSON:",
            filename,
            error
        );


        return null;

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


/* ===========================
   GALLERIES
=========================== */

export async function loadGalleries() {

    const files =
        await loadJSON(
            "gallery-index.json"
        );

    if (!Array.isArray(files)) {

        console.error(
            "gallery-index.json debe contener un array"
        );

        return [];

    }

    const loaded =
        await Promise.all(

            files.map(
                file =>
                    loadJSON(
                        `gallery/${file}`
                    )
            )

        );

    const galleries = [];

    loaded.forEach(item => {

        if (!item) {

            return;

        }

        if (Array.isArray(item)) {

            galleries.push(...item);

        }

        else if (typeof item === "object") {

            galleries.push(item);

        }

    });

    return galleries;

}


export const loadShortComics =
    () => loadJSON("short-comics.json");





/* ===========================
   COMICS
=========================== */


/**
 * Carga todos los comics.
 *
 * Acepta:
 *
 * 1) archivo individual
 *
 * {
 *   id:"ryuko"
 * }
 *
 *
 * 2) archivo con varios comics
 *
 * [
 *   {
 *    id:"huge-dildo"
 *   }
 * ]
 *
 */

export async function loadComics() {


    const files =
        await loadJSON(
            "comics-index.json"
        );


    if (!Array.isArray(files)) {

        console.error(
            "comics-index.json debe contener un array"
        );

        return [];

    }



    const loaded =
        await Promise.all(

            files.map(
                file =>
                    loadJSON(
                        `comics/${file}`
                    )
            )

        );



    const comics = [];



    loaded.forEach(item => {


        if (!item) {
            return;
        }



        /*
        Si el archivo contiene varios comics
        */

        if (Array.isArray(item)) {

            comics.push(
                ...item
            );

        }


        /*
        Si contiene un solo comic
        */

        else if (
            typeof item === "object"
        ) {

            comics.push(item);

        }


    });



    return comics.filter(
        comic =>
            comic &&
            typeof comic === "object"
    );

}




/* ===========================
   COMIC INDIVIDUAL
=========================== */


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
