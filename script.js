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
  const firstMessageModal = document.getElementById('first-message-modal');
  const firstMessageText = document.getElementById('first-message-text');
  const petalsContainer = document.querySelector('.petals');
  const errorOverlay = document.getElementById('error-overlay');
  const errorMessages = document.getElementById('error-messages');
  const continueBtn = document.getElementById('continue-btn');

  let sectionObserver = null;
  let storyReady = false;
  let isLocked = true;
  let openedNormalCards = 0;
  const totalNormalCards = 5;
  const specialMessages = [
    "I love your eyes.",
    "I love the way you fix your hair.",
    "I love the way you know what I want and still give me permission to do it.",
    "I love the way you still talk to me even when we're arguing.",
    "I love the way you choose me even when it's hard.",
    "I love the way you never give up on me.",
    "I love the way you comfort me whenever I'm sad.",
    "I love your warmth.",
    "I love your jokes.",
    "I love your smile.",
    "I love your thoughts.",
    "I love your words.",
    "I love your heart.",
    "I love your vibe.",
    "I love your true self.",
    "I love your support.",
    "I love your bravery.",
    "I love your music taste.",
    "I love your favorite color.",
    "I love your honesty.",
    "I love your kindness.",
    "I love your creativity.",
    "I love your presence.",
    "I love your gentleness.",
    "I love the little things you do without even realizing how much they mean to me.",
    "I love every memory we've made together.",
    "I love the way you make ordinary moments feel special.",
    "I love the person you are, the person you're becoming, and every little part of you that makes you you."
  ];

  /* ── Lock Screen ── */
  function setupLockScreen() {
    const keypadBtns = document.querySelectorAll('.keypad-btn');

    keypadBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const num = btn.getAttribute('data-num');
        const action = btn.getAttribute('data-action');

        if (num !== null) {
          // Number button pressed
          enterNumber(num);
        } else if (action === 'clear') {
          // Clear button pressed
          clearPin();
        } else if (action === 'submit') {
          // Submit button pressed
          checkPin();
        }
      });
    });

    // Allow clicking on pin boxes to focus (for visual feedback)
    pinBoxes.forEach(function (box, index) {
      box.addEventListener('click', function () {
        // Find first empty box and focus it
        for (let i = 0; i < pinBoxes.length; i++) {
          if (!pinBoxes[i].value) {
            pinBoxes[i].focus();
            return;
          }
        }
        // If all filled, focus last one
        pinBoxes[pinBoxes.length - 1].focus();
      });
    });

    // Keyboard support as backup
    document.addEventListener('keydown', function (e) {
      if (!isLocked) return;
      
      if (/^\d$/.test(e.key)) {
        enterNumber(e.key);
      } else if (e.key === 'Backspace') {
        deleteLastNumber();
      } else if (e.key === 'Enter') {
        checkPin();
      } else if (e.key === 'Escape') {
        clearPin();
      }
    });
  }

  function enterNumber(num) {
    // Find first empty box
    for (let i = 0; i < pinBoxes.length; i++) {
      if (!pinBoxes[i].value) {
        pinBoxes[i].value = num;
        pinBoxes[i].classList.add('filled');
        
        // Check if all boxes are filled
        if (i === pinBoxes.length - 1) {
          checkPin();
        }
        return;
      }
    }
  }

  function deleteLastNumber() {
    // Find last filled box
    for (let i = pinBoxes.length - 1; i >= 0; i--) {
      if (pinBoxes[i].value) {
        pinBoxes[i].value = '';
        pinBoxes[i].classList.remove('filled');
        return;
      }
    }
  }

  function clearPin() {
    pinBoxes.forEach(function (box) {
      box.value = '';
      box.classList.remove('filled');
    });
    lockError.classList.add('hidden');
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
      clearPin();
      pinBoxes.forEach(function (box) {
        box.style.animation = '';
      });
      
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
    openedNormalCards = 0;
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

    // Reset reason cards
    document.querySelectorAll('.reason-card').forEach(function (card) {
      card.classList.remove('opened');
    });

    // Reset special card
    const specialCard = document.querySelector('.reason-special');
    if (specialCard) {
      specialCard.classList.add('locked');
      specialCard.classList.remove('unlocked');
      specialCard.setAttribute('data-opened', '0');
      specialCard.querySelector('.reason-icon').textContent = '🔒';
      specialCard.querySelector('.reason-label').textContent = '???';
    }
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
      const isSpecial = card.getAttribute('data-special') === 'true';
      
      if (isSpecial) {
        // Check if unlocked
        if (openedNormalCards < totalNormalCards) {
          // Still locked, don't open
          return;
        }
        // Unlocked, show special messages
        showSpecialMessages();
        return;
      }

      // Normal card
      var reason = card.getAttribute('data-reason');
      reasonText.textContent = reason;
      reasonModal.classList.remove('hidden');
      
      if (!card.classList.contains('opened')) {
        card.classList.add('opened');
        openedNormalCards++;
        updateSpecialCard();
      }
    });
  });

  function updateSpecialCard() {
    const specialCard = document.querySelector('.reason-special');
    if (!specialCard) return;

    specialCard.setAttribute('data-opened', openedNormalCards);

    if (openedNormalCards >= totalNormalCards) {
      specialCard.classList.remove('locked');
      specialCard.classList.add('unlocked');
      specialCard.querySelector('.reason-icon').textContent = '💖';
      specialCard.querySelector('.reason-label').textContent = 'Open me!';
    }
  }

  function showSpecialMessages() {
    errorOverlay.classList.remove('hidden');
    continueBtn.classList.add('hidden');
    errorMessages.innerHTML = '';

    // Show first message in the center normally (no close button)
    const firstMessage = specialMessages[0];
    firstMessageText.textContent = firstMessage;
    firstMessageModal.classList.remove('hidden');

    // After 3 seconds, hide modal and start popping up rest of messages
    setTimeout(function () {
      firstMessageModal.classList.add('hidden');
      
      const usedPositions = [];
      let index = 1; // Start from index 1 (skip first message)
      
      function showNextMessage() {
        if (index >= specialMessages.length) {
          // All messages shown, show continue button
          continueBtn.classList.remove('hidden');
          return;
        }

        const message = specialMessages[index];
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        
        // Random size between 0.85rem and 1.15rem
        const randomSize = 0.85 + Math.random() * 0.3;
        errorEl.style.fontSize = randomSize + 'rem';
        
        // Calculate safe random position to avoid overlap
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const messageWidth = Math.min(300, containerWidth * 0.35);
        const messageHeight = 70;
        
        let randomX, randomY;
        let attempts = 0;
        let foundPosition = false;
        
        // Try to find a position that doesn't overlap too much
        while (!foundPosition && attempts < 30) {
          randomX = Math.max(30, Math.random() * (containerWidth - messageWidth - 60));
          randomY = Math.max(30, Math.random() * (containerHeight - messageHeight - 60));
          
          // Check if this position overlaps with existing messages
          let overlaps = false;
          for (const pos of usedPositions) {
            const dx = Math.abs(randomX - pos.x);
            const dy = Math.abs(randomY - pos.y);
            // Increased overlap threshold for better spacing
            if (dx < 180 && dy < 100) {
              overlaps = true;
              break;
            }
          }
          
          if (!overlaps) {
            foundPosition = true;
          }
          attempts++;
        }
        
        usedPositions.push({ x: randomX, y: randomY });
        
        errorEl.style.left = randomX + 'px';
        errorEl.style.top = randomY + 'px';
        errorEl.style.maxWidth = messageWidth + 'px';
        errorEl.style.zIndex = index + 1;
        
        // Make message draggable
        makeDraggable(errorEl);
        
        errorMessages.appendChild(errorEl);
        
        index++;
        setTimeout(showNextMessage, 800);
      }

      showNextMessage();
    }, 3000);
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', function () {
      // Add disappearing animation to all messages
      const messages = errorMessages.querySelectorAll('.error-message');
      messages.forEach(function (msg, index) {
        setTimeout(function () {
          msg.classList.add('disappearing');
        }, index * 50); // Stagger the disappear animation
      });

      // Hide overlay after all animations complete
      setTimeout(function () {
        errorOverlay.classList.add('hidden');
        errorMessages.innerHTML = '';
      }, messages.length * 50 + 500);
    });
  }

  function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      element.style.cursor = 'grabbing';
      element.style.zIndex = 1000; // Bring to front while dragging
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      element.style.left = (initialX + dx) + 'px';
      element.style.top = (initialY + dy) + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.zIndex = parseInt(element.getAttribute('data-original-zindex')) || 1;
      }
    });

    // Touch support for mobile
    element.addEventListener('touchstart', function (e) {
      isDragging = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      element.style.cursor = 'grabbing';
      element.style.zIndex = 1000;
    });

    document.addEventListener('touchmove', function (e) {
      if (!isDragging) return;

      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      element.style.left = (initialX + dx) + 'px';
      element.style.top = (initialY + dy) + 'px';
    });

    document.addEventListener('touchend', function () {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.zIndex = parseInt(element.getAttribute('data-original-zindex')) || 1;
      }
    });

    element.style.cursor = 'grab';
  }

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
