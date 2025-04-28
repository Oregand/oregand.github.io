document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle
  initDarkMode();

  // Initialize animations
  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    if (isElementInViewport(element)) {
      element.classList.add('animate-fade-in');
    }
  });

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

  // Load featured blog posts on homepage
  loadFeaturedBlogPosts();

  // Scroll animations
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.animate-on-scroll:not(.animate-fade-in)').forEach(element => {
      if (isElementInViewport(element)) {
        element.classList.add('animate-fade-in');
      }
    });
  });
});

// Initialize dark mode
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const htmlElement = document.documentElement;
  
  // Check for saved user preference in localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                     (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Set initial dark mode state
  if (isDarkMode) {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
  
  // Add event listener to toggle button
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      htmlElement.classList.toggle('dark');
      
      // Save user preference to localStorage
      localStorage.setItem('darkMode', htmlElement.classList.contains('dark'));
    });
  }
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('darkMode')) {
      if (e.matches) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
  });
}

// Function to load blog posts on the homepage
async function loadFeaturedBlogPosts() {
  const featuredPostsSection = document.getElementById('featured-blog-posts');
  if (!featuredPostsSection) return;

  try {
    // Fetch the blog index page
    const response = await fetch('/blog/index.html');
    if (!response.ok) throw new Error('Failed to fetch blog posts');
    
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    
    // Get the blog posts from the blog page (first 3)
    const blogPosts = Array.from(doc.querySelectorAll('.blog-post')).slice(0, 3);
    
    if (blogPosts.length > 0) {
      // Clear loading indicator
      featuredPostsSection.innerHTML = '';
      
      // Add each blog post to the featured section
      blogPosts.forEach(post => {
        featuredPostsSection.appendChild(post.cloneNode(true));
      });
    } else {
      featuredPostsSection.innerHTML = '<p class="col-span-full text-center py-4 text-gray-600 dark:text-gray-400">No blog posts found</p>';
    }
  } catch (error) {
    console.error('Error loading blog posts:', error);
    featuredPostsSection.innerHTML = '<p class="col-span-full text-center py-4 text-gray-600 dark:text-gray-400">Failed to load blog posts</p>';
  }
}

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