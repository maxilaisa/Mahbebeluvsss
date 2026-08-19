(function () {
  'use strict';

  const lockScreen = document.getElementById('lock-screen');
  const pinBoxes = document.querySelectorAll('.pin-box');
  const lockError = document.getElementById('lock-error');
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
  let isLocked = true;

  /* ── Lock Screen ── */
  function setupLockScreen() {
    pinBoxes.forEach(function (box, index) {
      box.addEventListener('input', function (e) {
        const value = e.target.value;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) {
          e.target.value = '';
          return;
        }

        if (value.length === 1) {
          e.target.classList.add('filled');
          // Move to next box
          if (index < pinBoxes.length - 1) {
            pinBoxes[index + 1].focus();
          } else {
            // Last box filled, check code
            checkPin();
          }
        } else {
          e.target.classList.remove('filled');
        }
      });

      box.addEventListener('keydown', function (e) {
        // Handle backspace
        if (e.key === 'Backspace' && !e.target.value) {
          if (index > 0) {
            pinBoxes[index - 1].focus();
            pinBoxes[index - 1].value = '';
            pinBoxes[index - 1].classList.remove('filled');
          }
        }
        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
          pinBoxes[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < pinBoxes.length - 1) {
          pinBoxes[index + 1].focus();
        }
      });

      box.addEventListener('paste', function (e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 4);
        const digits = pastedData.replace(/\D/g, '');
        
        digits.split('').forEach(function (digit, i) {
          if (pinBoxes[i]) {
            pinBoxes[i].value = digit;
            pinBoxes[i].classList.add('filled');
          }
        });

        if (digits.length === 4) {
          checkPin();
        } else if (digits.length > 0) {
          pinBoxes[Math.min(digits.length, 3)].focus();
        }
      });
    });

    // Focus first box on load
    if (pinBoxes.length > 0) {
      pinBoxes[0].focus();
    }
  }

  function checkPin() {
    const pin = Array.from(pinBoxes).map(function (box) {
      return box.value;
    }).join('');

    if (pin === '0611') {
      unlockScreen();
    } else {
      showError();
    }
  }

  function unlockScreen() {
    isLocked = false;
    lockScreen.classList.add('is-unlocked');
    
    // Reset pin boxes for replay
    pinBoxes.forEach(function (box) {
      box.value = '';
      box.classList.remove('filled');
    });
    lockError.classList.add('hidden');
  }

  function showError() {
    lockError.classList.remove('hidden');
    
    // Shake animation
    pinBoxes.forEach(function (box) {
      box.style.animation = 'none';
      box.offsetHeight; // Trigger reflow
      box.style.animation = 'shake 0.5s ease';
    });

    // Clear and reset
    setTimeout(function () {
      pinBoxes.forEach(function (box) {
        box.value = '';
        box.classList.remove('filled');
        box.style.animation = '';
      });
      pinBoxes[0].focus();
      
      setTimeout(function () {
        lockError.classList.add('hidden');
      }, 2000);
    }, 500);
  }

  // Override openEnvelope to check lock first
  const originalOpenEnvelope = function () {
    if (isLocked) {
      lockScreen.classList.remove('is-unlocked');
      pinBoxes[0].focus();
      return;
    }
    
    if (!envelopeLanding || envelopeLanding.classList.contains('is-opening')) return;

    envelopeLanding.classList.add('is-opening');

    window.setTimeout(function () {
      envelopeLanding.classList.add('is-opened');
      revealStory();
    }, 650);
  };

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
    isLocked = true;
    document.body.classList.remove('story-open');
    story.classList.add('hidden');

    if (envelopeLanding) {
      envelopeLanding.classList.remove('is-opening', 'is-opened');
    }

    // Show lock screen again
    lockScreen.classList.remove('is-unlocked');
    pinBoxes[0].focus();

    document.querySelectorAll('.section').forEach(function (el) {
      el.classList.remove('visible');
    });
  }

  /* ── Envelope tap ── */
  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener('click', originalOpenEnvelope);
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
  setupLockScreen();
})();
