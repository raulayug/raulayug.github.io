/*    
    --- HEADER HEIGHT PADDING ---
*/
var root = document.querySelector(':root');
var header = document.querySelector('.header');
var header_height = header.getBoundingClientRect().height;
root.style.setProperty('--header-height', header_height + 'px');


/*    
    --- BUTTON INIT ---
*/
// --- Header ---
// 
const headerHamburgerButton = document.querySelector('.hamburger');
// Education | Leadership | Works | Skills | Contact
const headerRightLis = document.querySelector('.header-right');
const headerRightLinks = headerRightLis.querySelectorAll('a');

// --- Writeup ---
// "machine learning and signal processing"
const heroMastersButton = document.querySelector('#hero-masters');
// "audio and visual production"
const heroMultimediaButton = document.querySelector('#hero-multimedia');
// "RausHaus Productions"
const heroRaushausButton = document.querySelector('#hero-raushaus');

// --- Education ---
// "Master's Thesis"
const educationMastersButton = document.querySelector('#education-masters');
// "Undergraduate Thesis"
const educationUndergradButton = document.querySelector('#education-undergrad')

// --- Leadership ---
// RausHaus | Ateneo Musicians' Pool | Kroma Entertainment Inc. | Volunteer Work
const leadershipButtons = document.querySelectorAll('.leadership-content .button');
const leadershipDivs = document.querySelectorAll('.leadership-content .content');

// --- Works ---
// Software | Multimedia
const worksButtons = document.querySelectorAll('.works-content .button[data-target]');
const worksDivs = document.querySelectorAll('.works-content .works-body');

// --- Skills ---
// Courses | Admin | Software | Visual | Audio
const skillsButtons = document.querySelectorAll('.skills-content .button');
const skillsDivs = document.querySelectorAll('.skills-content .content');

// --- Contact ---
const contactButton = document.querySelector('#contact-submit');

/*
    --- OTHER INIT ---
*/
// Works: Articles
initArticles();
let resizeTimer;

// Music Production: Song Cards
const modal = document.createElement('div');
initModal();
const worksMediaChipColors = {
    // audio chips
    production: '#e8a045',
    mixing:     '#347FC4',
    mastering:  '#EF233C',
    drums:      '#558564',

    // video chips
    management: '#EF233C',
    audio:      '#e8a045',
    editing:    '#347FC4',
};


/*    
    --- FUNCTIONS ---
*/
const DEST_MASTERS   = 0;
const DEST_UNDERGRAD = 1;
const DEST_MUSIC     = 2;
const DEST_RAUSHAUS  = 3;

// --- Miscellaneous ---
function navigate(dest) {
    switch (dest) {
        case DEST_MASTERS: {
            // show software div
            let targetId = "works-software"
            worksDivs.forEach(div => div.classList.add('hidden'));
	        document.getElementById(targetId).classList.remove('hidden');
                
            // activate software button
	        worksButtons.forEach(btn => btn.classList.remove('active'));
            let button = document.querySelector('[data-target="works-software"]');
	        button.classList.add('active');

            // open article
            let articleId = "#works-masters"
            let article = document.querySelector(articleId);
            let contentBody = article.closest('.works-body');
            let openCard = contentBody.querySelector('.article-container.open');
            collapseArticle(openCard);
            expandArticle(article);
            break;
        }
        case DEST_UNDERGRAD: {
            // show software div
            let targetId = "works-software"
            worksDivs.forEach(div => div.classList.add('hidden'));
	        document.getElementById(targetId).classList.remove('hidden');
                
            // activate software button
	        worksButtons.forEach(btn => btn.classList.remove('active'));
            let button = document.querySelector('[data-target="works-software"]');
	        button.classList.add('active');

            // open article
            let articleId = "#works-undergrad"
            let article = document.querySelector(articleId);
            let contentBody = article.closest('.works-body');
            let openCard = contentBody.querySelector('.article-container.open');
            collapseArticle(openCard);
            expandArticle(article);
            break;
        }
        case DEST_MUSIC: {
            // show multimedia div
            let targetId = "works-multimedia";
            worksDivs.forEach(div => div.classList.add('hidden'));
	        document.getElementById(targetId).classList.remove('hidden');
                
            // activate multimedia button
	        worksButtons.forEach(btn => btn.classList.remove('active'));
            let button = document.querySelector('[data-target="works-multimedia"]');
	        button.classList.add('active');

            // open article
            let articleId = "#works-music-prod"
            let article = document.querySelector(articleId);
            let contentBody = article.closest('.works-body');
            let openCard = contentBody.querySelector('.article-container.open');
            collapseArticle(openCard);
            expandArticle(article);
            break;
        }
        case DEST_RAUSHAUS: {
            // show raushaus div
            let targetId = "leadership-raushaus";
            leadershipDivs.forEach(div => div.classList.add('hidden'));
	        document.getElementById(targetId).classList.remove('hidden');
                
            // activate raushaus button
	        leadershipButtons.forEach(btn => btn.classList.remove('active'));
            let button = document.querySelector('[data-target="leadership-raushaus"]');
	        button.classList.add('active');
            break;
        }
    }
}

