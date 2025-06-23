// Utility Functions
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

const trapFocus = (modal) => {
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
};

// Cached Selectors
const selectors = {
  themeButton: document.querySelector('.btn-bd-primary'),
  themeIcon: document.querySelector('.theme-icon-active use'),
  themeText: document.getElementById('bd-theme-text'),
  themeButtons: document.querySelectorAll('[data-bs-theme-value]'),
  animateElements: document.querySelectorAll('.animate-reveal, .testimonials'),
  form: document.getElementById('contact-form'),
  feedback: document.getElementById('form-feedback'),
  featureImages: document.querySelectorAll('.featurette-image'),
  portfolioCards: document.querySelectorAll('.portfolio-card'),
  loadMoreButton: document.getElementById('loadMore'),
  hiddenCards: document.querySelectorAll('.portfolio-card.hidden'),
  preloader: document.getElementById('preloader'),
  backToTop: document.createElement('button'),
  anchors: document.querySelectorAll('a[href^="#"]')
};

// Theme Toggle
function initializeThemeToggle() {
  if (!selectors.themeButton || !selectors.themeIcon || !selectors.themeText) return;

  selectors.themeButton.setAttribute('aria-label', 'Toggle theme (current: auto)');

  const savedTheme = localStorage.getItem('theme') || 'auto';
  setTheme(savedTheme);

  selectors.themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-bs-theme-value');
      setTheme(theme);
      localStorage.setItem('theme', theme);
      selectors.themeButton.setAttribute('aria-label', `Toggle theme (current: ${theme})`);
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', debounce(() => {
    if (localStorage.getItem('theme') === 'auto') {
      setTheme('auto');
    }
  }, 200));
}

function setTheme(theme) {
  const isDark = theme === 'auto' ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  selectors.themeIcon.setAttribute('href', isDark ? '#moon-stars-fill' : '#sun-fill');
  selectors.themeText.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);

  selectors.themeButtons.forEach(btn => {
    const isActive = btn.getAttribute('data-bs-theme-value') === theme;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

// Scroll Animations
function initializeScrollAnimations() {
  if (!selectors.animateElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  selectors.animateElements.forEach(element => observer.observe(element));
}

// Form Submission
function initializeContactForm() {
  if (!selectors.form || !selectors.feedback) return;

  selectors.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = selectors.form.querySelector('input[type="text"]').value.trim();
    const email = selectors.form.querySelector('input[type="email"]').value.trim();
    const message = selectors.form.querySelector('textarea').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      selectors.feedback.textContent = 'Please enter a valid email address.';
      selectors.feedback.style.color = 'red';
      return;
    }
    if (message.length < 10) {
      selectors.feedback.textContent = 'Message must be at least 10 characters long.';
      selectors.feedback.style.color = 'red';
      return;
    }

    selectors.feedback.textContent = 'Sending...';
    selectors.feedback.style.color = 'var(--dark)';

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      selectors.feedback.textContent = 'Message sent successfully!';
      selectors.feedback.style.color = 'var(--accent)';
      selectors.form.reset();
      
      setTimeout(() => {
        selectors.feedback.textContent = '';
      }, 3000);
    } catch (error) {
      selectors.feedback.textContent = 'Error sending message. Please try again.';
      selectors.feedback.style.color = 'red';
    }
  });
}

// Featurette Lightbox
function initializeFeaturetteLightbox() {
  if (!selectors.featureImages.length || !window.bootstrap?.Modal) return;

  const modal = document.getElementById('featureModal');
  if (modal) trapFocus(modal);

  selectors.featureImages.forEach(img => {
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'View feature image details');
    img.addEventListener('click', () => {
      const src = img.getAttribute('data-img');
      const title = img.getAttribute('data-title');
      const desc = img.getAttribute('data-desc');
      
      const modalImage = document.getElementById('featureModalImage');
      const modalLabel = document.getElementById('featureModalLabel');
      const modalDesc = document.getElementById('featureModalDescription');

      if (modalImage && modalLabel && modalDesc) {
        modalImage.src = src;
        modalImage.alt = `${title} feature image`;
        modalLabel.textContent = title;
        modalDesc.textContent = desc;
      }
    });
  });
}

// Portfolio Lightbox
function initializePortfolioLightbox() {
  if (!selectors.portfolioCards.length || !window.bootstrap?.Modal) return;

  const modal = document.getElementById('projectModal');
  if (modal) trapFocus(modal);

  selectors.portfolioCards.forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View project details');
    card.addEventListener('click', () => {
      const img = card.getAttribute('data-img');
      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');
      
      const modalImage = document.getElementById('modalImage');
      const modalLabel = document.getElementById('projectModalLabel');
      const modalDesc = document.getElementById('modalDescription');

      if (modalImage && modalLabel && modalDesc) {
        modalImage.src = img;
        modalImage.alt = `${title} project image`;
        modalLabel.textContent = title;
        modalDesc.textContent = desc;
      }
    });
  });
}

// Load More for Portfolio
function initializeLoadMore() {
  if (!selectors.loadMoreButton || !selectors.hiddenCards.length) return;

  selectors.loadMoreButton.addEventListener('click', () => {
    selectors.hiddenCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove('hidden');
        card.classList.add('animate-reveal');
        card.classList.add('show');
      }, index * 200);
    });
    selectors.loadMoreButton.style.display = 'none';
  });
}

// Preloader
function initializePreloader() {
  if (!selectors.preloader) return;
  window.addEventListener('load', () => {
    selectors.preloader.style.display = 'none';
  });
}

// Smooth Scroll
function initializeSmoothScroll() {
  selectors.anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// Back to Top Button
function initializeBackToTop() {
  selectors.backToTop.className = 'back-to-top';
  selectors.backToTop.innerHTML = '↑ Top';
  selectors.backToTop.setAttribute('aria-label', 'Scroll back to top');
  document.body.appendChild(selectors.backToTop);

  window.addEventListener('scroll', () => {
    selectors.backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  selectors.backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Initialize All
document.addEventListener('DOMContentLoaded', () => {
  initializeThemeToggle();
  initializeScrollAnimations();
  initializeContactForm();
  initializeFeaturetteLightbox();
  initializePortfolioLightbox();
  initializeLoadMore();
  initializePreloader();
  initializeSmoothScroll();
  initializeBackToTop();
});