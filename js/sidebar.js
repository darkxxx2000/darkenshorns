/*************************************************

* DARKENSHORNS
* SIDEBAR
  *************************************************/

import {
loadComics,
loadCharacters,
loadGenres,
loadSeries
} from "./data-loader.js";

/* ==========================================================
PATH HELPER
========================================================== */

/**

* Detecta si estamos en Home o dentro de /pages/
*
* Desde Home:
* pages/series.html
*
* Desde /pages/:
* series.html
  */
  function getSeriesPageUrl() {

  const isInsidePages =
  window.location.pathname.includes("/pages/");

  return isInsidePages
  ? "series.html"
  : "pages/series.html";

}

/**

* Convierte un texto en un slug.
*
* Ejemplo:
*
* "Dark Fantasy"
* →
* "dark-fantasy"
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

* Renderiza lista de actualizaciones recientes.
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
COMIC PAGE URL
========================================================== */

function getComicPageUrl() {

```
const isInsidePages =
    window.location.pathname.includes("/pages/");


return isInsidePages
    ? "comic.html"
    : "pages/comic.html";
```

}

/* ==========================================================
GENRES
========================================================== */

/**

* Renderiza los géneros.
*
* Cada género enlaza a:
*
* series.html?genre=action
  */
  function renderGenres(
  genres = []
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

  /*
  Evita duplicados.
  */

  const uniqueGenres =
  [];

  genres.forEach(
  genre => {

  ```
       let name = "";


       /*
       Soporta:

       "Action"

       o:

       {
           "id": "action",
           "name": "Action"
       }
       */

       if (
           typeof genre ===
           "string"
       ) {

           name =
               genre;

       } else if (
           genre &&
           typeof genre ===
           "object"
       ) {

           name =
               genre.name ||
               genre.title ||
               genre.id ||
               "";

       }


       if (
           name &&
           !uniqueGenres.includes(
               name
           )
       ) {

           uniqueGenres.push(
               name
           );

       }

   }
  ```

  );

  if (
  uniqueGenres.length === 0
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

  uniqueGenres.forEach(
  genre => {

  ```
       const item =
           document.createElement(
               "li"
           );


       const slug =
           createSlug(
               genre
           );


       const link =
           document.createElement(
               "a"
           );


       link.href =
           `${getSeriesPageUrl()}?genre=${encodeURIComponent(slug)}`;


       link.textContent =
           genre;


       item.appendChild(
           link
       );


       container.appendChild(
           item
       );

   }
  ```

  );

}

/* ==========================================================
SERIES
========================================================== */

/**

* Renderiza las series disponibles.
*
* Busca:
*
* #series-list
*
* Si no existe, intenta:
*
* #categories-list
*
* Esto permite mantener compatibilidad
* con la estructura actual del Home.
  */
  function renderSeries(
  series = []
  ) {

  let container =
  document.querySelector(
  "#series-list"
  );

  /*
  Si todavía no existe
  #series-list, no rompe el Home.

  La sección de Series puede
  agregarse posteriormente.
  */

  if (!container) {

  ```
   return;
  ```

  }

  container.innerHTML =
  "";

  if (
  !Array.isArray(series) ||
  series.length === 0
  ) {

  ```
   container.innerHTML = `

       <li>
           No series available.
       </li>

   `;

   return;
  ```

  }

  series.forEach(
  serie => {

  ```
       let id = "";
       let name = "";


       /*
       Soporta:

       {
           "id": "ryuko-matoi",
           "title": "Ryuko Matoi"
       }

       o:

       {
           "id": "ryuko-matoi",
           "name": "Ryuko Matoi"
       }
       */

       if (
           typeof serie ===
           "string"
       ) {

           id =
               createSlug(
                   serie
               );

           name =
               serie;

       } else if (
           serie &&
           typeof serie ===
           "object"
       ) {

           id =
               serie.id ||
               serie.slug ||
               createSlug(
                   serie.name ||
                   serie.title
               );


           name =
               serie.name ||
               serie.title ||
               serie.id ||
               "Untitled";

       }


       if (!id) {

           return;

       }


       const item =
           document.createElement(
               "li"
           );


       const link =
           document.createElement(
               "a"
           );


       link.href =
           `${getSeriesPageUrl()}?series=${encodeURIComponent(id)}`;


       link.textContent =
           name;


       item.appendChild(
           link
       );


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
* Cada personaje es clickeable.
*
* Ejemplo:
*
* series.html?character=ryuko-matoi
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
           Soporta personajes
           como string.
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
           Soporta personajes
           como objetos.
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


           item.innerHTML = `

               <a
                   href="${getSeriesPageUrl()}?character=${encodeURIComponent(id)}"
                   class="character-link"
               >

                   <div class="character-avatar">

                       <img
                           src="${
                               image ||
                               (
                                   window.location.pathname.includes("/pages/")
                                       ? "../assets/placeholders/avatar.webp"
                                       : "assets/placeholders/avatar.webp"
                               )
                           }"

                           alt="${name}"

                           loading="lazy"

                           onerror="
                               this.src='${
                                   window.location.pathname.includes("/pages/")
                                       ? "../assets/placeholders/avatar.webp"
                                       : "assets/placeholders/avatar.webp"
                               }'
                           "
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

* Inicializa todo el Sidebar.
*
* Carga:
*
* * Comics
* * Characters
* * Genres
* * Series
    */
    export async function initSidebar() {

  try {

  ```
   /*
   Cargar todos los datasets
   en paralelo.
   */

   const [
       comics,
       characters,
       genres,
       series
   ] = await Promise.all([

       loadComics(),

       loadCharacters(),

       loadGenres(),

       loadSeries()

   ]);


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
       genres
   );


   /*
   Characters
   */

   renderCharacters(
       characters
   );


   /*
   Series
   */

   renderSeries(
       series
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
