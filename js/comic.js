/* =========================================
DARKENSHORNS - COMIC PAGE
========================================= */


document.addEventListener(
"DOMContentLoaded",
loadComicPage
);


/* =========================================
SAFE TEXT
========================================= */

function getText(
value
) {

    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value.trim();

    }


    return "";

}



/* =========================================
LOAD COMIC
========================================= */

async function loadComicPage() {


const params =
    new URLSearchParams(
        window.location.search
    );


const comicId =
    params.get("id");



if (!comicId) {


    showComicError(
        "No comic ID specified."
    );


    return;


}



try {


    const response =
        await fetch(
            `../data/comics/${encodeURIComponent(comicId)}.json`
        );



    if (!response.ok) {


        throw new Error(
            `Comic not found: ${comicId}`
        );


    }



    const comic =
        await response.json();



    renderComicBanner(
        comic
    );



    renderBreadcrumb(
        comic
    );



    renderSeries(
        comicId,
        comic
    );



}
catch(error) {


    console.error(
        "Error loading comic:",
        error
    );



    showComicError(
        `Comic "${comicId}" could not be found.`
    );


}


}



/* =========================================
RENDER COMIC BANNER
========================================= */

function renderComicBanner(
comic
) {


const banner =
    document.getElementById(
        "comic-banner-image"
    );



if (!banner) {


    return;


}



const bannerSource =
    comic.banner ||
    comic.cover ||
    "";



if (!bannerSource) {


    banner.src =
        "../assets/placeholders/banner-placeholder.webp";


    banner.alt =
        getText(
            comic.title
        ) || "Comic Banner";


    return;


}



banner.src =
    normalizeAssetPath(
        bannerSource
    );



banner.alt =
    getText(
        comic.title
    ) || "Comic Banner";



banner.onerror =
function() {


    banner.onerror =
        null;



    banner.src =
        "../assets/placeholders/banner-placeholder.webp";


};


}



/* =========================================
BREADCRUMB
========================================= */

function renderBreadcrumb(
comic
) {


const breadcrumb =
    document.getElementById(
        "breadcrumb-title"
    );



if (!breadcrumb) {


    return;


}



breadcrumb.textContent =
    getText(
        comic.title
    ) || "Comic";


}



/* =========================================
RENDER SERIES
========================================= */

function renderSeries(
comicId,
comic
) {


const container =
    document.getElementById(
        "series-container"
    );



if (!container) {


    return;


}



container.innerHTML =
    "";



const series =
    Array.isArray(
        comic.series
    )
    ? comic.series
    : [];





if (
    series.length === 0
) {


    container.innerHTML =
        "<p>No series available yet.</p>";


    return;


}





series.forEach(
currentSeries => {


    const card =
        createSeriesCard(
            comicId,
            currentSeries
        );



    container.appendChild(
        card
    );


});


}





/* =========================================
CREATE SERIES CARD
========================================= */

function createSeriesCard(
comicId,
series
) {



const link =
    document.createElement(
        "a"
    );



link.className =
    "comic-card series-card";



link.href =
    `series.html?id=${encodeURIComponent(
        comicId
    )}&series=${encodeURIComponent(
        series.id
    )}`;





const cover =
    document.createElement(
        "img"
    );



cover.className =
    "comic-card-cover";



cover.src =
    normalizeAssetPath(
        series.cover
    );



cover.alt =
    getText(
        series.title
    ) || "Series Cover";



cover.loading =
    "lazy";



cover.addEventListener(
"error",
function() {


    cover.src =
        "../assets/placeholders/cover-placeholder.webp";


});





const content =
    document.createElement(
        "div"
    );



content.className =
    "comic-card-content";





const title =
    document.createElement(
        "h3"
    );



title.className =
    "comic-card-title";



const seriesTitle =
    getText(
        series.title
    );



if (
    seriesTitle
) {


    title.textContent =
        seriesTitle;


    content.appendChild(
        title
    );


}





const descriptionText =
    getText(
        series.description
    );



if (
    descriptionText
) {


    const description =
        document.createElement(
            "p"
        );


    description.className =
        "comic-card-description";


    description.textContent =
        descriptionText;



    content.appendChild(
        description
    );


}





const chapters =
    Array.isArray(
        series.chapters
    )
    ? series.chapters
    : [];




const chapterCount =
    document.createElement(
        "span"
    );



chapterCount.className =
    "comic-card-meta";



chapterCount.textContent =
    `${chapters.length} ${
        chapters.length === 1
        ? "Chapter"
        : "Chapters"
    }`;



content.appendChild(
    chapterCount
);





link.appendChild(
    cover
);



link.appendChild(
    content
);



return link;



}





/* =========================================
ERROR
========================================= */

function showComicError(
message
) {



const breadcrumb =
    document.getElementById(
        "breadcrumb-title"
    );



if (breadcrumb) {


    breadcrumb.textContent =
        "Error";


}




const banner =
    document.getElementById(
        "comic-banner-image"
    );



if (banner) {


    banner.src =
        "../assets/placeholders/banner-placeholder.webp";


}




const seriesContainer =
    document.getElementById(
        "series-container"
    );



if (seriesContainer) {


    seriesContainer.innerHTML =
        `<p>${message}</p>`;


}



}





/* =========================================
NORMALIZE ASSET PATH
========================================= */

function normalizeAssetPath(
path
) {



if (!path) {


    return "";


}



if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//") ||
    path.startsWith("data:")
) {


    return path;


}



if (
    path.startsWith("../")
) {


    return path;


}



return `../${path}`;



}
