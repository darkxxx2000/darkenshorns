const slider = document.getElementById("banner-slider");

if (slider) {

    fetch("data/home-banner.json")

        .then(r => r.json())

        .then(images => {

            images.forEach(item => {

                const div = document.createElement("div");

                div.className = "banner-slide";

                div.style.backgroundImage = `url("${item.image}")`;

                slider.appendChild(div);

            });

            let current = 0;

            function nextSlide() {

                const delay = (current === 0) ? 2000 : 5000;

                setTimeout(() => {

                    current++;

                    if (current >= images.length) {

                        current = 0;

                    }

                    slider.style.transform = `translateX(-${current * 100}%)`;

                    nextSlide();

                }, delay);

            }

            nextSlide();

        })

        .catch(console.error);

}
})

.catch(console.error);

}
