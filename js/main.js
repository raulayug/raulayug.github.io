let activeAspectIndex = 0;
let aspectNames;

const chipColors = {
    // audio chips
    production: '#e8a045',
    mixing:     '#347FC4',
    mastering:  '#EF233C',

    // instrum
    guitar:     '#b5781b',
    drums:      '#558564',
    bass:       '#279c9e',
    synth:      '#3c3eb3',
    keys:       '#c24fba',
    percussion: '#6E69C9',

    // video chips
    management: '#EF233C',
    audio:      '#e8a045',
    editing:    '#347FC4',
};

const chipOrder = [
    // audio chips
    'production',
    'mixing',
    'mastering',

    // instrum
    'guitar',
    'drums',
    'bass',
    'synth',
    'keys',
    'percussion',

    // video chips
    'management',
    'audio',
    'editing'
];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function initCardsAndModals() {
    return new Promise((resolve) => {
        const asyncTasks = [
            initPlayableSongs(),
            initPlayableVideos()
        ];

        function parseTextToKeywords(text, filter='') {
            if (filter == 'prod') {
                return text
                    .split(',')
                    .map(keyword => keyword.trim())
                    .map(keyword => keyword.toLowerCase())
                    .filter(keyword => ['production', 'mixing', 'mastering'].includes(keyword))
                    .sort((a, b) => chipOrder.indexOf(a) - chipOrder.indexOf(b));
            }
            else if (filter == 'instrum') {
                return text
                    .split(',')
                    .map(keyword => keyword.trim())
                    .map(keyword => keyword.toLowerCase())
                    .filter(keyword => ['guitar', 'drums', 'bass', 'synth', 'keys', 'percussion'].includes(keyword))
                    .sort((a, b) => chipOrder.indexOf(a) - chipOrder.indexOf(b));
            }
            else {
                return text
                    .split(',')
                    .map(keyword => keyword.trim())
                    .map(keyword => keyword.toLowerCase())
                    .sort((a, b) => chipOrder.indexOf(a) - chipOrder.indexOf(b));
            }
        }
        
        function initModalElement() {
            let modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-content"></div>
            `;
            document.body.appendChild(modal);
            
            let modalBackdrop = document.querySelector('.modal-backdrop');
            modalBackdrop.addEventListener('click', () => closeModal());

            return modal;
        }
        
        function openModal(item) {
            const content = modal.querySelector('.modal-content');
            let captionText = '';
            let chipsText = '';
            content.innerHTML = '';

            if (item.classList.contains('expandable-image')) {
                const imageElement = document.createElement('img');
                imageElement.src = item.getAttribute('src');
                content.appendChild(imageElement);

                captionText = item.getAttribute('alt');
            }
            else if (item.classList.contains('video')) {
                const iframeAttributes = {
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    allowFullscreen: true
                };
                
                const iframeElement = document.createElement('iframe');
                iframeElement.src = `https://www.youtube.com/embed/${item.dataset.id}?autoplay=1`;
                Object.assign(iframeElement, iframeAttributes);
                content.appendChild(iframeElement);

                dataChipsText = item.dataset.dataChips;
                captionText = item.dataset.message;
            }
            else if (item.classList.contains('song')) {
                const iframeAttributes = {
                    style: 'border-radius: 12px',
                    width: '100%',
                    height: '352',
                    frameBorder: '0',
                    allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
                };

                const iframeElement = document.createElement('iframe');
                iframeElement.src = `https://open.spotify.com/embed/track/${item.dataset.id}`;
                Object.assign(iframeElement, iframeAttributes);
                content.appendChild(iframeElement);

                chipsText = item.dataset.chips;
                instrumText = item.dataset.instrum;
                captionText = item.dataset.message;
            }


            if (chipsText) {
                let keywords = parseTextToKeywords(chipsText, 'prod');
                const chipContainerElem = document.createElement('div');
                chipContainerElem.classList.add('modal-chip-container');
                chipContainerElem.classList.add('google-sans-flex-normal');
                
                keywords.forEach(keyword => {
                    const chip = document.createElement('span');
                    chip.classList.add('media-chip');
                    chip.textContent = keyword.trim();
                    chip.style.backgroundColor = chipColors[keyword.trim()] || 'var(--accent-1)';
                    chipContainerElem.appendChild(chip);
                });

                keywords = parseTextToKeywords(chipsText, 'instrum');
                const instrumContainerElem = document.createElement('div');
                instrumContainerElem.classList.add('modal-chip-container');
                instrumContainerElem.classList.add('google-sans-flex-normal');
                
                keywords.forEach(keyword => {
                    const chip = document.createElement('span');
                    chip.classList.add('media-chip');
                    chip.textContent = keyword.trim();
                    chip.style.backgroundColor = chipColors[keyword.trim()] || 'var(--accent-1)';
                    instrumContainerElem.appendChild(chip);
                });

                content.appendChild(chipContainerElem);
                content.appendChild(instrumContainerElem);
            }
            if (captionText) {
                const captionElement = document.createElement('div');
                captionElement.classList.add('modal-caption');
                captionElement.classList.add('google-sans-flex-normal');
                captionElement.textContent = captionText;
                content.appendChild(captionElement);
            }

            modal.classList.add('visible');
        }

        function closeModal() {
            modal.classList.remove('visible');
            setTimeout(() => {
                const iframe = modal.querySelector('iframe');
                if (iframe) iframe.remove();
            }, 200);
        }

        // Images
        function initExpandableImages() {
            const expandableImages = document.querySelectorAll('.expandable-image');
            expandableImages.forEach(image => {
                image.addEventListener('click', () => openModal(image));
            });
        }

        // Videos
        function initPlayableVideos() {
            return new Promise((resolve) => {
                const playableVideos = document.querySelectorAll('.media-card.video');

                const videoPromises = Array.from(playableVideos).map(async (video) => {
                    const youtubeData = await fetchYoutubeData(video.dataset.id);
                    
                    let title = youtubeData ? youtubeData.title : 'Untitled Video';
                    let thumbnail_url = youtubeData ? youtubeData.thumbnail_url : 'fallback-thumbnail.jpg';

                    video.innerHTML = `
                        <img class="thumbnail" src="${thumbnail_url}">
                        <h3 class="title">${title}</h3>
                    `;

                    if (video.hasAttribute('data-chips')) { 
                        initCreditChip(video); 
                    }

                    video.addEventListener('click', () => openModal(video));
                });

                Promise.all(videoPromises).then(() => {
                    console.log("All YouTube videos have loaded and fully rendered!");
                    resolve();
                });
            });
        }

        async function fetchYoutubeData(youtubeId) {
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;

            try {
                const response = await fetch(oembedUrl);
                if (!response.ok) throw new Error('oEmbed request failed');
                const data = await response.json();
                return data;
            } catch (error) {
                return null;
            }
        }

        // Spotify
        function initPlayableSongs() {
            return new Promise((resolve) => {
                const playableSongs = document.querySelectorAll('.media-card.song');

                const songPromises = Array.from(playableSongs).map(async (song) => {
                    const id = song.dataset.id;
                    const artist = song.dataset.artist;

                    const spotifyData = await fetchSpotifyData(id);
                    const title = spotifyData ? spotifyData.title : 'Untitled';
                    const thumbnailUrl = spotifyData ? spotifyData.thumbnail_url : '';

                    song.innerHTML = `
                        <img class="thumbnail" src="${thumbnailUrl}">
                        <div class="details">
                            <h3 class="title">${title}</h3>
                            <p class="artist">${artist}</p>
                        </div>
                    `;

                    if (song.hasAttribute('data-chips')) { 
                        initCreditChip(song); 
                    }

                    song.addEventListener('click', () => openModal(song));
                });

                Promise.all(songPromises).then(() => {
                    console.log("All Spotify songs have loaded and fully rendered!");
                    resolve();
                });
            });
        }

        async function fetchSpotifyData(spotifyId) {
            const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${spotifyId}`;

            try {
                const response = await fetch(oembedUrl);
                if (!response.ok) throw new Error('Spotify oEmbed request failed');
                const data = await response.json();
                return data;
            } catch (error) {
                return null;
            }
        }

        // Credit Chips
        function initCreditChip(item) {
            const chipText = item.dataset.chips;

            if (item.classList.contains('song')) {
                const chipContainer = document.createElement('div');
                chipContainer.classList.add('chip-container');
                const instrumContainer = document.createElement('div');
                instrumContainer.classList.add('chip-container');

                if (chipText) {
                    let keywords = parseTextToKeywords(chipText, 'prod');
                    keywords.forEach(keyword => {
                        const chip = document.createElement('span');
                        chip.classList.add('media-chip');
                        chip.textContent = keyword.trim();
                        chip.style.backgroundColor = chipColors[keyword.trim()] || 'var(--accent-1)';
                        chipContainer.appendChild(chip);
                    });

                    keywords = parseTextToKeywords(chipText, 'instrum');
                    keywords.forEach(keyword => {
                        const chip = document.createElement('span');
                        chip.classList.add('media-chip');
                        chip.textContent = keyword.trim();
                        chip.style.backgroundColor = chipColors[keyword.trim()] || 'var(--accent-1)';
                        instrumContainer.appendChild(chip);
                    });
                }

                item.appendChild(chipContainer);
                item.appendChild(instrumContainer);
                truncateChips(instrumContainer, 3);
            }
            else if (item.classList.contains('video')) {
                const chipContainer = document.createElement('div');
                chipContainer.classList.add('chip-container');

                if (chipText) {
                    let keywords = parseTextToKeywords(chipText);
                    keywords.forEach(keyword => {
                        const chip = document.createElement('span');
                        chip.classList.add('media-chip');
                        chip.textContent = keyword.trim();
                        chip.style.backgroundColor = chipColors[keyword.trim()] || 'var(--accent-1)';
                        chipContainer.appendChild(chip);
                    });
                }

                item.appendChild(chipContainer);
            }
        }

        function truncateChips(container, maxVisible) {
            const chips = Array.from(container.querySelectorAll('.media-chip'));
            if (chips.length <= maxVisible) return;

            const hiddenCount = chips.length - maxVisible;
            chips.slice(maxVisible).forEach((chip) => chip.remove());

            const moreChip = document.createElement('span');
            moreChip.className = 'media-chip chip-more';
            moreChip.textContent = `+${hiddenCount}`;
            container.appendChild(moreChip);
        }

        const modal = initModalElement();
        initExpandableImages();
        initPlayableVideos();
        initPlayableSongs();

        Promise.all(asyncTasks).then(() => {
            resolve();
        });
    });
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

function initExperienceSkills() {
    function initSkillElement(el) {
        const aspectAncestor = el.closest('[data-aspect]');
        const category = aspectAncestor ? aspectAncestor.dataset.aspect : null;

        const src = `assets/images/${category}/skills/${el.dataset.picture}.png`;

        el.innerHTML = `
            <a href="${el.dataset.href}" target="_blank">
                <img src="${src}" alt="${el.dataset.picture} logo">
                <p>${el.dataset.name}</p>
            </a>
        `;
    }

    let categoryElements = document.querySelectorAll('.category-element');
    categoryElements.forEach((el) => initSkillElement(el));
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

    initExperienceSkills();
}

function initContact() {
    const contactDiv = document.getElementById('contact');
    const footerDiv = document.getElementById('footer');

    const contactButton = document.getElementById('contactButton');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    const EMAIL = 'raulayug@gmail.com';

    function computeContactHeight() {
        let footerHeight = footerDiv.getBoundingClientRect().height;
        contactDiv.style.height = `${window.innerHeight - footerHeight}px`;
    }

    function setFieldError(field, hasError) {
        field.classList.toggle('input-error', hasError);
    }

    function clearFieldError(event) {
        setFieldError(event.target, false);
    }

    function triggerShake(field) {
        field.classList.remove('shake');
        void field.offsetWidth;
        field.classList.add('shake');
    }

    function handleContactSubmit() {
        const subjectValue = subjectInput.value.trim();
        const messageValue = messageInput.value.trim();

        const subjectMissing = subjectValue === '';
        const messageMissing = messageValue === '';

        setFieldError(subjectInput, subjectMissing);
        setFieldError(messageInput, messageMissing);

        if (subjectMissing) triggerShake(subjectInput);
        if (messageMissing) triggerShake(messageInput);

        if (subjectMissing || messageMissing) {
            return;
        }

        const subject = encodeURIComponent(subjectValue);
        const body = encodeURIComponent(messageValue);
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    }

    contactButton.addEventListener('click', handleContactSubmit);
    subjectInput.addEventListener('input', clearFieldError);
    messageInput.addEventListener('input', clearFieldError);
    window.addEventListener('resize', computeContactHeight);

    computeContactHeight();
}

function initFooter() {
    const backToTopButton = document.getElementById('backToTopButton');
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initScrollSpyglass();
    initContact();
    initFooter();
    await initCardsAndModals();

    if (document.readyState !== 'complete') { await new Promise(resolve => window.addEventListener('load', resolve)); }
    await document.fonts.ready;

    initExperience();
    if (window.location.hash) experience.handleHashNavigation();
});