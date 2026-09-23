function initAspectScrub(wrapperId, aspectsId, contentId) {
    const wrapper = document.getElementById(wrapperId);
    const aspectsSection = document.getElementById(aspectsId);
    const contentEl = document.getElementById(contentId);
    const growPhaseEnd = 0.5; // fraction of the pin's scroll spent growing the box

    function updateProgress() {
        const rect = wrapper.getBoundingClientRect();
        const scrollableDistance = wrapper.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const rawProgress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);

        const growProgress = Math.min(rawProgress / growPhaseEnd, 1);
        const revealProgress = Math.min(Math.max((rawProgress - growPhaseEnd) / (1 - growPhaseEnd), 0), 1);

        aspectsSection.style.setProperty('--expand-progress', growProgress);
        contentEl.style.setProperty('--reveal-progress', revealProgress);
        contentEl.classList.toggle('released', rawProgress >= 1);
    }

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateProgress);
    });

    updateProgress();
}

document.addEventListener('DOMContentLoaded', () => {
    initAspectScrub('software-dev-pin-wrapper', 'aspects', 'software-development-content');
});