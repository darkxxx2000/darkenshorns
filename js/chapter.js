document.addEventListener("DOMContentLoaded",loadChapterPage);

async function loadChapterPage(){
const params=new URLSearchParams(window.location.search);
const comicId=params.get("id");
const seriesId=params.get("series");
const chapterId=params.get("chapter");

if(!comicId||!seriesId||!chapterId){
showChapterError("Comic, series or chapter ID not specified.");
return;
}

try{
const comicResponse=await fetch(`../data/comics/${encodeURIComponent(comicId)}.json`);

if(!comicResponse.ok){
throw new Error(`Comic not found: ${comicId}`);
}

const comic=await comicResponse.json();

const series = {
    id: comic.id,
    title: comic.series || comic.title,
    chapters: comic.chapters || []
};


const chapter = series.chapters.find(
    item => String(item.id) === String(chapterId)
);

if(!chapter){
    throw new Error(`Chapter not found: ${chapterId}`);
}

if(!chapter){
throw new Error(`Chapter not found: ${chapterId}`);
}

const file=chapter.file||`${chapterId}.json`;
const chapterFolder=chapter.folder||chapter.path||"AI-Story";

const chapterPath =
`../data/chapters/${encodeURIComponent(comicId)}/${encodeURIComponent(file)}`;

console.log("Loading chapter JSON:",chapterPath);

const chapterResponse=await fetch(chapterPath);

if(!chapterResponse.ok){
throw new Error(`Chapter file not found: ${chapterPath}`);
}

const chapterData=await chapterResponse.json();

renderChapterPage(comic,series,chapter,chapterData);

}catch(error){
console.error("Error loading chapter:",error);
showChapterError("The requested chapter could not be loaded.");
}
}

function renderChapterPage(comic,series,chapter,chapterData){
const comicName=document.getElementById("comic-name");
const chapterName=document.getElementById("chapter-name");
const chapterTitle=document.getElementById("chapter-title");
const comicLink=document.getElementById("comic-link");
const chapterPages=document.getElementById("chapter-pages");
const chapterDate=document.getElementById("chapter-date");

const title=chapterData.title||chapter.title||"Untitled Chapter";
const subtitle=chapterData.subtitle||chapter.subtitle||"";
const pages=Array.isArray(chapterData.pages)?chapterData.pages:[];

if(comicName){
comicName.textContent=comic.title||"Comic";
}

if(chapterName){
chapterName.textContent=subtitle?`${title} - ${subtitle}`:title;
}

if(chapterTitle){
chapterTitle.textContent=title;
}

if(comicLink){
comicLink.textContent=comic.title||"Comic";
comicLink.href=`comic.html?id=${encodeURIComponent(comic.id)}`;
}

if(chapterPages){
chapterPages.textContent=`Pages: ${pages.length}`;
}

if(chapterDate){
chapterDate.textContent=`Date: ${chapterData.date||chapter.date||"-"}`;
}

if(pages.length===0){
showChapterError("This chapter has no pages.");
return;
}

renderChapterPages(pages);
setupReaderControls();
setupImageViewer(pages);
}

function renderChapterPages(pages){
const container=document.getElementById("preview-container");

if(!container){
console.error("preview-container not found.");
return;
}

container.innerHTML="";

pages.forEach((pageUrl,index)=>{
if(!pageUrl)return;

const image=document.createElement("img");

image.src=normalizeAssetPath(pageUrl);
image.alt=`Page ${index+1}`;
image.loading=index===0?"eager":"lazy";
image.decoding="async";
image.dataset.pageIndex=index;

image.addEventListener("click",()=>{
openImageViewer(pages,index);
});

image.addEventListener("error",()=>{
console.error("Failed to load page:",pageUrl);
});

container.appendChild(image);
});
}

