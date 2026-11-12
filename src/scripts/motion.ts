// "How it works" reveal-on-scroll, and the pause/play animations toggle.
const how = document.getElementById('how');
if (how && 'IntersectionObserver' in window) {
  how.classList.add('how-armed');
  const reveal = () => how.classList.add('how-in');
  const fallback = window.setTimeout(reveal, 2500);
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        window.setTimeout(reveal, 60);
        window.clearTimeout(fallback);
        io.disconnect();
      }
    },
    { threshold: 0.15 },
  );
  io.observe(how);
}

const toggle = document.getElementById('motion-toggle');
const page = document.getElementById('page');
if (toggle && page) {
  toggle.addEventListener('click', () => {
    const paused = page.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.querySelector<HTMLElement>('[data-state="playing"]')!.hidden = paused;
    toggle.querySelector<HTMLElement>('[data-state="paused"]')!.hidden = !paused;
  });
}
