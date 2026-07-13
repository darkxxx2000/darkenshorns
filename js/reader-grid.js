"use strict";

/* ==========================================================
   DARKENSHORNS
   READER GRID ENGINE
   VERSION 1.0
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



document.addEventListener("DOMContentLoaded",initializeReader);



async function initializeReader(){

    const params=new URLSearchParams(window.location.search);

    const comicId=params.get("id");

    const chapterNumber=parseInt(params.get("chapter"))||1;

    const savedPage=parseInt(params.get("page"))||1;

    if(!comicId){

        showError("Comic not found.");

        return;

    }

    try{

        const comics=await loadJSON("../data/comics.json");

        Reader.chapters=await loadJSON("../data/chapters.json");

        Reader.comic=comics.find(c=>c.id===comicId);

        if(!Reader.comic){

            showError("Comic not found.");

            return;

        }

        Reader.chapter=Reader.chapters.find(c=>

            c.comicId===comicId &&
            c.number===chapterNumber

        );

        if(!Reader.chapter){

            showError("Chapter not found.");

            return;

        }

        Reader.totalPages=Reader.chapter.pages;

        Reader.page=Math.min(savedPage,Reader.totalPages);

        buildHeader();

        configureButtons();

        configureKeyboard();

        loadPage(Reader.page);

        updateProgress();

        saveReading();

    }

    catch(error){

        console.error(error);

        showError("Loading error.");

    }

}



async function loadJSON(url){

    const response=await fetch(url);

    if(!response.ok){

        throw new Error(url);

    }

    return await response.json();

}



function buildHeader(){

    document.title=
        Reader.comic.title+
        " - Chapter "+
        Reader.chapter.number;

    document.getElementById("comic-title").textContent=
        Reader.comic.title;

    document.getElementById("chapter-title").textContent=
        "Chapter "+
        Reader.chapter.number+
        " - "+
        Reader.chapter.title;

    document.getElementById("pageCounter").textContent=
        Reader.page+
        " / "+
        Reader.totalPages;

    const breadcrumb=document.getElementById("breadcrumb");

    breadcrumb.innerHTML=`

<a href="../index.html">Home</a>

>

<a href="series.html">Series</a>

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

/* ==========================================================
   PAGE LOADER
========================================================== */

function loadPage(page){

    if(page<1) page=1;

    if(page>Reader.totalPages) page=Reader.totalPages;

    Reader.page=page;

    const image=document.createElement("img");

    image.draggable=false;

    image.loading="eager";

    image.alt=
        Reader.comic.title+
        " Chapter "+
        Reader.chapter.number+
        " Page "+
        page;

    image.src=getPageURL(page);

    image.onload=()=>{

        Reader.currentImage=image;

        const container=
        document.getElementById("imageContainer");

        container.innerHTML="";

        container.appendChild(image);

        updateCounter();

        updateProgress();

        preloadNext();

        saveReading();

    };

    image.onerror=()=>{

        showError(
            "Image "+
            page+
            " not found."
        );

    };

}



/* ==========================================================
   IMAGE URL
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
   PAGE COUNTER
========================================================== */

function updateCounter(){

    document.getElementById("pageCounter")
    .textContent=

    Reader.page+

    " / "+

    Reader.totalPages;

}



/* ==========================================================
   NEXT / PREVIOUS
========================================================== */

function nextPage(){

    if(Reader.page>=Reader.totalPages){

        return;

    }

    loadPage(Reader.page+1);

}



function previousPage(){

    if(Reader.page<=1){

        return;

    }

    loadPage(Reader.page-1);

}



/* ==========================================================
   BUTTONS
========================================================== */

function configureButtons(){

    document
    .getElementById("nextPage")
    .onclick=nextPage;

    document
    .getElementById("previousPage")
    .onclick=previousPage;

    document
    .getElementById("footerNext")
    .onclick=nextPage;

    document
    .getElementById("footerPrevious")
    .onclick=previousPage;

}



/* ==========================================================
   PRELOAD
========================================================== */

function preloadNext(){

    if(Reader.page>=Reader.totalPages){

        return;

    }

    const preload=new Image();

    preload.src=
        getPageURL(
            Reader.page+1
        );

}



/* ==========================================================
   PROGRESS BAR
========================================================== */

function updateProgress(){

    const percent=

    (Reader.page/

    Reader.totalPages)

    *100;

    document
    .getElementById("progressValue")
    .style.width=

    percent+"%";

}



/* ==========================================================
   SAVE READING
========================================================== */

function saveReading(){

    localStorage.setItem(

        "reader-progress",

        JSON.stringify({

            comic:Reader.comic.id,

            chapter:Reader.chapter.number,

            page:Reader.page,

            date:new Date()

            .toISOString()

        })

    );

}

/* ==========================================================
   KEYBOARD
========================================================== */

function configureKeyboard(){

    document.addEventListener("keydown",(event)=>{

        if(event.target.tagName==="INPUT") return;

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

            case "Home":
                loadPage(1);
                break;

            case "End":
                loadPage(Reader.totalPages);
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

            case "w":
            case "W":
                fitWidth();
                break;

            case "h":
            case "H":
                fitHeight();
                break;
        }

    });

}

/* ==========================================================
   ZOOM
========================================================== */

