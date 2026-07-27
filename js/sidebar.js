/*************************************************

* DARKENSHORNS
* SIDEBAR
  *************************************************/

import {
loadComics,
loadCharacters
} from "./data-loader.js";

/* ==========================================================
PAGE URL
========================================================== */

/**

* Detecta automáticamente la ruta hacia comic.html.
*
* Desde Home:
* pages/comic.html
*
* Desde /pages/:
* comic.html
  */
  function getComicPageUrl() {

  const isInsidePages =
  window.location.pathname.includes("/pages/");

  return isInsidePages
  ? "comic.html"
  : "pages/comic.html";

}

/* ==========================================================
SERIES PAGE URL
========================================================== */

/**

* Detecta automáticamente la ruta hacia series.html.
  */
  function getSeriesPageUrl() {

  const isInsidePages =
  window.location.pathname.includes("/pages/");

  return isInsidePages
  ? "series.html"
  : "pages/series.html";

}

/* ==========================================================
SLUG
========================================================== */

/**

* Convierte un nombre en un identificador.
*
* Ejemplo:
*
* Ryuko Matoi
*
* →
*
* ryuko-matoi
  */
  function createSlug(
  value
  ) {

  if (!value) {

  ```
   return "";
  ```

  }

  return String(value)

  ```
   .toLowerCase()

   .trim()

   .normalize("NFD")

   .replace(
       /[\u0300-\u036f]/g,
       ""
   )

   .replace(
       /[^a-z0-9]+/g,
       "-"
   )

   .replace(
       /^-+|-+$/g,
       "");
  ```

}

/* ==========================================================
RECENT UPDATES
========================================================== */

/**

* Renderiza las actualizaciones recientes.
  */
  function renderRecentUpdates(
  comics = []
  ) {

  const container =
  document.querySelector(
  "#recent-list"
  );

  if (!container) {

  ```
   return;
  ```

  }

  container.innerHTML =
  "";

  const recent =
  [...comics]

  ```
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
           5
       );
  ```

  if (
  recent.length === 0
  ) {

  ```
   container.innerHTML = `

       <li>
           No recent updates.
       </li>

   `;

   return;
  ```

  }

  recent.forEach(
  comic => {

  ```
       const item =
           document.createElement(
               "li"
           );


       const comicId =
           comic.id || "";


       const comicTitle =
           comic.title ||
           "Untitled";


       item.innerHTML = `

           <a
               href="${getComicPageUrl()}?id=${encodeURIComponent(comicId)}"
           >

               ${comicTitle}

           </a>

       `;


       container.appendChild(
           item
       );

   }
  ```

  );

}

/* ==========================================================
GENRES
========================================================== */

/**

* Obtiene todos los géneros directamente
* desde los cómics cargados.
*
* No necesita genres.json.
  */
  function renderGenres(
  comics = []
  ) {

  const container =
  document.querySelector(
  "#categories-list"
  );

  if (!container) {

  ```
   return;
  ```

  }

  container.innerHTML =
  "";

  const genres =
  new Map();

  comics.forEach(
  comic => {

  ```
       if (
           !Array.isArray(
               comic.genres
           )
       ) {

           return;

       }


       comic.genres.forEach(
           genre => {

               if (
                   !genre
               ) {

                   return;

               }


               const name =
                   String(
                       genre
                   ).trim();


               const slug =
                   createSlug(
                       name
                   );


               if (
                   slug &&
                   !genres.has(
                       slug
                   )
               ) {

                   genres.set(
                       slug,
                       name
                   );

               }

           }
       );

   }
  ```

  );

  if (
  genres.size === 0
  ) {

  ```
   container.innerHTML = `

       <li>
           No genres available.
       </li>

   `;

   return;
  ```

  }

  genres.forEach(
  (
  name,
  slug
  ) => {

  ```
       const item =
           document.createElement(
               "li"
           );


       item.innerHTML = `

           <a
               href="${getSeriesPageUrl()}?genre=${encodeURIComponent(slug)}"
           >

               ${name}

           </a>

       `;


       container.appendChild(
           item
       );

   }
  ```

  );

}

/* ==========================================================
CHARACTERS
========================================================== */

/**

* Renderiza personajes.
*
* Los personajes se obtienen
* desde characters.json.
  */
  function renderCharacters(
  characters = []
  ) {

  const container =
  document.querySelector(
  "#characters-list"
  );

  if (!container) {

  ```
   return;
  ```

  }

  container.innerHTML =
  "";

  if (
  !Array.isArray(
  characters
  ) ||
  characters.length === 0
  ) {

  ```
   container.innerHTML = `

       <p>
           No characters available.
       </p>

   `;

   return;
  ```

  }

  characters

  ```
   .slice(
       0,
       10
   )

   .forEach(
       character => {

           let id = "";
           let name = "";
           let image = "";
           let series = "";


           /*
           PERSONAJE COMO STRING
           */

           if (
               typeof character ===
               "string"
           ) {

               name =
                   character;

               id =
                   createSlug(
                       character
                   );

           }


           /*
           PERSONAJE COMO OBJETO
           */

           else if (
               character &&
               typeof character ===
               "object"
           ) {

               name =
                   character.name ||
                   character.title ||
                   character.id ||
                   "Unknown Character";


               id =
                   character.id ||
                   character.slug ||
                   createSlug(
                       name
                   );


               image =
                   character.image ||
                   character.avatar ||
                   "";


               series =
                   character.series ||
                   character.comic ||
                   "";

           }


           const item =
               document.createElement(
                   "div"
               );


           item.className =
               "character-item";


           const isInsidePages =
               window.location.pathname.includes("/pages/");


           const fallback =
               isInsidePages
                   ? "../assets/placeholders/avatar.webp"
                   : "assets/placeholders/avatar.webp";


           const characterURL =
               `${getSeriesPageUrl()}?character=${encodeURIComponent(id)}`;


           item.innerHTML = `

               <a
                   href="${characterURL}"
                   class="character-link"
               >

                   <div class="character-avatar">

                       <img
                           src="${image || fallback}"
                           alt="${name}"
                           loading="lazy"
                       >

                   </div>


                   <div class="character-info">

                       <span class="character-name">

                           ${name}

                       </span>


                       ${
                           series
                           ? `
                               <span class="character-series">

                                   ${series}

                               </span>
                           `
                           : ""
                       }

                   </div>

               </a>

           `;


           container.appendChild(
               item
           );

       }
   );
  ```

}

/* ==========================================================
INITIALIZE SIDEBAR
========================================================== */

/**

* Inicializa el Sidebar.
  */
  export async function initSidebar() {

  try {

  ```
   /*
   Cargar solamente
   los datos que ya sabemos
   que existen.
   */

   const comics =
       await loadComics();


   const characters =
       await loadCharacters();


   /*
   Recent Updates
   */

   renderRecentUpdates(
       comics
   );


   /*
   Genres
   */

   renderGenres(
       comics
   );


   /*
   Characters
   */

   renderCharacters(
       characters
   );
  ```

  }
  catch (
  error
  ) {

  ```
   console.error(
       "Sidebar initialization error:",
       error
   );
  ```

  }

}