function initTabSwitcher(buttons, divs, onSwitch) {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            divs.forEach(div => div.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (onSwitch) onSwitch();
        });
    });
}

// --- Header: Hamburger ---
function hamburgerOpen() {
    headerHamburgerButton.classList.toggle('open');
    headerRightLis.classList.toggle('open');
}

function hamburgerClose() {
    headerHamburgerButton.classList.remove('open');
    headerRightLis.classList.remove('open');
}

// --- Works: Articles ---
function getExpandedArticleHeight(article) {
    const worksBody = article.closest('.works-body');
    const worksBodyHeight = worksBody.getBoundingClientRect().height;
    const padding = parseFloat(getComputedStyle(worksBody).paddingTop) * 2;

    const totalTitlesHeight = [...worksBody.querySelectorAll('.article-title')]
        .reduce((sum, title) => sum + title.getBoundingClientRect().height, 0);

    return worksBodyHeight - totalTitlesHeight - padding;
}

function collapseArticle(article) {
    const body = article.querySelector('.article-body');
    body.style.maxHeight = '0';
    article.classList.remove('open');
    article.classList.add('closed');
}

function expandArticle(article) {
    const articleBody = article.querySelector('.article-body');
    articleBody.style.maxHeight = getExpandedArticleHeight(article) + 'px';
    articleBody.style.height = articleBody.style.maxHeight;
    article.classList.remove('closed');
    article.classList.add('open');
}

function initArticles() {
    document.querySelectorAll('.article-container.open').forEach(article => {
        const articleBody = article.querySelector('.article-body');
        articleBody.style.maxHeight = getExpandedArticleHeight(article) + 'px';
        articleBody.style.height = articleBody.style.maxHeight;
    });
}

function onArticleTitleClick(title) {
    const clickedArticle = title.closest('.article-container');
    const worksBody = clickedArticle.closest('.works-body');
    const openArticle = worksBody.querySelector('.article-container.open');
    collapseArticle(openArticle);
    expandArticle(clickedArticle);
}

function updateArticlesOnResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initArticles();
    }, 100);
} 

// --- Works: Credit Chips ---
function initCreditChips(container) {
    const keywords = container.getAttribute('data-chips').split(',');
    keywords.forEach(keyword => {
        const chip = document.createElement('span');
        chip.classList.add('media-chip');
        chip.textContent = keyword.trim();
        chip.style.backgroundColor = worksMediaChipColors[keyword.trim()] || 'var(--accent-1)';
        container.appendChild(chip);
    });
}

// --- Works: Modals ---
function initModal() {
    modal.classList.add('media-modal');
    modal.innerHTML = `
        <div class="media-modal-backdrop"></div>
        <div class="media-modal-content"></div>
    `;
    document.body.appendChild(modal);
}

function openModal(iframeSrc, iframeAttributes = {}) {
    const content = modal.querySelector('.media-modal-content');

    const existing = modal.querySelector('iframe');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    Object.assign(iframe, iframeAttributes);
    content.appendChild(iframe);
    modal.classList.add('visible');
}

function closeModal() {
    modal.classList.remove('visible');
    setTimeout(() => {
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.remove();
    }, 200);
}

