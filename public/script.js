const root = document.documentElement;
const app = document.querySelector('.app');
const statusBanner = document.querySelector('[data-status-banner]');

const selectors = {
  hero: {
    badge: document.querySelector('[data-hero-badge]'),
    title: document.querySelector('[data-hero-title]'),
    highlight: document.querySelector('[data-hero-highlight]'),
    description: document.querySelector('[data-hero-description]'),
    primary: document.querySelector('[data-hero-primary]'),
    secondary: document.querySelector('[data-hero-secondary]'),
    vinyl: document.querySelector('[data-hero-vinyl]'),
    image: document.querySelector('[data-hero-image]')
  },
  exploreGrid: document.querySelector('[data-explore-grid]'),
  trendingCarousel: document.querySelector('[data-trending-carousel]'),
  playlistList: document.querySelector('[data-playlist-list]'),
  chartList: document.querySelector('[data-chart-list]'),
  nowPlaying: {
    container: document.querySelector('[data-now-playing]'),
    cover: document.querySelector('[data-now-cover]'),
    title: document.querySelector('[data-now-title]'),
    subtitle: document.querySelector('[data-now-subtitle]'),
    elapsed: document.querySelector('[data-now-elapsed]'),
    total: document.querySelector('[data-now-total]'),
    progress: document.querySelector('[data-now-progress]'),
    toggle: document.querySelector('[data-toggle]'),
    prev: document.querySelector('[data-prev]'),
    next: document.querySelector('[data-next]'),
    volume: document.querySelector('[data-volume]'),
    audio: document.querySelector('[data-audio-player]')
  }
};

const state = {
  overview: null,
  currentIndex: 0,
  playingFrom: 'trending',
  isPlaying: false
};

const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl) || '';

let parallaxFrame;

const parallax = (event) => {
  if (parallaxFrame) cancelAnimationFrame(parallaxFrame);

  parallaxFrame = requestAnimationFrame(() => {
    const rect = app.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    root.style.setProperty('--tilt-x', (y * 2).toFixed(3));
    root.style.setProperty('--tilt-y', (x * 2).toFixed(3));
  });
};

function toggleParallax(enable) {
  if (!app) return;
  if (enable) {
    app.addEventListener('pointermove', parallax);
    app.addEventListener('pointerleave', resetParallax);
  } else {
    app.removeEventListener('pointermove', parallax);
    app.removeEventListener('pointerleave', resetParallax);
    resetParallax();
  }
}

function resetParallax() {
  root.style.setProperty('--tilt-x', '0');
  root.style.setProperty('--tilt-y', '0');
}

function setStatus(message, variant = 'info', autoHideAfter = 4000) {
  if (!statusBanner) return;
  statusBanner.textContent = message;
  statusBanner.dataset.variant = variant;
  statusBanner.hidden = false;

  if (autoHideAfter > 0) {
    setTimeout(() => {
      statusBanner.hidden = true;
    }, autoHideAfter);
  }
}

