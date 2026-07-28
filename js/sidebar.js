/*************************************************

* DARKENSHORNS
* SIDEBAR
  *************************************************/

import {
loadComics,
loadCharacters,
loadSeries,
loadGenres
} from "./data-loader.js";

/**

* Detecta la ruta correcta hacia las páginas.
  */
  function getPagesPath() {

  return window.location.pathname.includes("/pages/")
  ? ""
  : "pages/";

}

/**

* Renderiza Recent Updates.
  */
  function renderRecentUpdates(comics = []) {

  const container =
  document.querySelector("#recent-list");

  if (!container) return;

  container.innerHTML = "";

  const recent =
  [...comics]
  .sort((a, b) =>
  new Date(b.updated || 0) -
  new Date(a.updated || 0)
  )
  .slice(0, 10);

  recent.forEach(comic => {

  ```
   if (!comic || !comic.id) return;

   const item =
       document.createElement("li");

   const link =
       document.createElement("a");

   link.href =
       getPagesPath() +
       "comic.html?id=" +
       encodeURIComponent(comic.id);

   link.textContent =
       comic.title || "Untitled";

   item.appendChild(link);

   container.appendChild(item);
  ```

  });

}

/**

* Renderiza géneros.
  */
  function renderGenres(genres = []) {

  const container =
  document.querySelector("#categories-list");

  if (!container) return;

  container.innerHTML = "";

  genres.forEach(genre => {

  ```
   const id =
       typeof genre === "object"
           ? genre.id
           : genre;

   const name =
       typeof genre === "object"
           ? genre.name
           : genre;

   if (!id || !name) return;

   const item =
       document.createElement("li");

   const link =
       document.createElement("a");

   link.href =
       getPagesPath() +
       "series.html?genre=" +
       encodeURIComponent(id);

   link.textContent =
       name;

   item.appendChild(link);

   container.appendChild(item);
  ```

  });

}

/**

* Renderiza series.
  */
  function renderSeries(series = []) {

  const container =
  document.querySelector("#series-list");

  if (!container) return;

  container.innerHTML = "";

  series.forEach(serie => {

  ```
   const id =
       typeof serie === "object"
           ? serie.id
           : serie;

   const name =
       typeof serie === "object"
           ? serie.title || serie.name
           : serie;

   if (!id || !name) return;

   const item =
       document.createElement("li");

   const link =
       document.createElement("a");

   link.href =
       getPagesPath() +
       "series.html?id=" +
       encodeURIComponent(id);

   link.textContent =
       name;

   item.appendChild(link);

   container.appendChild(item);
  ```

  });

}

/**

* Renderiza personajes.
  */
  function renderCharacters(characters = []) {

  const container =
  document.querySelector("#characters-list");

  if (!container) return;

  container.innerHTML = "";

  characters.forEach(character => {

  ```
   if (!character || !character.name) return;

   const item =
       document.createElement("div");

   item.className =
       "character-item";

   const link =
       document.createElement("a");

   link.href =
       getPagesPath() +
       "characters.html?id=" +
       encodeURIComponent(
           character.id || character.name
       );

   link.className =
       "character-link";


   const avatar =
       document.createElement("div");

   avatar.className =
       "character-avatar";


   const image =
       document.createElement("img");

   image.src =
       character.image ||
       "assets/placeholders/avatar.webp";

   image.alt =
       character.name;


   avatar.appendChild(
       image
   );


   const info =
       document.createElement("div");

   info.className =
       "character-info";


   const name =
       document.createElement("span");

   name.className =
       "character-name";

   name.textContent =
       character.name;


   const series =
       document.createElement("span");

   series.className =
       "character-series";

   series.textContent =
       character.series || "";


   info.appendChild(
       name
   );

   info.appendChild(
       series
   );


   link.appendChild(
       avatar
   );

   link.appendChild(
       info
   );


   item.appendChild(
       link
   );

   container.appendChild(
       item
   );
  ```

  });

}

/**

* Inicializa sidebar.
  */
  export async function initSidebar() {

  try {

  ```
   const comics =
       await loadComics();

   const characters =
       await loadCharacters();

   const series =
       await loadSeries();

   const genres =
       await loadGenres();


   renderRecentUpdates(
       comics
   );

   renderCharacters(
       characters
   );

   renderSeries(
       series
   );

   renderGenres(
       genres
   );
  ```

  } catch (error) {

  ```
   console.error(
       "DarkensHorns sidebar error:",
       error
   );
  ```

  }

}