function zoomIn(){

    if(Reader.zoom>=300) return;

    Reader.zoom+=10;

    applyZoom();

}

function zoomOut(){

    if(Reader.zoom<=30) return;

    Reader.zoom-=10;

    applyZoom();

}

function applyZoom(){

    if(!Reader.currentImage) return;

    Reader.currentImage.style.transform=
        `scale(${Reader.zoom/100})`;

    document.getElementById("zoomValue").textContent=
        Reader.zoom+"%";

}

/* ==========================================================
   FIT MODES
========================================================== */

function fitWidth(){

    if(!Reader.currentImage) return;

    Reader.fitMode="width";

    Reader.currentImage.style.width="100%";
    Reader.currentImage.style.height="auto";
    Reader.currentImage.style.maxHeight="none";

}

function fitHeight(){

    if(!Reader.currentImage) return;

    Reader.fitMode="height";

    Reader.currentImage.style.width="auto";
    Reader.currentImage.style.height="85vh";
    Reader.currentImage.style.maxWidth="100%";

}

/* ==========================================================
   FULLSCREEN
========================================================== */

async function toggleFullscreen(){

    if(!document.fullscreenElement){

        await document.documentElement.requestFullscreen();

        document.body.classList.add("fullscreen");

    }else{

        await document.exitFullscreen();

        document.body.classList.remove("fullscreen");

    }

}

/* ==========================================================
   BUTTON EVENTS
========================================================== */

document.getElementById("zoomIn")
.addEventListener("click",zoomIn);

document.getElementById("zoomOut")
.addEventListener("click",zoomOut);

document.getElementById("fitWidth")
.addEventListener("click",fitWidth);

document.getElementById("fitHeight")
.addEventListener("click",fitHeight);

document.getElementById("fullscreenButton")
.addEventListener("click",toggleFullscreen);

/* ==========================================================
   MOUSE WHEEL ZOOM
========================================================== */

document.getElementById("imageContainer")
.addEventListener("wheel",(event)=>{

    if(!event.ctrlKey) return;

    event.preventDefault();

    if(event.deltaY<0){

        zoomIn();

    }else{

        zoomOut();

    }

},{passive:false});

/* ==========================================================
   CHAPTER NAVIGATION
========================================================== */

function nextChapter(){

    const next=Reader.chapters.find(ch=>

        ch.comicId===Reader.comic.id &&
        ch.number===Reader.chapter.number+1

    );

    if(!next) return;

    window.location.href=
    `reader-grid.html?id=${Reader.comic.id}&chapter=${next.number}`;

}



function previousChapter(){

    const previous=Reader.chapters.find(ch=>

        ch.comicId===Reader.comic.id &&
        ch.number===Reader.chapter.number-1

    );

    if(!previous) return;

    window.location.href=
    `reader-grid.html?id=${Reader.comic.id}&chapter=${previous.number}`;

}



/* ==========================================================
   AUTO CHAPTER
========================================================== */

function autoNextChapter(){

    if(Reader.page!==Reader.totalPages){

        return;

    }

    nextChapter();

}



/* ==========================================================
   WEBTOON
========================================================== */

function openWebtoon(){

    window.location.href=

    `reader-webtoon.html?id=${Reader.comic.id}&chapter=${Reader.chapter.number}&page=${Reader.page}`;

}



/* ==========================================================
   RESTORE
========================================================== */

function restoreReading(){

    const saved=

    JSON.parse(

        localStorage.getItem("reader-progress")

    );

    if(!saved){

        return;

    }

    if(saved.comic!==Reader.comic.id){

        return;

    }

    if(saved.chapter!==Reader.chapter.number){

        return;

    }

    Reader.page=saved.page;

}



/* ==========================================================
   IMAGE CACHE
========================================================== */

function cacheImage(page){

    if(page<1) return;

    if(page>Reader.totalPages) return;

    if(Reader.imageCache[page]) return;

    const img=new Image();

    img.src=getPageURL(page);

    Reader.imageCache[page]=img;

}



/* ==========================================================
   PRELOAD
========================================================== */

function preloadAround(){

    cacheImage(Reader.page-1);

    cacheImage(Reader.page+1);

    cacheImage(Reader.page+2);

}



/* ==========================================================
   CLICK NAVIGATION
========================================================== */

document
.getElementById("imageContainer")
.addEventListener("click",(event)=>{

    const half=

    window.innerWidth/2;

    if(event.clientX<half){

        previousPage();

    }else{

        nextPage();

    }

});



/* ==========================================================
   BUTTONS
========================================================== */

document
.getElementById("nextChapter")
.onclick=nextChapter;

document
.getElementById("previousChapter")
.onclick=previousChapter;

document
.getElementById("switchWebtoon")
.onclick=openWebtoon;



/* ==========================================================
   UPDATE LOADPAGE
========================================================== */

const originalLoadPage=loadPage;

loadPage=function(page){

    originalLoadPage(page);

    preloadAround();

}



/* ==========================================================
   AUTO NEXT
========================================================== */

document
.getElementById("nextPage")
.addEventListener("click",()=>{

    if(Reader.page===Reader.totalPages){

        autoNextChapter();

    }

});



/* ==========================================================
   START
========================================================== */

restoreReading();



/* ==========================================================
   END
========================================================== */

console.log(

"DarkensHorns Reader Grid Engine Loaded"

);
