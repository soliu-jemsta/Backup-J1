const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');

if (slider && slides.length) {
    let currentSlide = Math.floor(Math.random() * slides.length);

    function showSlide(index) {
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    function updateSlider() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    const sliderContainer = document.querySelector('.slider-container');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    }

    /* Auto Slide */
    let autoSlide = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 4500);

    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(autoSlide);
        });

        sliderContainer.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 4500);
        });
    }

    updateSlider();
}
