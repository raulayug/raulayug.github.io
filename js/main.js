// Footer
const backToTopButton = document.getElementById('backToTopButton');
backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Hero
const scrollDownButton = document.getElementById('scroll-down-button');
const experienceSection = document.getElementById('experience');

function scrollToPillars() {
    experienceSection.scrollIntoView({ behavior: 'smooth' });
}

function toggleScrollDownButton() {
    const threshold = 64;
    if (window.scrollY > threshold) {
        scrollDownButton.classList.add('hide');
    } else {
        scrollDownButton.classList.remove('hide');
    }
}

scrollDownButton.addEventListener('click', () => scrollToPillars());
window.addEventListener('scroll', () => toggleScrollDownButton());

// Spyglass
const sections = document.querySelectorAll('#hero, #experience, #contact');
const scrollIndicator = document.querySelector('.scroll-indicator');
const scrollLines = document.querySelectorAll('.scroll-line');

let activeIndex = 0;
let isIndicatorHovered = false;

function updateScrollIndicator() {
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            activeIndex = index;
        }
    });

    renderActiveState();
}

function renderActiveState() {
    scrollLines.forEach((line, index) => {
        const shouldBeActive = index === activeIndex && !isIndicatorHovered;
        line.classList.toggle('active', shouldBeActive);
    });
}

function scrollToTarget(target) {
    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
}

scrollLines.forEach((line) => {
    line.addEventListener('click', () => scrollToTarget(line.dataset.target));
});

scrollIndicator.addEventListener('mouseenter', () => {
    isIndicatorHovered = true;
    renderActiveState();
});

scrollIndicator.addEventListener('mouseleave', () => {
    isIndicatorHovered = false;
    renderActiveState();
});

window.addEventListener('scroll', () => updateScrollIndicator());
updateScrollIndicator();