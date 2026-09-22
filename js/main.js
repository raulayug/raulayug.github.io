const aspects = document.querySelectorAll('#aspects .aspect');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            aspects.forEach(a => a.classList.remove('expanded'));
            entry.target.classList.add('expanded');
        }
    });
}, {
    threshold: 0,
    rootMargin: '-25% 0px -25% 0px'
});

aspects.forEach(a => observer.observe(a));