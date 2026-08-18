(function () {
  'use strict';

  const openStoryBtn = document.getElementById('open-story-btn');
  const replayBtn = document.getElementById('replay-btn');
  const playBtn = document.getElementById('play-btn');
  const audio = document.getElementById('our-song');
  const reasonModal = document.getElementById('reason-modal');
  const reasonText = document.getElementById('reason-text');
  const closeReason = document.getElementById('close-reason');
  const petalsContainer = document.querySelector('.petals');

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

      document.querySelectorAll('.section').forEach(function (el) {
        el.classList.remove('visible');
      });

      document.querySelectorAll('.reason-card.opened').forEach(function (el) {
        el.classList.remove('opened');
      });

      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        playBtn.classList.remove('playing');
        playBtn.querySelector('.play-icon').textContent = '▶';
      }

      var hero = document.getElementById('hero');
      if (hero) hero.classList.add('visible');
    });
  }

  /* ── Scroll reveal ── */
  function observeSections() {
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver(
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
      observer.observe(section);
    });

    var hero = document.getElementById('hero');
    if (hero) hero.classList.add('visible');
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
  observeSections();
})();
