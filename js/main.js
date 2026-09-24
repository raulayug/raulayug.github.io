function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setDescriptionMargins() {
    document.querySelectorAll('.description h2').forEach((h2) => {
        const descriptionHeight = window.innerHeight * 0.1;
        const h2Height = h2.getBoundingClientRect().height;
        h2.style.marginTop = `${(descriptionHeight - h2Height) / 2}px`;
    });
}

function setAspectMargins() {
    document.querySelectorAll('.aspect-pillar').forEach((pillar) => {
        const header = pillar.querySelector('.header');
        const pillarHeight = window.innerHeight * 0.3;
        const headerHeight = header.getBoundingClientRect().height;
        header.style.margin = `${(pillarHeight - headerHeight) / 2}px 0`;
    });
}

function createAspectAnimator(pillarEl, options = {}) {
    const { expandDistanceRatio = 0.2, fadeDistanceRatio = 0.1 } = options;
    const header = pillarEl.querySelector('.header');
    const content = pillarEl.querySelector('.content');

    let headerMarginTop = 0;
    let headerMarginBottom = 0;
    let expandDistance = 0;
    let scrollDistance = 0;
    let fadeDistance = 0;
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0;

    function measure() {
        const initialHeight = window.innerHeight * 0.3;
        const headerHeight = header.getBoundingClientRect().height;
        headerMarginTop = (initialHeight - headerHeight) / 2;
        headerMarginBottom = (initialHeight - headerHeight) / 2;

        const contentHeight = content.getBoundingClientRect().height;
        const totalStackHeight = headerMarginTop + headerHeight + headerMarginBottom + contentHeight;

        expandDistance = window.innerHeight * expandDistanceRatio;
        scrollDistance = Math.max(totalStackHeight - window.innerHeight, 0);
        fadeDistance = window.innerHeight * fadeDistanceRatio;

        b1 = expandDistance;
        b2 = b1 + scrollDistance;
        b3 = b2 + fadeDistance;
        b4 = b3 + expandDistance;
    }

    // Applies this aspect's own phase math at a given LOCAL scroll offset,
    // and returns its expandProgress so the coordinator can drive shared CSS.
    function applyLocalProgress(localScrolled) {
        const scrolled = clamp(localScrolled, 0, b4);

        let expandProgress = 0;
        let scrollProgress = 0;
        let headerOpacity = 1;
        let contentOpacity = 1;

        if (scrolled <= b1) {
            expandProgress = expandDistance > 0 ? scrolled / expandDistance : 1;
        } else if (scrolled <= b2) {
            expandProgress = 1;
            scrollProgress = scrollDistance > 0 ? (scrolled - b1) / scrollDistance : 1;
        } else if (scrolled <= b3) {
            expandProgress = 1;
            scrollProgress = 1;
            contentOpacity = fadeDistance > 0 ? 1 - (scrolled - b2) / fadeDistance : 0;
            headerOpacity = 0;
        } else {
            const t = expandDistance > 0 ? (scrolled - b3) / expandDistance : 1;
            expandProgress = 1 - clamp(t, 0, 1);
            scrollProgress = 0;
            headerOpacity = clamp(t, 0, 1);
            contentOpacity = 0;
        }

        expandProgress = clamp(expandProgress, 0, 1);
        header.style.marginTop = `${headerMarginTop - clamp(scrollProgress, 0, 1) * scrollDistance}px`;
        header.style.marginBottom = `${headerMarginBottom}px`;
        header.style.opacity = clamp(headerOpacity, 0, 1);
        content.style.opacity = clamp(contentOpacity, 0, 1);

        return expandProgress;
    }

    measure();
    return { get totalDistance() { return b4; }, measure, applyLocalProgress };
}

function initAspectSequence(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    const menu = wrapper.querySelector('.aspects-menu');
    const pillars = Array.from(menu.querySelectorAll('.aspect-pillar'));
    const animators = pillars.map((pillar) => createAspectAnimator(pillar));

    let offsets = [];
    let totalDistance = 0;

    function measureAll() {
        animators.forEach((a) => a.measure());
        offsets = [];
        let running = 0;
        animators.forEach((a) => { offsets.push(running); running += a.totalDistance; });
        totalDistance = running;
        wrapper.style.height = `${window.innerHeight + totalDistance}px`;
    }

    function updateProgress() {
        const wrapperRect = wrapper.getBoundingClientRect();
        const scrolled = clamp(-wrapperRect.top, 0, totalDistance);

        let activeIndex = animators.length - 1;
        for (let i = 0; i < animators.length; i++) {
            const end = offsets[i] + animators[i].totalDistance;
            if (scrolled < end) { activeIndex = i; break; }
        }

        let activeProgress = 0;
        animators.forEach((animator, i) => {
            const progress = animator.applyLocalProgress(scrolled - offsets[i]);
            if (i === activeIndex) activeProgress = progress;
        });

        pillars.forEach((pillar, i) => pillar.classList.toggle('active', i === activeIndex));
        menu.style.setProperty('--expand-progress', activeProgress);
    }

    measureAll();
    window.addEventListener('resize', () => { measureAll(); updateProgress(); });
    window.addEventListener('scroll', () => window.requestAnimationFrame(updateProgress));
    updateProgress();
}

document.addEventListener('DOMContentLoaded', () => {
    setDescriptionMargins();
    setAspectMargins();
    initAspectSequence('experience');
});