function clearStatus() {
  if (statusBanner) {
    statusBanner.hidden = true;
  }
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

function createExploreCard(item) {
  const article = document.createElement('article');
  article.className = `card ${item.color}`;
  article.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <button class="chip" type="button">${item.label}</button>
  `;
  article.querySelector('button').addEventListener('click', () => {
    setStatus(`سيتم فتح ${item.title} قريبًا`, 'info');
  });
  return article;
}

function createTrendingCard(track, index) {
  const card = document.createElement('div');
  card.className = 'album-card glass-panel tilt';
  card.innerHTML = `
    <img src="${track.cover}" alt="غلاف ${track.title}" />
    <div class="album-info">
      <h3>${track.title}</h3>
      <p>${track.artist}</p>
    </div>
    <button class="icon-btn play" type="button" aria-label="تشغيل ${track.title}">▶</button>
  `;
  const playBtn = card.querySelector('button');
  playBtn.addEventListener('click', () => handlePlayRequest(index));
  return card;
}

function createPlaylistItem(item) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="badge">${item.badge ?? ''}</span>
    <div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </div>
    <button class="icon-btn" type="button" aria-label="تشغيل قائمة ${item.title}">▶</button>
  `;
  li.querySelector('button').addEventListener('click', () => {
    setStatus(`سيتم إضافة ${item.title} إلى قائمة التشغيل قريبًا`, 'info');
  });
  return li;
}

function createChartItem(item, index) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="rank">${index + 1}</span>
    <div>
      <h3>${item.title}</h3>
      <p>${item.artist}</p>
    </div>
  `;
  return li;
}

function renderHero(hero) {
  const { badge, title, highlight, description, primary, secondary, vinyl, image } = selectors.hero;
  if (!hero) return;
  if (badge) badge.textContent = hero.badge;
  if (title) title.textContent = `${hero.title} `;
  if (highlight) highlight.textContent = hero.highlight;
  if (description) description.textContent = hero.description;
  if (primary) {
    primary.textContent = hero.primaryAction.label;
    primary.onclick = () => window.open(hero.primaryAction.url, '_blank');
  }
  if (secondary) {
    secondary.textContent = hero.secondaryAction.label;
    secondary.onclick = () => window.open(hero.secondaryAction.url, '_blank');
  }
  if (vinyl) {
    vinyl.style.display = hero.vinyl ? 'block' : 'none';
  }
  if (image) {
    image.src = hero.image;
  }
}

function renderExplore(explore) {
  if (!selectors.exploreGrid) return;
  selectors.exploreGrid.innerHTML = '';
  explore.forEach((item) => selectors.exploreGrid.appendChild(createExploreCard(item)));
}

function renderTrending(trending) {
  if (!selectors.trendingCarousel) return;
  selectors.trendingCarousel.innerHTML = '';
  trending.forEach((track, index) => selectors.trendingCarousel.appendChild(createTrendingCard(track, index)));
}

function renderPlaylists(playlists) {
  if (!selectors.playlistList) return;
  selectors.playlistList.innerHTML = '';
  playlists.forEach((playlist) => selectors.playlistList.appendChild(createPlaylistItem(playlist)));
}

function renderCharts(charts) {
  if (!selectors.chartList) return;
  selectors.chartList.innerHTML = '';
  charts.forEach((item, index) => selectors.chartList.appendChild(createChartItem(item, index)));
}

function updateNowPlayingDisplay(track) {
  const { cover, title, subtitle, elapsed, total, progress, toggle, audio } = selectors.nowPlaying;
  if (!track || !cover || !title || !subtitle || !elapsed || !total || !progress || !toggle || !audio) {
    return;
  }
  cover.src = track.cover;
  title.textContent = track.title;
  subtitle.textContent = `${track.artist} · ${track.category ?? 'موسيقى'}`;
  elapsed.textContent = formatTime(track.progress?.elapsed ?? 0);
  total.textContent = formatTime(track.progress?.total ?? track.duration ?? 0);
  const percentage = track.progress?.total
    ? ((track.progress.elapsed ?? 0) / track.progress.total) * 100
    : 0;
  progress.style.width = `${percentage}%`;
  toggle.disabled = !track.previewUrl;
  if (!track.previewUrl) {
    audio.removeAttribute('src');
  }
}

function handlePlayRequest(index) {
  state.currentIndex = index;
  state.playingFrom = 'trending';
  const track = state.overview.trending[index];
  preparePlayback(track);
  playAudio();
}

function preparePlayback(track) {
  const { audio, progress } = selectors.nowPlaying;
  if (!audio || !progress || !selectors.nowPlaying.toggle) return;
  audio.pause();
  if (track.previewUrl) {
    audio.src = track.previewUrl;
    audio.currentTime = track.progress?.elapsed ?? 0;
  } else {
    setStatus('لا يتوفر معاينة صوتية لهذا المسار.', 'warning');
    state.isPlaying = false;
    selectors.nowPlaying.toggle.textContent = '⏯';
  }
  progress.style.width = '0%';
  updateNowPlayingDisplay(track);
}

function playAudio() {
  const { audio, toggle } = selectors.nowPlaying;
  if (!audio || !audio.src) return;
  audio
    .play()
    .then(() => {
      state.isPlaying = true;
      toggle.textContent = '⏸';
    })
    .catch(() => setStatus('تعذر تشغيل المعاينة الصوتية.', 'error'));
}

function pauseAudio() {
  const { audio, toggle } = selectors.nowPlaying;
  if (!audio) return;
  audio.pause();
  state.isPlaying = false;
  toggle.textContent = '⏯';
}

function togglePlayback() {
  if (state.isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function setupNowPlayingControls() {
  const { toggle, prev, next, volume, audio } = selectors.nowPlaying;
  if (!toggle || !audio) return;

  toggle.addEventListener('click', () => {
    if (!audio.src) {
      if (!state.overview?.trending?.length) {
        setStatus('لا توجد قائمة تشغيل متاحة حالياً.', 'warning');
        return;
      }
      handlePlayRequest(state.currentIndex);
      return;
    }
    togglePlayback();
  });

  prev.addEventListener('click', () => {
    if (!state.overview?.trending?.length) return;
    state.currentIndex = (state.currentIndex - 1 + state.overview.trending.length) % state.overview.trending.length;
    handlePlayRequest(state.currentIndex);
  });

  next.addEventListener('click', () => {
    if (!state.overview?.trending?.length) return;
    state.currentIndex = (state.currentIndex + 1) % state.overview.trending.length;
    handlePlayRequest(state.currentIndex);
  });

  volume.addEventListener('input', (event) => {
    const value = Number(event.target.value) / 100;
    audio.volume = value;
  });

  audio.addEventListener('timeupdate', () => {
    const track = state.overview?.trending?.[state.currentIndex];
    const percentage = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    selectors.nowPlaying.progress.style.width = `${percentage}%`;
    selectors.nowPlaying.elapsed.textContent = formatTime(audio.currentTime);
    selectors.nowPlaying.total.textContent = formatTime(audio.duration || track?.duration);
  });

  audio.addEventListener('loadedmetadata', () => {
    const track = state.overview?.trending?.[state.currentIndex];
    selectors.nowPlaying.total.textContent = formatTime(audio.duration || track?.duration);
  });

  audio.addEventListener('ended', () => {
    state.isPlaying = false;
    selectors.nowPlaying.toggle.textContent = '⏯';
  });
}

function setupHoverReveals() {
  const nowPlaying = selectors.nowPlaying.container;
  if (!nowPlaying) return;
  let revealTimeout;
  const show = () => {
    nowPlaying.style.opacity = '1';
    nowPlaying.style.transform = 'translateY(0)';
  };
  const hide = () => {
    nowPlaying.style.opacity = '0.4';
    nowPlaying.style.transform = 'translateY(20px)';
  };
  nowPlaying.addEventListener('mouseenter', () => {
    clearTimeout(revealTimeout);
    show();
  });
  nowPlaying.addEventListener('mouseleave', () => {
    revealTimeout = setTimeout(hide, 800);
  });
  hide();
}

function setupMotionPreferences() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyTilt = () => {
    const cards = document.querySelectorAll('.card, .album-card, .tilt');
    cards.forEach((card) => {
      const baseTransform = card.style.transform;
      card.dataset.baseTransform = baseTransform;
      let frame;
      const onMove = (event) => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / rect.height) * -8;
          const rotateY = ((x - centerX) / rect.width) * 8;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
      };
      const onLeave = () => {
        if (frame) cancelAnimationFrame(frame);
        card.style.transform = card.dataset.baseTransform || 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
    });
  };

  if (!prefersReducedMotion.matches) {
    applyTilt();
    toggleParallax(true);
  }

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      toggleParallax(false);
    } else {
      toggleParallax(true);
      applyTilt();
    }
  });
}

async function loadOverview() {
  try {
    setStatus('جاري تحميل التجربة الصوتية...', 'info', 0);
    const response = await fetch(`${API_BASE}/api/media/overview`);
    if (!response.ok) {
      throw new Error('تعذر تحميل البيانات');
    }
    const data = await response.json();
    state.overview = data;
    state.currentIndex = 0;
    renderHero(data.hero);
    renderExplore(data.explore);
    renderTrending(data.trending);
    renderPlaylists(data.playlists);
    renderCharts(data.charts);
    updateNowPlayingDisplay(data.nowPlaying);
    if (data.nowPlaying?.previewUrl && selectors.nowPlaying.audio) {
      selectors.nowPlaying.audio.src = data.nowPlaying.previewUrl;
      selectors.nowPlaying.audio.currentTime = data.nowPlaying.progress?.elapsed ?? 0;
    }
    setupMotionPreferences();
    clearStatus();
  } catch (error) {
    console.error(error);
    setStatus('حدث خطأ أثناء تحميل البيانات. الرجاء المحاولة لاحقًا.', 'error', 6000);
  }
}

setupNowPlayingControls();
setupHoverReveals();
loadOverview();
