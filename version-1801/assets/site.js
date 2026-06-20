import { H as Hls } from './hls-vendor-dru42stk.js';
import { movies } from './search-data.js';

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupNavigation() {
    const toggle = qs('.nav-toggle');
    const nav = qs('.main-nav');
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
    });
}

function setupHero() {
    const hero = qs('[data-hero]');
    if (!hero) {
        return;
    }
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
        return;
    }
    let index = 0;
    const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    window.setInterval(() => show(index + 1), 5200);
}

function renderSearchResults(container, query) {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
        container.classList.remove('active');
        container.innerHTML = '';
        return;
    }
    const results = movies.filter((movie) => {
        const haystack = `${movie.title} ${movie.region} ${movie.year} ${movie.genre} ${movie.type}`.toLowerCase();
        return haystack.includes(keyword);
    }).slice(0, 12);
    container.innerHTML = results.length
        ? results.map((movie) => `
            <a href="./${movie.file}">
                <strong>${movie.title}</strong>
                <span>${movie.year} · ${movie.region} · ${movie.genre}</span>
            </a>
        `).join('')
        : '<a href="./movies.html"><strong>浏览全部影片</strong><span>换一个关键词继续查找</span></a>';
    container.classList.add('active');
}

function setupSearch() {
    qsa('.global-search').forEach((form) => {
        const input = qs('input[type="search"]', form);
        const container = qs('[data-search-results]', form.parentElement || document);
        if (!input || !container) {
            return;
        }
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            renderSearchResults(container, input.value);
        });
        input.addEventListener('input', () => renderSearchResults(container, input.value));
    });
}

function setupLocalFilter() {
    const filter = qs('[data-local-filter]');
    const list = qs('[data-card-list]');
    if (!filter || !list) {
        return;
    }
    const cards = qsa('.movie-card', list);
    const buttons = qsa('[data-filter]', filter);
    const apply = (value) => {
        buttons.forEach((button) => button.classList.toggle('active', button.dataset.filter === value));
        cards.forEach((card) => {
            const haystack = `${card.dataset.title || ''} ${card.dataset.region || ''} ${card.dataset.genre || ''} ${card.dataset.year || ''}`;
            const matched = value === 'all' || haystack.includes(value);
            card.style.display = matched ? '' : 'none';
        });
    };
    buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset.filter || 'all')));
    apply('all');
}

function setupPlayers() {
    qsa('[data-player]').forEach((box) => {
        const video = qs('video', box);
        const button = qs('.play-button', box);
        const source = box.getAttribute('data-stream');
        let initialized = false;
        let hls = null;
        if (!video || !button || !source) {
            return;
        }
        const start = () => {
            if (!initialized) {
                initialized = true;
                if (Hls && Hls.isSupported()) {
                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(() => {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', () => {
                        video.play().catch(() => {});
                    }, { once: true });
                } else {
                    button.querySelector('strong').textContent = '暂不支持播放';
                    return;
                }
            }
            box.classList.add('playing');
            video.play().catch(() => {});
        };
        button.addEventListener('click', start);
        box.addEventListener('click', (event) => {
            if (event.target === video) {
                return;
            }
            start();
        });
        video.addEventListener('play', () => box.classList.add('playing'));
        video.addEventListener('pause', () => {
            if (!video.ended) {
                return;
            }
            box.classList.remove('playing');
        });
        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

setupNavigation();
setupHero();
setupSearch();
setupLocalFilter();
setupPlayers();
