document.addEventListener('DOMContentLoaded', () => {
  // Initialize animations
  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    if (isElementInViewport(element)) {
      element.classList.add('animate-fade-in');
    }
  });

  // Dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // Check for saved theme preference or use OS preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  // Apply theme
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
    document.documentElement.classList.add('dark');
    if (darkModeToggle) {
      darkModeToggle.checked = true;
    }
  }
  
  // Handle toggle change
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
      if (darkModeToggle.checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Smooth scrolling for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });

  // Scroll animations
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.animate-on-scroll:not(.animate-fade-in)').forEach(element => {
      if (isElementInViewport(element)) {
        element.classList.add('animate-fade-in');
      }
    });
  });
});

// Helper function to check if element is in viewport
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}