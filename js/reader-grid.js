"use strict";

/* ==========================================================
   DARKENSHORNS
   READER GRID ENGINE
   VERSION 1.1
========================================================== */

const Reader={
    comic:null,
    chapter:null,
    chapters:[],
    page:1,
    totalPages:0,
    zoom:100,
    fitMode:"width",
    imageCache:{},
    currentImage:null
};


document.addEventListener(
"DOMContentLoaded",
initializeReader
);


async function initializeReader(){

    const params=new URLSearchParams(
        window.location.search
    );

    const comicId=params.get("id");

    const chapterNumber=
    parseInt(params.get("chapter"))||1;

    const savedPage=
    parseInt(params.get("page"))||1;


    if(!comicId){

        showError("Comic not found.");

        return;

    }


    try{

        const comics=
        await loadJSON("../data/comics.json");


        Reader.chapters=
        await loadJSON("../data/chapters.json");


        Reader.comic=
        comics.find(
            comic=>comic.id===comicId
        );


        if(!Reader.comic){

            showError("Comic not found.");

            return;

        }


        Reader.chapter=
        Reader.chapters.find(
            chapter=>

            chapter.comicId===comicId &&

            chapter.number===chapterNumber

        );


        if(!Reader.chapter){

            showError("Chapter not found.");

            return;

        }


        Reader.totalPages=
        Reader.chapter.pages;


        Reader.page=
        Math.min(
            savedPage,
            Reader.totalPages
        );


        buildHeader();

        configureButtons();

        configureKeyboard();

        configureExtraButtons();

        loadPage(
            Reader.page
        );

        updateProgress();

        saveReading();


    }catch(error){

        console.error(error);

        showError("Loading error.");

    }

}



async function loadJSON(url){

    const response=
    await fetch(url);


    if(!response.ok){

        throw new Error(url);

    }


    return await response.json();

}

/* ==========================================================
   HEADER
========================================================== */

function buildHeader(){

    document.title=
    `${Reader.comic.title} - Chapter ${Reader.chapter.number}`;


    const comicTitle=
    document.getElementById("comic-title");

    if(comicTitle){

        comicTitle.textContent=
        Reader.comic.title;

    }


    const chapterTitle=
    document.getElementById("chapter-title");

    if(chapterTitle){

        chapterTitle.textContent=
        `Chapter ${Reader.chapter.number} - ${Reader.chapter.title}`;

    }


    updateCounter();


    const breadcrumb=
    document.getElementById("breadcrumb");


    if(breadcrumb){

        breadcrumb.innerHTML=`

        <a href="../index.html">
        Home
        </a>

        >

        <a href="comic.html?id=${Reader.comic.id}">
        ${Reader.comic.title}
        </a>

        >

        <span>
        Chapter ${Reader.chapter.number}
        </span>

        `;

    }

}


/* ==========================================================
   PAGE LOADER
========================================================== */

function loadPage(page){

    if(page<1)
        page=1;


    if(page>Reader.totalPages)
        page=Reader.totalPages;


    Reader.page=page;


    const image=
    document.createElement("img");


    image.draggable=false;

    image.loading="eager";


    image.alt=
    `${Reader.comic.title} Chapter ${Reader.chapter.number} Page ${page}`;


    image.src=
    getPageURL(page);


    image.onload=()=>{


        Reader.currentImage=image;


        const container=
        document.getElementById("imageContainer");


        if(container){

            container.innerHTML="";

            container.appendChild(image);

        }


        applyCurrentFit();


        updateCounter();

        updateProgress();

        preloadAround();

        saveReading();


    };


    image.onerror=()=>{

        showError(
            `Image ${page} not found.`
        );

    };

}



/* ==========================================================
   IMAGE PATH
========================================================== */

function getPageURL(page){

    const file=
    String(page).padStart(3,"0");


    return "../uploads/comics/" +

    Reader.chapter.folder +

    "/" +

    file +

    ".webp";

}



/* ==========================================================
   COUNTER
========================================================== */

function updateCounter(){

    const counter=
    document.getElementById("pageCounter");


    if(counter){

        counter.textContent=
        `${Reader.page} / ${Reader.totalPages}`;

    }

}



/* ==========================================================
   PAGE NAVIGATION
========================================================== */

function nextPage(){

    if(Reader.page>=Reader.totalPages){

        autoNextChapter();

        return;

    }


    loadPage(
        Reader.page+1
    );

}



function previousPage(){

    if(Reader.page<=1)
        return;


    loadPage(
        Reader.page-1
    );

}

/* ==========================================================
   BUTTONS
========================================================== */

function configureButtons(){

    const next=
    document.getElementById("nextPage");

    const previous=
    document.getElementById("previousPage");


    const footerNext=
    document.getElementById("footerNext");

    const footerPrevious=
    document.getElementById("footerPrevious");


    if(next)
        next.onclick=nextPage;


    if(previous)
        previous.onclick=previousPage;


    if(footerNext)
        footerNext.onclick=nextPage;


    if(footerPrevious)
        footerPrevious.onclick=previousPage;

}



