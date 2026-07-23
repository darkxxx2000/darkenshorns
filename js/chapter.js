"use strict";

/* ==========================================================
   DARKENSHORNS
   CHAPTER SYSTEM
========================================================== */


let currentComic = null;

let currentChapter = null;

let allChapters = [];





document.addEventListener(
"DOMContentLoaded",
initChapter
);





async function initChapter(){


    const params = new URLSearchParams(
        window.location.search
    );


    const comicId = params.get("id");


    const chapterNumber = Number(
        params.get("chapter")
    );



    if(!comicId || !chapterNumber){

        showError(
            "Chapter information missing."
        );

        return;

    }



    try{


        const comics = await loadJSON(
            "../data/comics.json"
        );


        allChapters = await loadJSON(
            "../data/chapters.json"
        );



        currentComic = comics.find(
            comic =>
            comic.id === comicId
        );



        if(!currentComic){

            showError(
                "Comic not found."
            );

            return;

        }



        currentChapter = allChapters.find(
            chapter =>
            chapter.comicId === comicId &&
            chapter.number === chapterNumber
        );



        if(!currentChapter){

            showError(
                "Chapter not found."
            );

            return;

        }



        renderChapter();


        setupReaderLinks();


        setupNavigation();


        renderPreview();


    }
    catch(error){


        console.error(error);


        showError(
            "Unable to load chapter."
        );


    }



}





async function loadJSON(url){


    const response = await fetch(url);



    if(!response.ok){

        throw new Error(
            "Cannot load "+url
        );

    }



    return await response.json();


}

/* ==========================================================
   RENDER CHAPTER
========================================================== */

function renderChapter(){

    document.title =
    `${currentComic.title} - Chapter ${currentChapter.number}`;

    document.getElementById("comic-name").textContent =
    currentComic.title;

    document.getElementById("chapter-name").textContent =
    `Chapter ${currentChapter.number}: ${currentChapter.title}`;

    document.getElementById("chapter-title").textContent =
    `Chapter ${currentChapter.number}`;

    document.getElementById("chapter-pages").textContent =
    `Pages: ${currentChapter.pages}`;

    document.getElementById("chapter-date").textContent =
    `Date: ${currentChapter.releaseDate}`;

    document.getElementById("comic-link").href =
    `comic.html?id=${currentComic.id}`;

    document.getElementById("back-comic").href =
    `comic.html?id=${currentComic.id}`;
}


/* ==========================================================
   READER LINKS
========================================================== */

function setupReaderLinks(){

    const grid =
    document.getElementById("grid-reader");

    const webtoon =
    document.getElementById("webtoon-reader");


    grid.href =
    `reader-grid.html?id=${currentComic.id}&chapter=${currentChapter.number}`;


    webtoon.href =
    `reader-webtoon.html?id=${currentComic.id}&chapter=${currentChapter.number}`;

}


/* ==========================================================
   CHAPTER NAVIGATION
========================================================== */

function setupNavigation(){

    const previous =
    allChapters.find(chapter =>
        chapter.comicId === currentComic.id &&
        chapter.number === currentChapter.number - 1
    );


    const next =
    allChapters.find(chapter =>
        chapter.comicId === currentComic.id &&
        chapter.number === currentChapter.number + 1
    );


    const previousButton =
    document.getElementById("previous-chapter");


    const nextButton =
    document.getElementById("next-chapter");


    if(previous){

        previousButton.href =
        `chapter.html?id=${currentComic.id}&chapter=${previous.number}`;

    }else{

        previousButton.style.display="none";

    }


    if(next){

        nextButton.href =
        `chapter.html?id=${currentComic.id}&chapter=${next.number}`;

    }else{

        nextButton.style.display="none";

    }

}

/* ==========================================================
   CHAPTER PREVIEW
========================================================== */

function renderPreview(){

    const container =
    document.getElementById("preview-container");

    container.innerHTML="";


    const limit =
    Math.min(currentChapter.pages,12);


    for(let i=1;i<=limit;i++){

        const page =
        String(i).padStart(3,"0");


        const image =
        document.createElement("img");


        image.src =
        `../uploads/comics/${currentChapter.folder}/${page}.webp`;


        image.alt =
        `Page ${i}`;


        image.loading="lazy";


        image.dataset.page=i;


        image.addEventListener(
            "click",
            ()=>{

                window.location.href =
                `reader-grid.html?id=${currentComic.id}&chapter=${currentChapter.number}&page=${i}`;

            }
        );


        container.appendChild(image);

    }

}


/* ==========================================================
   ERROR MESSAGE
========================================================== */

function showError(message){

    const page =
    document.querySelector(".chapter-page");


    if(page){

        page.innerHTML = `
        <section class="error-message">
            <h1>${message}</h1>
            <a href="../index.html">
            Return Home
            </a>
        </section>
        `;

    }

}
