/*************************************************
 * DARKENSHORNS
 * LAZY LOAD
 *************************************************/


/**
 * Configuración del observador.
 */
const observerOptions = {

    root: null,

    rootMargin: "100px",

    threshold: 0.1

};


/**
 * Carga una imagen.
 */
function loadImage(image) {

    const source = image.dataset.src;


    if (!source) return;


    image.src = source;


    image.onload = () => {

        image.classList.add("loaded");

    };


    image.removeAttribute("data-src");

}


/**
 * Observador de imágenes.
 */
const imageObserver = new IntersectionObserver(

    (entries, observer) => {


        entries.forEach(entry => {


            if (entry.isIntersecting) {


                loadImage(entry.target);


                observer.unobserve(entry.target);


            }


        });


    },

    observerOptions

);


/**
 * Inicializa lazy loading.
 */
export function initLazyLoad() {


    const images = document.querySelectorAll(

        "img[data-src]"

    );


    images.forEach(image => {


        imageObserver.observe(image);


    });


}


/**
 * Permite actualizar después de cargar nuevas tarjetas.
 */
export function observeImages(container = document) {


    const images = container.querySelectorAll(

        "img[data-src]"

    );


    images.forEach(image => {


        imageObserver.observe(image);


    });

}
