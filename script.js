const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ================================
   HEADER, SCROLL PROGRESS & BACK TO TOP
================================ */

const header = $('.site-header');
const progress = $('#progressBar');
const backTop = $('#backTop');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;

  progress.style.width =
    `${max > 0 ? (scrollTop / max) * 100 : 0}%`;

  header.classList.toggle('scrolled', scrollTop > 30);
  backTop.classList.toggle('show', scrollTop > 500);
});

backTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

/* ================================
   MOBILE NAVIGATION
================================ */

const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});

$$('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ================================
   REVEAL ANIMATIONS
================================ */

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

$$('.reveal').forEach(el => {
  revealObserver.observe(el);
});

/* ================================
   ANIMATED COUNTERS
================================ */

const counters = $$('.stat strong');
let countersStarted = false;

const statsSection = $('.stats-section');

if (statsSection) {
  const counterObserver = new IntersectionObserver(
    entries => {
      if (!entries[0].isIntersecting || countersStarted) {
        return;
      }

      countersStarted = true;

      counters.forEach(el => {
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1200;

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);

          el.textContent = Math.floor(target * eased);

          if (p < 1) {
            requestAnimationFrame(tick);
          }
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );

  counterObserver.observe(statsSection);
}

/* ================================
   GALLERY + VIDEO MODAL
================================ */

const modal = $('#imageModal');
const modalImage = $('#modalImage');
const modalVideo = $('#modalVideo');
const modalVideoSource = $('#modalVideoSource');
const modalCaption = $('#modalCaption');

$$('.gallery-item').forEach(item => {
  item.addEventListener('click', e => {

    // Check whether the gallery item contains a video.
    const video = item.querySelector('video');

    if (video) {
      e.preventDefault();

      const source = video.querySelector('source');

      if (!source) return;

      modalImage.style.display = 'none';
      modalVideo.style.display = 'block';

      modalVideoSource.src = source.src;
      modalVideo.load();

      modalCaption.textContent =
        item.dataset.title || 'Work References';

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');

      document.body.style.overflow = 'hidden';

      modalVideo.play().catch(() => {
        // Playback may require user interaction.
      });

      return;
    }

    // Otherwise, open the image modal.
    const image = item.querySelector('img');

    if (!image) return;

    modalVideo.pause();
    modalVideo.style.display = 'none';

    modalImage.style.display = 'block';

    modalImage.src =
      item.dataset.image || image.src;

    modalImage.alt =
      item.dataset.title || image.alt;

    modalCaption.textContent =
      item.dataset.title || image.alt;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    document.body.style.overflow = 'hidden';
  });
});

/* ================================
   CLOSE GALLERY MODAL
================================ */

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');

  // Stop video playback.
  modalVideo.pause();
  modalVideo.currentTime = 0;

  // Clear the video source.
  modalVideoSource.src = '';
  modalVideo.load();

  document.body.style.overflow = '';
}

// Close button.
$('#modalClose').addEventListener('click', closeModal);

// Close when clicking outside the modal.
modal.addEventListener('click', e => {
  if (e.target === modal) {
    closeModal();
  }
});

// Close when pressing Escape.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

/* ================================
   AUTOMATIC COPYRIGHT YEAR
================================ */

$('#year').textContent = new Date().getFullYear();

/* ================================
   CONTACT FORM — GOOGLE SHEETS
================================ */

const contactForm = $('#contactForm');
const formNote = $('#formNote');

const submitButton = contactForm.querySelector(
  'button[type="submit"]'
);

// Your deployed Google Apps Script Web App URL.
const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxVfW9q-7WvY85XDxAUZ1A8NPYM7AS42spZPtsZ4eNO5CDwOIZE2l4KKN8uQCcfsGbf/exec';

contactForm.addEventListener('submit', async e => {
  e.preventDefault();

  // Validate the required form fields.
  if (!contactForm.reportValidity()) {
    return;
  }

  // Prevent duplicate submissions while a request is in progress.
  if (submitButton.disabled) {
    return;
  }

  // Collect the form values.
  const formData = Object.fromEntries(
    new FormData(contactForm).entries()
  );

  submitButton.disabled = true;
  formNote.textContent = 'Submitting your project inquiry...';

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(formData)
    });

    /*
      IMPORTANT:
      With no-cors, the browser cannot read the Apps Script
      response. This message does not prove that the inquiry
      was saved or that the notification email was sent.
    */

    formNote.textContent =
      'Your request has been submitted. For urgent inquiries, please email avodahconstructionph@gmail.com.';

    contactForm.reset();

  } catch (error) {
    console.error(
      'AVODAH inquiry submission error:',
      error
    );

    formNote.textContent =
      'We could not confirm your request. Please email avodahconstructionph@gmail.com or try again.';

  } finally {
    submitButton.disabled = false;
  }
});
