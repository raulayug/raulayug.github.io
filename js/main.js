// Experience
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
        let aspectContent = aspect.querySelector('.content');

        let aspectDivHeight = window.innerHeight * 0.3;
        let aspectHeaderHeight = aspectHeader.getBoundingClientRect().height;
        let margin = (aspectDivHeight - aspectHeaderHeight) / 2;

        aspectHeader.style.margin = `${margin}px 0`;
        aspectContent.style.paddingBottom = `${margin}px`;
    });
}

// Initializes an individual aspect div animator.
// returns aspectAnimator functions
function createAspectAnimator(aspectDiv, options = {}) {
    // tune to taste
    const { expandDistanceRatio = 0.3, fadeDistanceRatio = 0.02 } = options;

    const header = aspectDiv.querySelector('.header');
    const content = aspectDiv.querySelector('.content');

    let headerMarginTop = 0;
    let headerMarginBottom = 0;
    let expandDistance = 0;
    let scrollDistance = 0;
    let fadeDistance = 0;
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0;

    let expandProgress = 0;
    let scrollProgress = 0;

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
            header.style.marginTop = `${headerMarginTop - scrollProgress * scrollDistance}px`;
            header.style.marginBottom = `${headerMarginBottom}px`;
            header.style.opacity = 1;
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

    function getExpandProgress() {
        return expandProgress;
    }

    function getTotalDistance() {
        return b4;
    }

    measure();
    return { measure, applyLocalProgress, getTotalDistance, getExpandProgress };
}

function initAspectSequence() {
    const section = document.getElementById('experience');
    const menuDiv = section.querySelector('.aspects-menu');
    const aspectDivs = Array.from(menuDiv.querySelectorAll('.aspect'));
    const aspectDivAnimators = aspectDivs.map((aspectDiv) => createAspectAnimator(aspectDiv));

    let aspectDivScrollStart = [];
    let totalScrollDistance = 0;

    // Measure and sum each div's length (totalDistance)
    // Apply totalScrollDistance to section height
    function measureAll() {
        aspectDivAnimators.forEach((a) => a.measure());
        
        aspectDivScrollStart = [];
        totalScrollDistance = 0;
        aspectDivAnimators.forEach((a) => { aspectDivScrollStart.push(totalScrollDistance); totalScrollDistance += a.getTotalDistance(); });
        section.style.height = `${window.innerHeight + totalScrollDistance}px`;
    }

    // Run on every scroll/window repaint
    // distanceScrolled: in px
    // activeAspectIndex: 0..2, mapped to aspect
    function updateProgress() {
        const sectionRect = section.getBoundingClientRect();
        const distanceScrolled = clamp(-sectionRect.top, 0, totalScrollDistance);

        // Determine active aspect based on distance scrolled
        let activeAspectIndex = 0;
        for (let i = 0; i < aspectDivAnimators.length; i++) {
            const end = aspectDivScrollStart[i] + aspectDivAnimators[i].getTotalDistance();
            if (distanceScrolled < end) { activeAspectIndex = i; break; }
        }
        aspectDivs.forEach((pillar, i) => pillar.classList.toggle('active', i === activeAspectIndex));

        // Update --expand-progress based on apply local progress
        let activeAspectExpandProgress = 0;
        aspectDivAnimators.forEach((animator, i) => {
            animator.applyLocalProgress(distanceScrolled - aspectDivScrollStart[i]);
            const expandProgress = animator.getExpandProgress();
            if (i === activeAspectIndex) {
                activeAspectExpandProgress = expandProgress;
            }
        });
        menuDiv.style.setProperty('--expand-progress', activeAspectExpandProgress);
    }

    measureAll();
    window.addEventListener('resize', () => { measureAll(); updateProgress(); setDescriptionMargin();});
    window.addEventListener('scroll', () => window.requestAnimationFrame(updateProgress));
}

document.addEventListener('DOMContentLoaded', () => {
    setDescriptionMargin();
    setAspectMargins();

    initAspectSequence();
});


// Contact
const contactDiv = document.getElementById('contact');
const footerDiv = document.getElementById('footer');
// Need to add eventlistener for resize
let footerHeight = footerDiv.getBoundingClientRect().height;
contactDiv.style.height = `${window.innerHeight - footerHeight}px`;

// Footer
const backToTopButton = document.getElementById('backToTopButton');
backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));