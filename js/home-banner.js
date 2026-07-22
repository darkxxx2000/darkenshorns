const slider = document.getElementById("banner-slider");

if (slider) {

    fetch("data/home-banner.json")

        .then(response => {

            if (!response.ok) {
                throw new Error("No se pudo cargar home-banner.json");
            }

            return response.json();

        })

        .then(images => {

            if (!Array.isArray(images) || images.length === 0) {
                console.warn("No hay imágenes en home-banner.json");
                return;
            }

            images.forEach(item => {

                const div =
                    document.createElement("div");

                div.className =
                    "banner-slide";

                div.style.backgroundImage =
                    `url("${item.image}")`;

                slider.appendChild(div);

            });


            let current = 0;


            function nextSlide() {

                /*
                Primera imagen:
                2 segundos

                Siguientes imágenes:
                5 segundos
                */

                const delay =
                    current === 0
                        ? 2000
                        : 5000;


                setTimeout(() => {

                    current++;


                    if (
                        current >= images.length
                    ) {

                        current = 0;

                    }


                    slider.style.transform =
                        `translateX(-${current * 100}%)`;


                    nextSlide();

                }, delay);

            }


            /*
            Iniciar slider
            */

            nextSlide();

        })

        .catch(error => {

            console.error(
                "Error en Home Banner:",
                error
            );

        });

}
