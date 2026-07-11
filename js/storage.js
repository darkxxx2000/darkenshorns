/*************************************************
 * DARKENSHORNS
 * STORAGE
 *************************************************/

const PREFIX = "darkenshorns";

/**
 * Genera la clave completa.
 */
function getKey(key) {

    return `${PREFIX}:${key}`;

}

/**
 * Guarda cualquier dato.
 */
export function save(key, value) {

    try {

        localStorage.setItem(

            getKey(key),

            JSON.stringify(value)

        );

        return true;

    } catch (error) {

        console.error("Storage save error:", error);

        return false;

    }

}

/**
 * Obtiene un dato.
 */
export function load(key, defaultValue = null) {

    try {

        const value = localStorage.getItem(getKey(key));

        return value === null

            ? defaultValue

            : JSON.parse(value);

    } catch (error) {

        console.error("Storage load error:", error);

        return defaultValue;

    }

}

/**
 * Elimina un dato.
 */
export function remove(key) {

    localStorage.removeItem(getKey(key));

}

/**
 * Verifica si existe.
 */
export function exists(key) {

    return localStorage.getItem(getKey(key)) !== null;

}

/**
 * Alterna un elemento dentro de un array.
 * Ideal para favoritos.
 */
export function toggleArrayItem(key, item) {

    const list = load(key, []);

    const index = list.indexOf(item);

    if (index === -1) {

        list.push(item);

    } else {

        list.splice(index, 1);

    }

    save(key, list);

    return list;

}

/**
 * Agrega un elemento único.
 */
export function addUnique(key, item) {

    const list = load(key, []);

    if (!list.includes(item)) {

        list.push(item);

        save(key, list);

    }

    return list;

}

/**
 * Limpia todo el almacenamiento de DarkensHorns.
 */
export function clearAll() {

    Object.keys(localStorage)

        .filter(key => key.startsWith(PREFIX + ":"))

        .forEach(key => localStorage.removeItem(key));

}
