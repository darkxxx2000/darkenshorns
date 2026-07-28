/*************************************************

* DARKENSHORNS
* UI
  *************************************************/

import {
loadComics
} from "./data-loader.js";

import {
renderComicCards
} from "./cards.js";

/**

* Inicializa la página de inicio.
  */
  export async function initHomePage() {

  const latestContainer =
  document.querySelector("#latest-comics");

  const popularContainer =
  document.querySelector("#popular-comics");

  /* -------------------------
  CARGAR CÓMICS
  ------------------------- */

  const comics = await loadComics();

  if (!Array.isArray(comics)) {

  ```
   console.error(
       "DarkensHorns: loadComics() no devolvió un array."
   );

   return;
  ```

  }

  /* -------------------------
  LATEST UPDATES
  ------------------------- */

  if (latestContainer) {

  ```
   const latest = [...comics]
       .sort(function (a, b) {

           return (
               new Date(b.updated || 0) -
               new Date(a.updated || 0)
           );

       })
       .slice(0, 8);


   renderComicCards(
       latestContainer,
       latest
   );
  ```

  }

  /* -------------------------
  POPULAR
  ------------------------- */

  if (popularContainer) {

  ```
   const popular = [...comics]
       .sort(function (a, b) {

           return (
               (b.views || 0) -
               (a.views || 0)
           );

       })
       .slice(0, 8);


   renderComicCards(
       popularContainer,
       popular
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
  window.location.pathname.toLowerCase();

  if (
  path.endsWith("/") ||
  path.endsWith("index.html")
  ) {

  ```
   return "home";
  ```

  }

  if (path.includes("series")) {

  ```
   return "series";
  ```

  }

  if (path.includes("comic")) {

  ```
   return "comic";
  ```

  }

  if (path.includes("chapter")) {

  ```
   return "chapter";
  ```

  }

  if (path.includes("gallery")) {

  ```
   return "gallery";
  ```

  }

  if (path.includes("search")) {

  ```
   return "search";
  ```

  }

  return "unknown";

}
