/*************************************************
 * DARKENSHORNS
 * Utility Functions
 *************************************************/

/**
 * Obtener un elemento
 */

export function $(selector) {

    return document.querySelector(selector);

}

/**
 * Obtener varios elementos
 */

export function $$(selector) {

    return document.querySelectorAll(selector);

}

/**
 * Crear elemento HTML
 */

export function createElement(tag, className = "") {

    const element = document.createElement(tag);

    if (className) {

        element.className = className;

    }

    return element;

}

/**
 * Limpiar contenedor
 */

export function clearElement(element) {

    if (element) {

        element.innerHTML = "";

    }

}

/**
 * Capitalizar texto
 */

export function capitalize(text = "") {

    return text.charAt(0).toUpperCase() + text.slice(1);

}

/**
 * Formatear fecha
 */

export function formatDate(date) {

    return new Date(date).toLocaleDateString();

}

/**
 * Generar ID único
 */

export function uid() {

    return crypto.randomUUID();

}

/**
 * Espera
 */

export function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}
