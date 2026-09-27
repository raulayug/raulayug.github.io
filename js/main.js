let activeAspectIndex = 0;
let aspectNames;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function initScrollSpyglass() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const scrollLines = document.querySelectorAll('.scroll-line');

    const HERO = 0, ABOUT = 1, EXPERIENCE = 2, CONTACT = 6; // tick in spyglass
    const heroEl = document.getElementById('hero');
    const aboutEl = document.getElementById('about');
    const experienceEl = document.getElementById('experience');
    const contactEl = document.getElementById('contact');

    let activeIndex = HERO;
    let isIndicatorHovered = false;

    function updateScrollIndicator() {
        const threshold = window.innerHeight / 3;
        const experienceEntryBuffer = window.innerHeight * 0.05;

        let candidate;
        [[HERO, heroEl], [ABOUT, aboutEl], [EXPERIENCE, experienceEl], [CONTACT, contactEl]]
            .forEach(([index, el]) => {
                if (el.getBoundingClientRect().top <= threshold) candidate = index;
            });

        const experienceRect = experienceEl.getBoundingClientRect();
        const insideExperience = experienceRect.top <= -experienceEntryBuffer && experienceRect.bottom > threshold;

        // for SOFTWARE, MEDIA, LEADERSHIP
        if (insideExperience) {
            candidate = EXPERIENCE + 1 + activeAspectIndex;
        }

        activeIndex = candidate;
        renderActiveState();
    }

    function renderActiveState() {
        scrollLines.forEach((line, index) => {
            line.classList.toggle('active', index === activeIndex && !isIndicatorHovered);
        });
    }

    function scrollToTarget(target) {
        const raw = target.startsWith('#') ? target.slice(1) : target;
        if (raw.includes('?')) {
            const [sectionId, aspectName] = raw.split('?');
            if (sectionId === 'experience') {
                window.scrollToAspect(aspectName);
                return;
            }
        }
        document.querySelector(`#${raw}`).scrollIntoView({ behavior: 'smooth' });
    }

    scrollLines.forEach((line) => {
        line.addEventListener('click', () => scrollToTarget(line.dataset.target));
    });

    scrollIndicator.addEventListener('mouseenter', () => { isIndicatorHovered = true; renderActiveState(); });
    scrollIndicator.addEventListener('mouseleave', () => { isIndicatorHovered = false; renderActiveState(); });
    window.addEventListener('scroll', () => updateScrollIndicator());
    updateScrollIndicator();
}

function initExperienceAspectAnimation(aspectDiv) {
    const expandDistanceRatio = 0.3;
    const contentFadeDistanceRatio = 0.2;
    const headerFadeDistanceRatio = 1.5;

    const header = aspectDiv.querySelector('.header');
    const content = aspectDiv.querySelector('.content');

    let headerMarginTop = 0;
    let headerMarginBottom = 0;

    let expandDistance = 0;
    let scrollDistance = 0;
    let fadeDistance = 0;
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0;

    let expandProgress = 0;

    function measure() {
        const initialHeight = window.innerHeight * 0.3;
        const headerHeight = header.getBoundingClientRect().height;
        headerMarginTop = (initialHeight - headerHeight) / 2;
        headerMarginBottom = (initialHeight - headerHeight) / 2;

        const contentHeight = content.getBoundingClientRect().height;
        const totalStackHeight = headerMarginTop + headerHeight + headerMarginBottom + contentHeight;

        expandDistance = window.innerHeight * expandDistanceRatio;
        scrollDistance = Math.max(totalStackHeight - window.innerHeight, 0);
        fadeDistance = window.innerHeight * contentFadeDistanceRatio;

        b1 = expandDistance;
        b2 = b1 + scrollDistance;
        b3 = b2 + fadeDistance;
        b4 = b3 + expandDistance;
    }

    // Applies aspect's own phase math at a LOCAL scroll offset
    function applyLocalProgress(localScrolled) {
        const scrolled = clamp(localScrolled, 0, b4);

        // b1: expand
        if (scrolled <= b1) {
            expandProgress = expandDistance > 0 ? scrolled / expandDistance : 1;
            header.style.marginTop = `${headerMarginTop}px`;
            header.style.marginBottom = `${headerMarginBottom}px`;
            header.style.opacity = 1;
            content.style.opacity = 1;
        }
        // b2: scroll (reveal content)
        else if (scrolled <= b2) {
            expandProgress = 1;
            const scrollProgress = scrollDistance > 0 ? (scrolled - b1) / scrollDistance : 1;

            const headerFadeEnd = Math.min(window.innerHeight * headerFadeDistanceRatio, b2);
            const headerFadeRange = Math.max(headerFadeEnd - b1, 1); // avoid divide-by-zero
            const headerOpacity = clamp(1 - (scrolled - b1) / headerFadeRange, 0, 1);

            header.style.marginTop = `${headerMarginTop - scrollProgress * scrollDistance}px`;
            header.style.marginBottom = `${headerMarginBottom}px`;
            header.style.opacity = headerOpacity;
            content.style.opacity = 1;
        }
        // b3: fade-out content
        else if (scrolled <= b3) {
            expandProgress = 1;
            const contentOpacity = fadeDistance > 0 ? 1 - (scrolled - b2) / fadeDistance : 0;
            header.style.marginTop = `${headerMarginTop - scrollDistance}px`;
            header.style.marginBottom = `${headerMarginBottom}px`;
            header.style.opacity = 0;
            content.style.opacity = clamp(contentOpacity, 0, 1);
        }
        // b4: un-expand
        else if (scrolled <= b4) {
            const t = expandDistance > 0 ? (scrolled - b3) / expandDistance : 1;
            expandProgress = 1 - clamp(t, 0, 1);
            header.style.marginTop = `${headerMarginTop}px`;
            header.style.marginBottom = `${headerMarginBottom}px`;
            header.style.opacity = clamp(t, 0, 1);
            content.style.opacity = 0;
        }
    }

    function getExpandProgress() { return expandProgress; }

    function getTotalDistance() { return b4; }

    function getExpandDistance() { return expandDistance; }

    measure();
    return { measure, applyLocalProgress, getTotalDistance, getExpandProgress, getExpandDistance };
}

