const root = document.documentElement;
const app = document.querySelector('.app');

let appFrame;
const parallax = (event) => {
  if (appFrame) cancelAnimationFrame(appFrame);

  appFrame = requestAnimationFrame(() => {
    const rect = app.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    root.style.setProperty('--tilt-x', (y * 2).toFixed(3));
    root.style.setProperty('--tilt-y', (x * 2).toFixed(3));
  });
};

app?.addEventListener('pointermove', parallax);
app?.addEventListener('pointerleave', () => {
  root.style.setProperty('--tilt-x', '0');
  root.style.setProperty('--tilt-y', '0');
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches) {
  const cards = document.querySelectorAll('.card, .album-card, .tilt');

  cards.forEach((card) => {
    const baseTransform = card.style.transform;
    card.dataset.baseTransform = baseTransform;
    let frame;
    card.addEventListener('pointermove', (event) => {
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
    });

    card.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      card.style.transform =
        baseTransform || 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      cards.forEach((card) => {
        card.style.transform = card.dataset.baseTransform || '';
      });
    }
  });
}

const nowPlaying = document.querySelector('.now-playing');

if (nowPlaying) {
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