function configureExtraButtons(){

    const zoomInButton=
    document.getElementById("zoomIn");


    const zoomOutButton=
    document.getElementById("zoomOut");


    const fitWidthButton=
    document.getElementById("fitWidth");


    const fitHeightButton=
    document.getElementById("fitHeight");


    const fullscreenButton=
    document.getElementById("fullscreenButton");


    const webtoonButton=
    document.getElementById("switchWebtoon");


    if(zoomInButton)
        zoomInButton.onclick=zoomIn;


    if(zoomOutButton)
        zoomOutButton.onclick=zoomOut;


    if(fitWidthButton)
        fitWidthButton.onclick=fitWidth;


    if(fitHeightButton)
        fitHeightButton.onclick=fitHeight;


    if(fullscreenButton)
        fullscreenButton.onclick=toggleFullscreen;


    if(webtoonButton)
        webtoonButton.onclick=openWebtoon;

}



/* ==========================================================
   KEYBOARD
========================================================== */

function configureKeyboard(){

    document.addEventListener(
    "keydown",
    event=>{


        if(event.target.tagName==="INPUT")
            return;


        switch(event.key){

            case "ArrowRight":
            case "d":
            case "D":

                nextPage();

                break;


            case "ArrowLeft":
            case "a":
            case "A":

                previousPage();

                break;


            case "+":
            case "=":

                zoomIn();

                break;


            case "-":

                zoomOut();

                break;


            case "f":
            case "F":

                toggleFullscreen();

                break;

        }


    });

}



/* ==========================================================
   ZOOM
========================================================== */

function zoomIn(){

    if(Reader.zoom>=300)
        return;


    Reader.zoom+=10;

    applyZoom();

}



function zoomOut(){

    if(Reader.zoom<=30)
        return;


    Reader.zoom-=10;

    applyZoom();

}



function applyZoom(){

    if(!Reader.currentImage)
        return;


    Reader.currentImage.style.transform=
    `scale(${Reader.zoom/100})`;


    const value=
    document.getElementById("zoomValue");


    if(value){

        value.textContent=
        `${Reader.zoom}%`;

    }

}



/* ==========================================================
   FIT MODES
========================================================== */

function fitWidth(){

    Reader.fitMode="width";

    applyCurrentFit();

}



function fitHeight(){

    Reader.fitMode="height";

    applyCurrentFit();

}



function applyCurrentFit(){

    if(!Reader.currentImage)
        return;


    if(Reader.fitMode==="height"){

        Reader.currentImage.style.width="auto";

        Reader.currentImage.style.height="85vh";

        Reader.currentImage.style.maxWidth="100%";

    }else{

        Reader.currentImage.style.width="100%";

        Reader.currentImage.style.height="auto";

    }

}



/* ==========================================================
   FULLSCREEN
========================================================== */

async function toggleFullscreen(){

    if(!document.fullscreenElement){

        await document.documentElement.requestFullscreen();

    }else{

        await document.exitFullscreen();

    }

}



/* ==========================================================
   PROGRESS
========================================================== */

function updateProgress(){

    const bar=
    document.getElementById("progressValue");


    if(!bar)
        return;


    const percent=
    (Reader.page/Reader.totalPages)*100;


    bar.style.width=
    `${percent}%`;

}



/* ==========================================================
   SAVE
========================================================== */

function saveReading(){

    localStorage.setItem(

        "reader-progress",

        JSON.stringify({

            comic:Reader.comic.id,

            chapter:Reader.chapter.number,

            page:Reader.page,

            date:new Date().toISOString()

        })

    );

}



/* ==========================================================
   CACHE
========================================================== */

function cacheImage(page){

    if(page<1 || page>Reader.totalPages)
        return;


    if(Reader.imageCache[page])
        return;


    const img=
    new Image();


    img.src=
    getPageURL(page);


    Reader.imageCache[page]=img;

}



function preloadAround(){

    cacheImage(Reader.page-1);

    cacheImage(Reader.page+1);

    cacheImage(Reader.page+2);

}



/* ==========================================================
   WEBTOON
========================================================== */

function openWebtoon(){

    window.location.href=

    `reader-webtoon.html?id=${Reader.comic.id}&chapter=${Reader.chapter.number}&page=${Reader.page}`;

}



/* ==========================================================
   CHAPTER NAVIGATION
========================================================== */

function nextChapter(){

    const next=
    Reader.chapters.find(chapter=>

        chapter.comicId===Reader.comic.id &&

        chapter.number===Reader.chapter.number+1

    );


    if(!next)
        return;


    window.location.href=
    `reader-grid.html?id=${Reader.comic.id}&chapter=${next.number}`;

}



function previousChapter(){

    const previous=
    Reader.chapters.find(chapter=>

        chapter.comicId===Reader.comic.id &&

        chapter.number===Reader.chapter.number-1

    );


    if(!previous)
        return;


    window.location.href=
    `reader-grid.html?id=${Reader.comic.id}&chapter=${previous.number}`;

}



function autoNextChapter(){

    if(Reader.page!==Reader.totalPages)
        return;


    nextChapter();

}



/* ==========================================================
   ERROR
========================================================== */

function showError(message){

    const container=
    document.getElementById("imageContainer");


    if(container){

        container.innerHTML=
        `<h2>${message}</h2>`;

    }else{

        console.error(message);

    }

}



console.log(
"DarkensHorns Reader Grid Engine Loaded"
);