function setupReaderControls(){
const normalButton=document.getElementById("grid-reader");
const webtoonButton=document.getElementById("webtoon-reader");
const container=document.getElementById("preview-container");

if(!container)return;

if(normalButton){
normalButton.addEventListener("click",()=>{
container.classList.remove("webtoon-mode");
container.classList.add("preview-grid");
normalButton.classList.add("active");

if(webtoonButton){
webtoonButton.classList.remove("active");
}
});
}

if(webtoonButton){
webtoonButton.addEventListener("click",()=>{
container.classList.remove("preview-grid");
container.classList.add("webtoon-mode");
webtoonButton.classList.add("active");

if(normalButton){
normalButton.classList.remove("active");
}
});
}
}

let viewerPages=[];
let viewerIndex=0;
let viewerScale=1;
let viewerInitialized=false;

function setupImageViewer(pages){
viewerPages=pages;

const viewer=document.getElementById("image-viewer");
const image=document.getElementById("viewer-image");
const closeButton=document.getElementById("viewer-close");
const previousButton=document.getElementById("viewer-prev");
const nextButton=document.getElementById("viewer-next");

if(!viewer||!image)return;

if(viewerInitialized)return;

viewerInitialized=true;

if(closeButton){
closeButton.addEventListener("click",closeImageViewer);
}

if(previousButton){
previousButton.addEventListener("click",event=>{
event.stopPropagation();
previousViewerImage();
});
}

if(nextButton){
nextButton.addEventListener("click",event=>{
event.stopPropagation();
nextViewerImage();
});
}

viewer.addEventListener("click",event=>{
if(event.target===viewer){
closeImageViewer();
}
});

image.addEventListener("click",event=>{
event.stopPropagation();

if(viewerScale<=1){
nextViewerImage();
}
});

image.addEventListener("wheel",event=>{
event.preventDefault();

if(event.deltaY<0){
viewerScale+=0.15;
}else{
viewerScale-=0.15;
}

viewerScale=Math.max(1,Math.min(viewerScale,5));
image.style.transform=`scale(${viewerScale})`;
},{passive:false});

document.addEventListener("keydown",event=>{
if(!viewer.classList.contains("active"))return;

if(event.key==="Escape"){
closeImageViewer();
}

if(event.key==="ArrowRight"){
nextViewerImage();
}

if(event.key==="ArrowLeft"){
previousViewerImage();
}
});
}

function openImageViewer(pages,index){
const viewer=document.getElementById("image-viewer");
const image=document.getElementById("viewer-image");

if(!viewer||!image)return;

viewerPages=pages;
viewerIndex=index;
viewerScale=1;

image.style.transform="scale(1)";
image.src=normalizeAssetPath(viewerPages[viewerIndex]);
image.alt=`Page ${viewerIndex+1}`;

viewer.classList.add("active");
document.body.style.overflow="hidden";
}

function closeImageViewer(){
const viewer=document.getElementById("image-viewer");
const image=document.getElementById("viewer-image");

if(!viewer)return;

viewer.classList.remove("active");
document.body.style.overflow="";
viewerScale=1;

if(image){
image.style.transform="scale(1)";
}
}

function nextViewerImage(){
if(viewerPages.length===0)return;

if(viewerIndex<viewerPages.length-1){
viewerIndex++;
updateViewerImage();
}
}

function previousViewerImage(){
if(viewerPages.length===0)return;

if(viewerIndex>0){
viewerIndex--;
updateViewerImage();
}
}

function updateViewerImage(){
const image=document.getElementById("viewer-image");

if(!image)return;

viewerScale=1;
image.style.transform="scale(1)";
image.src=normalizeAssetPath(viewerPages[viewerIndex]);
image.alt=`Page ${viewerIndex+1}`;
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

if(path.startsWith("../")){
return path;
}

if(path.startsWith("assets/")){
return `../${path}`;
}

return `../${path}`;
}

function showChapterError(message){
const chapterTitle=document.getElementById("chapter-title");
const chapterName=document.getElementById("chapter-name");
const comicName=document.getElementById("comic-name");
const container=document.getElementById("preview-container");

if(comicName){
comicName.textContent="DarkensHorns";
}

if(chapterTitle){
chapterTitle.textContent="Chapter Not Found";
}

if(chapterName){
chapterName.textContent=message;
}

if(container){
container.innerHTML=`<p>${message}</p>`;
}
}
