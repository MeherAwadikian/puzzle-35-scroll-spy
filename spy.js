// Scroll-spy: highlight the sidebar link for whichever section is currently
// in view, using IntersectionObserver (async, off-main-thread) rather than a
// throttled scroll-position calculation.

(function () {
  const links = Array.from(document.querySelectorAll('#toc a[data-target]'));
  const linkById = new Map(links.map((a) => [a.dataset.target, a]));
  const sections = links
    .map((a) => document.getElementById(a.dataset.target))
    .filter(Boolean);

  const order = sections.map((s) => s.id);
  // Track visibility ratios so that when several sections are on screen we can
  // pick the top-most visible one deterministically instead of whichever fired
  // last.
  const visible = new Map();

  function setActive(id) {
    links.forEach((a) => a.classList.toggle('active', a.dataset.target === id));
    const label = document.getElementById('progress-label');
    const fill = document.getElementById('progress-fill');
    if (label) label.textContent = linkById.get(id)?.textContent || '';
    if (fill) {
      const idx = order.indexOf(id);
      const pct = order.length > 1 ? (idx / (order.length - 1)) * 100 : 0;
      fill.style.width = pct + '%';
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.set(entry.target.id, entry.intersectionRatio);
        } else {
          visible.delete(entry.target.id);
        }
      }
      if (visible.size > 0) {
        // Pick the first section in document order that's currently visible —
        // matches what a reader perceives as "the section I'm in."
        const activeId = order.find((id) => visible.has(id));
        if (activeId) setActive(activeId);
      }
    },
    {
      // Bias the trigger band toward the top third of the viewport so the
      // highlighted item matches where the reader is actually looking.
      rootMargin: '0px 0px -65% 0px',
      threshold: [0, 0.1, 0.5, 1],
    }
  );

  sections.forEach((s) => observer.observe(s));

  // Initialize on load (before any scroll) so the first item is active.
  setActive(order[0]);
})();
