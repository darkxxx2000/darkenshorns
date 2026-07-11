/*************************************************
 * DARKENSHORNS
 * MODAL
 *************************************************/


let modal = null;


/**
 * Inicializa el modal.
 */
export function initModal() {


    modal = document.querySelector("#comic-modal");


    if (!modal) {

        return;

    }


    const closeButton = modal.querySelector(
        ".modal-close"
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    modal.addEventListener(
        "click",
        event => {


            if (event.target === modal) {

                closeModal();

            }


        }

    );


    document.addEventListener(
        "keydown",
        event => {


            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeModal();

            }


        }

    );

}


/**
 * Abre modal con contenido.
 */
export function openModal(content) {


    if (!modal) {

        initModal();

    }


    if (!modal) return;


    const body = modal.querySelector(
        "#modal-body"
    );


    if (body) {

        body.innerHTML = content;

    }


    modal.classList.add("active");


    document.body.classList.add(
        "modal-open"
    );

}


/**
 * Cierra modal.
 */
export function closeModal() {


    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );


}


/**
 * Modal de detalle de cómic.
 */
export function openComicModal(comic) {


    const content = `

        <div class="modal-comic">

            <img 
            src="${comic.cover}"
            alt="${comic.title}">


            <div class="modal-info">

                <h2>
                    ${comic.title}
                </h2>


                <p>
                    ${comic.description || ""}
                </p>


                <p>
                    Author:
                    ${comic.author || "Unknown"}
                </p>


                <p>
                    Chapters:
                    ${comic.chapters || 0}
                </p>


            </div>

        </div>

    `;


    openModal(content);

}
