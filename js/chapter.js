/* =========================================
DARKENSHORNS - CHAPTER READER
========================================= */

document.addEventListener("DOMContentLoaded",loadChapterPage);

async function loadChapterPage(){
const params=new URLSearchParams(window.location.search);
const comicId=params.get("id");
const seriesId=params.get("series");
const chapterId=params.get("chapter");
const folder=params.get("folder");
const file=params.get("file");

if(!comicId||!seriesId||!chapterId){
showChapterError("Comic, series or chapter ID not specified.");
return;
}

try{
const comicResponse=await fetch(../data/comics/${encodeURIComponent(comicId)}.json);

if(!comicResponse.ok){
    throw new Error(`Comic not found: ${comicId}`);
}

const comic=await comicResponse.json();

const series=Array.isArray(comic.series)
    ?comic.series.find(item=>item.id===seriesId)
    :null;

if(!series){
    throw new Error(`Series not found: ${seriesId}`);
}

const chapter=Array.isArray(series.chapters)
    ?series.chapters.find(item=>item.id===chapterId)
    :null;

if(!chapter){
    throw new Error(`Chapter not found: ${chapterId}`);
}

const chapterFolder=folder||chapter.folder||seriesId;
const chapterFile=file||chapter.file;

if(!chapterFile){
    throw new Error("Chapter JSON file not specified.");
}

const chapterPath=
    `../data/chapters/${encodeURIComponent(comicId)}/${encodeURIComponent(chapterFolder)}/${encodeURIComponent(chapterFile)}`;

const chapterResponse=await fetch(chapterPath);

if(!chapterResponse.ok){
    throw new Error(`Chapter file not found: ${chapterPath}`);
}

const chapterData=await chapterResponse.json();

renderChapterPage(
    comic,
    series,
    chapter,
    chapterData
);

}catch(error){
console.error("Error loading chapter:",error);
showChapterError("The requested chapter could not be loaded.");
}
}

function renderChapterPage(comic,series,chapter,chapterData){
const title=document.getElementById("chapter-title");
const subtitle=document.getElementById("chapter-subtitle");
const date=document.getElementById("chapter-date");
const breadcrumb=document.getElementById("breadcrumb-title");
const container=document.getElementById("preview-container");

if(title){
title.textContent=
chapterData.title||
chapter.title||
"Untitled Chapter";
}

if(subtitle){
subtitle.textContent=
chapterData.subtitle||
chapter.subtitle||
"";
}

if(date){
date.textContent=
chapterData.date||
"";
}

if(breadcrumb){
breadcrumb.textContent=
${series.title||"Series"} / ${chapterData.title||chapter.title||"Chapter"};
}

if(!container){
console.error("preview-container not found.");
return;
}

const pages=
Array.isArray(chapterData.pages)
?chapterData.pages
:[];

renderPages(pages);
initReaderControls();
initImageViewer(pages);
}

function renderPages(pages){
const container=document.getElementById("preview-container");

if(!container)return;

container.innerHTML="";

if(pages.length===0){
container.innerHTML="<p>No pages available for this chapter.</p>";
return;
}

pages.forEach((page,index)=>{
if(!page)return;

const image=document.createElement("img");

image.src=page;
image.alt=`Page ${index+1}`;
image.loading=index===0?"eager":"lazy";
image.decoding="async";
image.dataset.index=index;

image.addEventListener("error",()=>{
    image.style.display="none";
});

container.appendChild(image);

});
}

function initReaderControls(){
const container=document.getElementById("preview-container");
const normalButton=document.getElementById("normal-mode-button");
const webtoonButton=document.getElementById("webtoon-mode-button");

if(!container)return;

if(normalButton){
normalButton.addEventListener("click",()=>{
container.classList.remove("webtoon-mode");
normalButton.classList.add("active");
if(webtoonButton)webtoonButton.classList.remove("active");
});
}

if(webtoonButton){
webtoonButton.addEventListener("click",()=>{
container.classList.add("webtoon-mode");
webtoonButton.classList.add("active");
if(normalButton)normalButton.classList.remove("active");
});
}
}

function initImageViewer(pages){
const container=document.getElementById("preview-container");
const viewer=document.getElementById("image-viewer");
const viewerImage=document.getElementById("viewer-image");
const closeButton=document.getElementById("viewer-close");

if(!container||!viewer||!viewerImage)return;

let currentIndex=0;
let zoom=1;

function openViewer(index){
if(!pages[index])return;

currentIndex=index;
zoom=1;

viewerImage.src=pages[currentIndex];
viewerImage.style.transform=`scale(${zoom})`;

viewer.classList.add("active");
document.body.style.overflow="hidden";

}

function closeViewer(){
viewer.classList.remove("active");
document.body.style.overflow="";
viewerImage.src="";
zoom=1;
}

function showNext(){
if(currentIndex<pages.length-1){
openViewer(currentIndex+1);
}
}

function showPrevious(){
if(currentIndex>0){
openViewer(currentIndex-1);
}
}

container.querySelectorAll("img").forEach(image=>{
image.addEventListener("click",()=>{
const index=parseInt(image.dataset.index,10);

    if(!Number.isNaN(index)){
        openViewer(index);
    }
});

});

if(closeButton){
closeButton.addEventListener("click",closeViewer);
}

viewer.addEventListener("click",event=>{
if(event.target===viewer){
closeViewer();
}
});

viewerImage.addEventListener("click",event=>{
event.stopPropagation();
showNext();
});

viewer.addEventListener("wheel",event=>{
event.preventDefault();

zoom+=event.deltaY<0?0.1:-0.1;
zoom=Math.min(Math.max(zoom,0.5),4);

viewerImage.style.transform=`scale(${zoom})`;

},{passive});

document.addEventListener("keydown",event=>{
if(!viewer.classList.contains("active"))return;

if(event.key==="Escape"){
    closeViewer();
}

if(event.key==="ArrowRight"){
    showNext();
}

if(event.key==="ArrowLeft"){
    showPrevious();
}

});
}

function showChapterError(message){
const title=document.getElementById("chapter-title");
const subtitle=document.getElementById("chapter-subtitle");
const container=document.getElementById("preview-container");

if(title){
title.textContent="Chapter Not Found";
}

if(subtitle){
subtitle.textContent=message;
}

if(container){
container.innerHTML=<p>${message}</p>;
}
}
