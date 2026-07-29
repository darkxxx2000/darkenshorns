/*************************************************

* DARKENSHORNS
* UI
  *************************************************/

import {
loadComics,
loadSeries
} from "./data-loader.js";

import {
renderComicCards
} from "./cards.js";

/**

* Inicializa la página de inicio.
  */
  export async function initHomePage() {

  try {

  ```
   const latestContainer =
       document.querySelector(
           "#latest-comics"
       );

   const popularContainer =
       document.querySelector(
           "#popular-comics"
       );

   const favoriteContainer =
       document.querySelector(
           "#favorite-comics"
       );

   const featuredSeriesContainer =
       document.querySelector(
           "#featured-series"
       );


   /* -------------------------
      CARGAR CÓMICS
   ------------------------- */

   const comics =
       await loadComics();


   if (
       !Array.isArray(comics)
   ) {
       console.error(
           "Home: loadComics() no devolvió un array."
       );

       return;
   }


   /* -------------------------
      RECENT UPDATES
   ------------------------- */

   const recentComics =
       [...comics]
           .sort(
               (a, b) =>
                   new Date(
                       b.updated || 0
                   ) -
                   new Date(
                       a.updated || 0
                   )
           )
           .slice(
               0,
               8
           );


   if (
       latestContainer
   ) {

       renderComicCards(
           latestContainer,
           recentComics
       );

   }


   /* -------------------------
      POPULAR
   ------------------------- */

   const popularComics =
       [...comics]
           .sort(
               (a, b) =>
                   Number(
                       b.views || 0
                   ) -
                   Number(
                       a.views || 0
                   )
           )
           .slice(
               0,
               8
           );


   if (
       popularContainer
   ) {

       renderComicCards(
           popularContainer,
           popularComics
       );

   }


   /* -------------------------
      FAVORITES
   ------------------------- */

   if (
       favoriteContainer
   ) {

       const favoriteComics =
           comics
               .filter(
                   comic =>
                       comic &&
                       (
                           comic.favorite === true ||
                           comic.favorites === true ||
                           comic.featured === true
                       )
               )
               .slice(
                   0,
                   8
               );


       renderComicCards(
           favoriteContainer,
           favoriteComics
       );

   }


   /* -------------------------
      SERIES
   ------------------------- */

   const series =
       await loadSeries();


   if (
       featuredSeriesContainer &&
       Array.isArray(series)
   ) {

       renderComicCards(
           featuredSeriesContainer,
           series.slice(
               0,
               6
           )
       );

   }
  ```

  } catch (error) {

  ```
   console.error(
       "DarkensHorns Home error:",
       error
   );
  ```

  }

}

/**

* Detecta automáticamente
* la página actual.
  */
  export function detectCurrentPage() {

  const path =
  window.location.pathname
  .toLowerCase();

  if (
  path.endsWith("/") ||
  path.endsWith("index.html")
  ) {

  ```
   return "home";
  ```

  }

  if (
  path.includes("series")
  ) {

  ```
   return "series";
  ```

  }

  if (
  path.includes("comic")
  ) {

  ```
   return "comic";
  ```

  }

  if (
  path.includes("chapter")
  ) {

  ```
   return "chapter";
  ```

  }

  if (
  path.includes("gallery")
  ) {

  ```
   return "gallery";
  ```

  }

  if (
  path.includes("search")
  ) {

  ```
   return "search";
  ```

  }

  return "unknown";

}
