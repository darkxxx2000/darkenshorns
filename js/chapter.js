/* =========================================
DARKENSHORNS - SERIES PAGE
========================================= */

document.addEventListener("DOMContentLoaded",loadSeriesPage);

async function loadSeriesPage(){
const params=new URLSearchParams(window.location.search);
const comicId=params.get("id");
const seriesId=params.get("series");

if(!comicId||!seriesId){
    showSeriesError("Comic or series ID not specified.");
    return;
}

try{
    const response=await fetch(`../data/comics/${encodeURIComponent(comicId)}.json`);

    if(!response.ok){
        throw new Error(`Comic not found: ${comicId}`);
    }

    const comic=await response.json();

    const series=Array.isArray(comic.series)
        ? comic.series.find(currentSeries=>currentSeries.id===seriesId)
        : null;

    if(!series){
        throw new Error(`Series not found: ${seriesId}`);
    }

    renderSeriesPage(comic,series);

}catch(error){
    console.error("Error loading series:",error);
    showSeriesError("The requested series could not be found.");
}

}

function renderSeriesPage(comic,series){
const title=document.getElementById("series-title");
const description=document.getElementById("series-description");
const cover=document.getElementById("series-cover-image");
const breadcrumb=document.getElementById("series-breadcrumb");
const comicBreadcrumb=document.getElementById("comic-breadcrumb");
const backButton=document.getElementById("comic-back-button");

if(title){
    title.textContent=series.title||"Untitled Series";
}

if(description){
    description.textContent=series.description||"";
}

if(cover&&series.cover){
    cover.src=normalizeAssetPath(series.cover);
    cover.alt=series.title||"Series Cover";
    cover.onerror=()=>{
        cover.src="../assets/placeholders/cover-placeholder.webp";
    };
}

if(breadcrumb){
    breadcrumb.textContent=series.title||"Series";
}

if(comicBreadcrumb){
    comicBreadcrumb.textContent=comic.title||"Comic";
    comicBreadcrumb.href=`comic.html?id=${encodeURIComponent(comic.id)}`;
}

if(backButton){
    backButton.href=`comic.html?id=${encodeURIComponent(comic.id)}`;
}

renderChapters(comic.id,series);

}

function renderChapters(comicId,series){
const container=document.getElementById("series-chapters-container");

if(!container){
    console.error("series-chapters-container not found.");
    return;
}

container.innerHTML="";

const chapters=Array.isArray(series.chapters)?series.chapters:[];

if(chapters.length===0){
    container.innerHTML="<p>No chapters available yet.</p>";
    return;
}

chapters.forEach((chapter,index)=>{
    const item=createChapterLink(comicId,series.id,chapter,index);
    container.appendChild(item);
});

}

function createChapterLink(comicId,seriesId,chapter,index){
const item=document.createElement("a");
item.className="chapter-item";

const title=document.createElement("span");
title.className="chapter-number";

const subtitle=document.createElement("span");
subtitle.className="chapter-date";

const chapterNumber=chapter?.number??index+1;
const chapterTitle=chapter?.title||`Chapter ${chapterNumber}`;

title.textContent=chapterTitle;

if(chapter?.subtitle){
    subtitle.textContent=chapter.subtitle;
    item.appendChild(subtitle);
}

item.appendChild(title);

const chapterId=chapter?.id||"";
const chapterFile=chapter?.file||"";
const chapterFolder=chapter?.folder||seriesId;

if(chapterId){
    item.href=`chapter.html?id=${encodeURIComponent(comicId)}&series=${encodeURIComponent(seriesId)}&chapter=${encodeURIComponent(chapterId)}&folder=${encodeURIComponent(chapterFolder)}&file=${encodeURIComponent(chapterFile)}`;
}else{
    item.href="#";
    item.addEventListener("click",event=>event.preventDefault());
}

return item;

}

function normalizeAssetPath(path){
if(!path)return "";

if(
    path.startsWith("http://")||
    path.startsWith("https://")||
    path.startsWith("//")||
    path.startsWith("data:")
){
    return path;
}

if(path.startsWith("../"))return path;

return path.startsWith("assets/")
    ?`../${path}`
    :`../${path}`;

}

function showSeriesError(message){
const title=document.getElementById("series-title");
const description=document.getElementById("series-description");
const chapters=document.getElementById("series-chapters-container");

if(title)title.textContent="Series Not Found";
if(description)description.textContent=message;
if(chapters)chapters.innerHTML=`<p>${message}</p>`;

}
