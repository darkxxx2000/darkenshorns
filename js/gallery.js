/*************************************************
 * DARKENSHORNS
 * GALLERY
 *************************************************/


import {
    loadGalleries
} from "./data-loader.js";


import {
    renderGalleryCards
} from "./gallery-cards.js";



document.addEventListener(
    "DOMContentLoaded",
    initGallery
);



async function initGallery(){


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");



    /*
    =========================
    LISTADO DE GALLERIES
    =========================
    */


    if(!id){

        loadGalleryList();

        return;

    }



    /*
    =========================
    GALERIA INDIVIDUAL
    =========================
    */


    loadGalleryDetail(id);



}




async function loadGalleryList(){


    const container =
        document.getElementById(
            "gallery-container"
        );


    if(!container){

        return;

    }



    const galleries =
        await loadGalleries();



    renderGalleryCards(
        container,
        galleries
    );


}





async function loadGalleryDetail(id){


    try {


        const response =
            await fetch(
                `../data/gallery/${encodeURIComponent(id)}.json`
            );



        if(!response.ok){

            throw new Error(
                "Gallery not found"
            );

        }



        const gallery =
            await response.json();



        renderGallery(
            gallery
        );



    }
    catch(error){


        console.error(
            error
        );


    }


}




function renderGallery(gallery){


    setText(
        "gallery-title",
        gallery.title
    );


    setText(
        "gallery-description",
        gallery.description
    );



    const cover =
        document.getElementById(
            "gallery-cover-image"
        );


    if(cover){


        cover.src =
            normalizeAssetPath(
                gallery.cover
            );


    }



    renderCollections(
        gallery.collections || []
    );


}





function renderCollections(collections){


    const container =
        document.getElementById(
            "gallery-collections-container"
        );


    if(!container){

        return;

    }



    container.innerHTML="";



    collections.forEach(collection=>{


        const item =
            document.createElement(
                "a"
            );


        item.className =
            "chapter-item";


        item.href =
            `gallery-view.html?id=${collection.id}`;


        item.textContent =
            collection.title;



        container.appendChild(
            item
        );


    });


}




function setText(id,value){


    const el =
        document.getElementById(id);


    if(el){

        el.textContent =
            value || "-";

    }


}




function normalizeAssetPath(path){


    if(
        !path
    ){

        return "../assets/placeholders/cover-placeholder.webp";

    }



    if(
        path.startsWith("http")
    ){

        return path;

    }



    return path.startsWith("../")
        ? path
        : "../"+path;


}
