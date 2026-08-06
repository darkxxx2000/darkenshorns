document.addEventListener(
    "DOMContentLoaded",
    loadGallery
);

async function loadGallery(){

const params =
new URLSearchParams(
window.location.search
);

const id =
params.get("id");

if(!id)return;

const response =
await fetch(
`../data/gallery/${id}.json`
);

const gallery =
await response.json();

document.getElementById(
"gallery-title"
).textContent =
gallery.title;

document.getElementById(
"gallery-description"
).textContent =
gallery.description || "";

renderImages(
gallery.images || []
);

setupViewer();

}

function renderImages(images){

const container =
document.getElementById(
"preview-container"
);

container.innerHTML="";

images.forEach((src,index)=>{

const img =
document.createElement("img");

img.src =
normalize(src);

img.loading="lazy";

img.addEventListener("click",()=>{

openViewer(
images,
index
);

});

container.appendChild(img);

});

}

let galleryImages=[];
let current=0;

function setupViewer(){

document
.getElementById("viewer-close")
.onclick=closeViewer;

}

function openViewer(images,index){

galleryImages=images;
current=index;

const viewer=
document.getElementById("image-viewer");

viewer.classList.add("active");

updateViewer();

}

function updateViewer(){

document.getElementById(
"viewer-image"
).src=
normalize(
galleryImages[current]
);

}

function closeViewer(){

document
.getElementById("image-viewer")
.classList.remove("active");

}

function normalize(path){

if(
path.startsWith("http")
)return path;

return "../"+path;

}
