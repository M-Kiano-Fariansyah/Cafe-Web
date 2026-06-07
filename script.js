const container = document.querySelector(".container-t");
const cards = document.querySelectorAll(".card-testimonial");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const testimonialSection = document.querySelector(".testimonials-content");

let index = 0;
let autoSlide;

function updateCarousel() {
    container.style.transform =
        `translateX(-${index * 100}%)`;

    dots.forEach(dot =>
        dot.classList.remove("active")
    );

    dots[index].classList.add("active");
}

function nextSlide() {
    index = (index + 1) % cards.length;
    updateCarousel();
}

function prevSlide() {
    index = (index - 1 + cards.length) % cards.length;
    updateCarousel();
}

function startAutoSlide() {
    autoSlide = setInterval(nextSlide, 4000);
}

function stopAutoSlide() {
    clearInterval(autoSlide);
}

nextBtn.addEventListener("click", () => {
    nextSlide();
});

prevBtn.addEventListener("click", () => {
    prevSlide();
});

dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
        index = i;
        updateCarousel();
    });
});

testimonialSection.addEventListener("mouseenter", stopAutoSlide);
testimonialSection.addEventListener("mouseleave", startAutoSlide);

let startX = 0;
let endX = 0;

testimonialSection.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
});

testimonialSection.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;

    const distance = startX - endX;

    if (distance > 50) {
        nextSlide();
    }

    if (distance < -50) {
        prevSlide();
    }
});

startAutoSlide();
updateCarousel();

const hamburger = document.getElementById("hamburger");
const navContent = document.getElementById("nav-content");

hamburger.addEventListener("click", () => {
    navContent.classList.toggle("active");
});