function initExperience() {
    const experience = document.getElementById('experience');
    const menuDiv = experience.querySelector('.aspects-menu');
    const aspectDivs = Array.from(menuDiv.querySelectorAll('.aspect'));
    const aspectDivAnimators = aspectDivs.map((aspectDiv) => initExperienceAspectAnimation(aspectDiv));
    aspectNames = aspectDivs.map((aspectDiv) => aspectDiv.dataset.aspect);

    let aspectDivScrollStart = [];
    let totalScrollDistance = 0;

    // Measure and sum each div's length (totalDistance)
    // Apply totalScrollDistance to section height
    function measureAll() {
        aspectDivAnimators.forEach((a) => a.measure());
        
        aspectDivScrollStart = [];
        totalScrollDistance = 0;
        aspectDivAnimators.forEach((a) => { aspectDivScrollStart.push(totalScrollDistance); totalScrollDistance += a.getTotalDistance(); });
        experience.style.height = `${window.innerHeight + totalScrollDistance}px`;
    }

    function setDescriptionMargin() {
        document.querySelectorAll('.description h2').forEach((h2) => {
            const descriptionHeight = window.innerHeight * 0.1;
            const h2Height = h2.getBoundingClientRect().height;
            h2.style.marginTop = `${(descriptionHeight - h2Height) / 2}px`;
        });
    }

    function setAspectMargins() {
        document.querySelectorAll('.aspect').forEach((aspect) => {
            let aspectHeader = aspect.querySelector('.header');

            let aspectDivHeight = window.innerHeight * 0.3;
            let aspectHeaderHeight = aspectHeader.getBoundingClientRect().height;
            let margin = (aspectDivHeight - aspectHeaderHeight) / 2;

            aspectHeader.style.margin = `${margin}px 0`;
        });
    }

    function updateProgress() {
        const sectionRect = experience.getBoundingClientRect();
        const distanceScrolled = clamp(-sectionRect.top, 0, totalScrollDistance);

        for (let i = 0; i < aspectDivAnimators.length; i++) {
            const end = aspectDivScrollStart[i] + aspectDivAnimators[i].getTotalDistance();
            if (distanceScrolled < end) { activeAspectIndex = i; break; }
        }
        aspectDivs.forEach((pillar, i) => pillar.classList.toggle('active', i === activeAspectIndex));

        let activeAspectExpandProgress = 0;
        aspectDivAnimators.forEach((animator, i) => {
            animator.applyLocalProgress(distanceScrolled - aspectDivScrollStart[i]);
            if (i === activeAspectIndex) activeAspectExpandProgress = animator.getExpandProgress();
        });
        menuDiv.style.setProperty('--expand-progress', activeAspectExpandProgress);
    }

    function scrollToAspect(aspectName) {
        const index = aspectNames.indexOf(aspectName);
        if (index === -1) return;

        const sectionTop = experience.getBoundingClientRect().top + window.scrollY;
        const target = sectionTop + aspectDivScrollStart[index] + aspectDivAnimators[index].getExpandDistance();

        window.scrollTo({ top: target, behavior: 'smooth' });
    }

    function handleHashNavigation() {
        const hash = window.location.hash; // e.g. "#experience?media-production"
        if (!hash.startsWith('#experience?')) return;
        const aspectName = hash.split('?')[1];
        scrollToAspect(aspectName);
    }

    measureAll();
    setDescriptionMargin();
    setAspectMargins();

    window.scrollToAspect = scrollToAspect;

    window.addEventListener('resize', () => { measureAll(); updateProgress(); setDescriptionMargin();});
    window.addEventListener('scroll', () => window.requestAnimationFrame(updateProgress));
    
    window.addEventListener('hashchange', handleHashNavigation);
    if (window.location.hash) { requestAnimationFrame(handleHashNavigation); }
}

function initContact() {
    const contactDiv = document.getElementById('contact');
    const footerDiv = document.getElementById('footer');
    let footerHeight = footerDiv.getBoundingClientRect().height;
    contactDiv.style.height = `${window.innerHeight - footerHeight}px`;


}

function initFooter() {
    const backToTopButton = document.getElementById('backToTopButton');
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initScrollSpyglass();
    
    initExperience();
    initContact();
    initFooter();
});