function onSongCardClick(card) {
    const trackId = card.getAttribute('data-spotify');
    openModal(`https://open.spotify.com/embed/track/${trackId}`, {
        style: 'border-radius: 12px',
        width: '100%',
        height: '352',
        frameBorder: '0',
        allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
    });
}

function onVideoCardClick(card) {
    const videoId = card.getAttribute('data-youtube');
    openModal(`https://www.youtube.com/embed/${videoId}?autoplay=1`, {
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullscreen: true
    });
}

function onModalBackgroundClick() {
    modal.classList.remove('visible');
    setTimeout(() => {
        const iframe = modal.querySelector('iframe');
        if (iframe) iframe.remove();
    }, 200);
}

// --- Contact ---
const YOUR_EMAIL = "raulayug@gmail.com";
function contact() {
    const subjectInput = document.getElementById("contact-subject");
    const messageInput = document.getElementById("contact-content");
    const subjectError = document.getElementById("subject-error");
    const messageError = document.getElementById("message-error");

    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    let hasError = false;

    if (!subject) {
        subjectInput.classList.add("error");
        subjectError.textContent = "Please add a subject.";
        subjectError.classList.add("visible");
        hasError = true;
    } else {
        subjectInput.classList.remove("error");
        subjectError.classList.remove("visible");
    }

    if (!message) {
        messageInput.classList.add("error");
        messageError.textContent = "Please add a message.";
        messageError.classList.add("visible");
        hasError = true;
    } else {
        messageInput.classList.remove("error");
        messageError.classList.remove("visible");
    }

    if (hasError) return;

    const mailtoLink =
        `mailto:${YOUR_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(message)}`;

    window.location.href = mailtoLink;
}

/*    
    --- EVENT LISTENERS ---
*/
// --- Header ---
headerHamburgerButton.addEventListener('click', () => hamburgerOpen());
headerRightLinks.forEach(link => {
    link.addEventListener('click', () => hamburgerClose());
});


// --- Writeup ---
heroMastersButton.addEventListener('click', () => navigate(DEST_MASTERS));
heroMultimediaButton.addEventListener('click', () => navigate(DEST_MUSIC));
heroRaushausButton.addEventListener('click', () => navigate(DEST_RAUSHAUS));

// --- Education ---
educationMastersButton.addEventListener('click', () => navigate(DEST_MASTERS));
educationUndergradButton.addEventListener('click', () => navigate(DEST_UNDERGRAD));

// --- Leadership ---
initTabSwitcher(leadershipButtons, leadershipDivs);

// --- Works ---
initTabSwitcher(worksButtons, worksDivs, initArticles);

// --- Works: Articles ---
window.addEventListener('resize', () => updateArticlesOnResize());

const worksArticleTitles = document.querySelectorAll('.article-title');
worksArticleTitles.forEach(title => {
    title.addEventListener('click', () => onArticleTitleClick(title));
});

// --- Works: Modals ---
const workModalBackdrop = modal.querySelector('.media-modal-backdrop');
workModalBackdrop.addEventListener('click', () => onModalBackgroundClick());

// --- Works: Chips ---
const workMediaChipContainer = document.querySelectorAll('.media-chip-container');
workMediaChipContainer.forEach(container => initCreditChips(container));

// --- Works: Song Cards ---
const workSongCards = document.querySelectorAll('.song-card');
workSongCards.forEach(card => {
    card.addEventListener('click', () => onSongCardClick(card));
});

// const workSongChipContainer = document.querySelectorAll('.song-chip-container');
// workSongChipContainer.forEach(container => initCreditChips(container));

// --- Works: Video Cards ---
const workVideoCards = document.querySelectorAll('.video-card');
workVideoCards.forEach(card => {
    card.addEventListener('click', () => onVideoCardClick(card));
});

// const workVideoChipContainer = document.querySelectorAll('.video-chip-container');
// workVideoChipContainer.forEach(container => initCreditChips(container));

// --- Skills ---
initTabSwitcher(skillsButtons, skillsDivs);

// --- Contact ---
contactButton.addEventListener('click', () => contact());