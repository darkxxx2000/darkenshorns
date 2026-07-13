document.addEventListener("DOMContentLoaded", async () => {

    const comicId = getComicId();

    if (!comicId) {
        showError("Comic not found");
        return;
    }

    const comics = await loadData("../data/comics.json");

    if (!comics) {
        showError("Unable to load comics");
        return;
    }

    const comic = comics.find(item =>
        item.id === comicId ||
        item.slug === comicId
    );

    if (!comic) {
        showError("Comic does not exist");
        return;
    }


    loadComicInfo(comic);

    loadChapters(comic.id);

    loadRelated(comic, comics);

    loadFavorite(comic.id);

    setupShare(comic);

});



function getComicId(){

    const params = new URLSearchParams(window.location.search);

    return params.get("id");

}




async function loadData(path){

    try{

        const response = await fetch(path);

        return await response.json();

    }catch(error){

        console.error(error);

        return null;

    }

}





function loadComicInfo(comic){


    document.title =
    `${comic.title} | DarkensHorns`;



    document
    .getElementById("breadcrumb-title")
    .textContent = comic.title;



    document
    .getElementById("comic-title")
    .textContent = comic.title;



    document
    .getElementById("comic-description")
    .textContent = comic.description;



    document
    .getElementById("comic-author")
    .textContent = comic.author;



    document
    .getElementById("comic-status")
    .textContent = comic.status;



    document
    .getElementById("comic-updated")
    .textContent = comic.updated;



    document
    .getElementById("comic-chapters")
    .textContent = comic.chapters;



    document
    .getElementById("comic-cover-image")
    .src = "../" + comic.cover;



    document
    .getElementById("comic-banner-image")
    .src = "../" + comic.banner;



    const genres =
    document.getElementById("comic-genres");


    comic.genres.forEach(item=>{

        genres.innerHTML +=
        `<span class="tag">${item}</span>`;

    });



    const tags =
    document.getElementById("comic-tags");


    comic.tags.forEach(item=>{

        tags.innerHTML +=
        `<span class="tag">${item}</span>`;

    });



    const firstButton =
    document.getElementById("first-chapter-button");


    firstButton.href =
    `chapter.html?id=${comic.id}&chapter=1`;

}





async function loadChapters(comicId){


    const chapters =
    await loadData("../data/chapters.json");


    if(!chapters) return;



    const container =
    document.getElementById("chapters-container");



    const comicChapters =
    chapters.filter(chapter =>
        chapter.comicId === comicId
    );



    if(comicChapters.length === 0){

        container.innerHTML =
        "<p>No chapters available.</p>";

        return;

    }




    comicChapters.forEach(chapter=>{


        const item =
        document.createElement("a");


        item.className =
        "chapter-item";


        item.href =
        `chapter.html?id=${comicId}&chapter=${chapter.number}`;



        item.innerHTML = `

            <span class="chapter-number">
                Chapter ${chapter.number}
            </span>

            <span class="chapter-date">
                ${chapter.releaseDate || ""}
            </span>

        `;


        container.appendChild(item);


    });


}





function loadRelated(comic, comics){


    const container =
    document.getElementById("related-container");


    const related =
    comics.filter(item =>
        item.id !== comic.id &&
        item.genres.some(
            genre =>
            comic.genres.includes(genre)
        )
    ).slice(0,4);



    related.forEach(item=>{


        container.innerHTML += `

        <a class="comic-card"
        href="comic.html?id=${item.id}">

            <img src="../${item.cover}">

            <h3>
            ${item.title}
            </h3>

        </a>

        `;


    });


}





function loadFavorite(id){


    const button =
    document.getElementById("favorite-button");


    let favorites =
    JSON.parse(
        localStorage.getItem("favorites")
    ) || [];



    if(favorites.includes(id)){

        button.textContent =
        "♥ Favorite";

    }



    button.addEventListener("click",()=>{


        if(favorites.includes(id)){


            favorites =
            favorites.filter(
                item=>item!==id
            );


            button.textContent =
            "♡ Favorite";


        }else{


            favorites.push(id);


            button.textContent =
            "♥ Favorite";


        }



        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );


    });


}





function setupShare(comic){


    const button =
    document.getElementById("share-button");



    button.addEventListener("click",()=>{


        navigator.share({

            title:comic.title,

            url:window.location.href

        }).catch(()=>{});


    });


}




function showError(message){


    const main =
    document.querySelector(".comic-page");


    main.innerHTML =
    `<h1>${message}</h1>`;


}
