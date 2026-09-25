const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const header = $('.site-header');
const progress = $('#progressBar');
const backTop = $('#backTop');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  progress.style.width = `${(scrollTop / max) * 100}%`;
  header.classList.toggle('scrolled', scrollTop > 30);
  backTop.classList.toggle('show', scrollTop > 500);
});

backTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold:0.12});
$$('.reveal').forEach(el => revealObserver.observe(el));

const counters = $$('.stat strong');
let countersStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || countersStarted) return;
  countersStarted = true;
  counters.forEach(el => {
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1200;
    function tick(now){
      const p = Math.min((now-start)/duration,1);
      const eased = 1 - Math.pow(1-p,3);
      el.textContent = Math.floor(target*eased);
      if(p<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, {threshold:.4});
counterObserver.observe($('.stats-section'));

/* ================================
   GALLERY + VIDEO MODAL
================================ */

const modal = $('#imageModal');
const modalImage = $('#modalImage');
const modalVideo = $('#modalVideo');
const modalVideoSource = $('#modalVideoSource');
const modalCaption = $('#modalCaption');

$$('.gallery-item').forEach(item => {

  item.addEventListener('click', (e) => {

    /*
      If this gallery item contains a video,
      open the video modal.
    */
    const video = item.querySelector('video');

    if (video) {

      e.preventDefault();

      const source = video.querySelector('source');

      if (!source) return;

      // Hide image
      modalImage.style.display = 'none';

      // Show video
      modalVideo.style.display = 'block';

      // Set video source
      modalVideoSource.src = source.src;
      modalVideo.load();

      // Caption
      modalCaption.textContent =
        item.dataset.title || 'Work References';

      // Open modal
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');

      document.body.style.overflow = 'hidden';

      // Start playing
      modalVideo.play().catch(() => {
        // Browser may block autoplay until user interacts
      });

      return;
    }

    /*
      Otherwise, treat it as a normal image.
    */

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
   CLOSE MODAL
================================ */

function closeModal(){

  modal.classList.remove('open');

  modal.setAttribute('aria-hidden', 'true');

  // Stop video
  modalVideo.pause();

  modalVideo.currentTime = 0;

  // Remove video source
  modalVideoSource.src = '';

  modalVideo.load();

  document.body.style.overflow = '';

}


/* Close button */

$('#modalClose').addEventListener(
  'click',
  closeModal
);


/* Click outside */

modal.addEventListener('click', e => {

  if(e.target === modal){
    closeModal();
  }

});


/* ESC key */

document.addEventListener('keydown', e => {

  if(e.key === 'Escape'){
    closeModal();
  }

});

$('#year').textContent = new Date().getFullYear();

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const subject = encodeURIComponent(`Project Inquiry — ${form.get('project')}`);
  const body = encodeURIComponent(
`Name: ${form.get('name')}
Email / Phone: ${form.get('contact')}
Project Type: ${form.get('project')}

Project Details:
${form.get('message')}`
  );
  const mailto = `mailto:avodahconstructionph@gmail.com?subject=${subject}&body=${body}`;
  const note = $('#formNote');
  note.textContent = 'Opening your email app…';
  window.location.href = mailto;
  setTimeout(() => note.textContent = 'If your email app did not open, email avodahconstructionph@gmail.com directly.', 1600);
});
