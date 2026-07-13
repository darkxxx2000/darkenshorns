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
