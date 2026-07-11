/*************************************************
 * DARKENSHORNS
 * ROUTER
 *************************************************/


/**
 * Obtiene parámetros de la URL.
 */
export function getParams() {


    const params =
    new URLSearchParams(
        window.location.search
    );


    const data = {};


    for (const [key, value] of params.entries()) {

        data[key] = value;

    }


    return data;

}



/**
 * Obtiene un parámetro específico.
 */
export function getParam(name) {


    const params =
    new URLSearchParams(
        window.location.search
    );


    return params.get(name);

}



/**
 * Detecta la página actual.
 */
export function getCurrentPage() {


    const path =
    window.location.pathname
    .split("/")
    .pop()
    .replace(".html","");


    return path || "index";

}



/**
 * Redirección simple.
 */
export function redirect(url) {


    window.location.href = url;


}



/**
 * Verifica si existe un ID.
 */
export function requireId() {


    const id =
    getParam("id");


    if (!id) {


        console.warn(
            "Missing content id"
        );


        return null;

    }


    return id;

}
