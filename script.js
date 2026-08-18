(function () {
  'use strict';

  const envelopeLanding = document.getElementById('envelope-landing');
  const openEnvelopeBtn = document.getElementById('open-envelope-btn');
  const story = document.getElementById('story');
  const openStoryBtn = document.getElementById('open-story-btn');
  const replayBtn = document.getElementById('replay-btn');
  const playBtn = document.getElementById('play-btn');
  const audio = document.getElementById('our-song');
  const reasonModal = document.getElementById('reason-modal');
  const reasonText = document.getElementById('reason-text');
  const closeReason = document.getElementById('close-reason');
  const petalsContainer = document.querySelector('.petals');

  let sectionObserver = null;
  let storyReady = false;

  /* ── Floating petals ── */
  function createPetals() {
    const symbols = ['♡', '❀', '✦', '🌸'];
    for (let i = 0; i < 12; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.textContent = symbols[i % symbols.length];
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDuration = 8 + Math.random() * 12 + 's';
      petal.style.animationDelay = Math.random() * 10 + 's';
      petal.style.fontSize = 0.8 + Math.random() * 0.8 + 'rem';
      petalsContainer.appendChild(petal);
    }
  }

  /* ── Scroll reveal ── */
  function observeSections() {
    if (sectionObserver) return;

    const sections = document.querySelectorAll('.section');

    sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    var hero = document.getElementById('hero');
    if (hero) hero.classList.add('visible');
  }

  function revealStory() {
    if (storyReady) return;
    storyReady = true;

    document.body.classList.add('story-open');
    story.classList.remove('hidden');
    observeSections();

    requestAnimationFrame(function () {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  function openEnvelope() {
    if (!envelopeLanding || envelopeLanding.classList.contains('is-opening')) return;

    envelopeLanding.classList.add('is-opening');

    window.setTimeout(function () {
      envelopeLanding.classList.add('is-opened');
      revealStory();
    }, 650);
  }

  function resetEnvelope() {
    storyReady = false;
    document.body.classList.remove('story-open');
    story.classList.add('hidden');

    if (envelopeLanding) {
      envelopeLanding.classList.remove('is-opening', 'is-opened');
    }

    document.querySelectorAll('.section').forEach(function (el) {
      el.classList.remove('visible');
    });
  }

  /* ── Envelope tap ── */
  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener('click', openEnvelope);
  }

  /* ── Open our story → scroll to chapters ── */
  if (openStoryBtn) {
    openStoryBtn.addEventListener('click', function () {
      var chapters = document.getElementById('chapters');
      if (chapters) {
        chapters.scrollIntoView({ behavior: 'smooth', block: 'start' });
        chapters.classList.add('visible');
      }
    });
  }

  /* ── Replay ── */
  if (replayBtn) {
    replayBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      document.querySelectorAll('.reason-card.opened').forEach(function (el) {
        el.classList.remove('opened');
      });

      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        playBtn.classList.remove('playing');
        playBtn.querySelector('.play-icon').textContent = '▶';
      }

      resetEnvelope();
    });
  }

  /* ── Reason cards ── */
  document.querySelectorAll('.reason-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var reason = card.getAttribute('data-reason');
      reasonText.textContent = reason;
      reasonModal.classList.remove('hidden');
      card.classList.add('opened');
    });
  });

  function closeModal() {
    reasonModal.classList.add('hidden');
  }

  if (closeReason) closeReason.addEventListener('click', closeModal);
  if (reasonModal) {
    var backdrop = reasonModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !reasonModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  /* ── Music player ── */
  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (!audio.src && audio.children.length === 0) {
        playBtn.style.transform = 'scale(0.95)';
        setTimeout(function () {
          playBtn.style.transform = '';
        }, 150);
        return;
      }

      if (audio.paused) {
        audio.play();
        playBtn.classList.add('playing');
        playBtn.querySelector('.play-icon').textContent = '❚❚';
      } else {
        audio.pause();
        playBtn.classList.remove('playing');
        playBtn.querySelector('.play-icon').textContent = '▶';
      }
    });
  }

  if (audio) {
    audio.addEventListener('ended', function () {
      playBtn.classList.remove('playing');
      playBtn.querySelector('.play-icon').textContent = '▶';
    });
  }

  /* ── Init ── */
  createPetals();
})();
