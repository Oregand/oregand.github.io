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
  
  // Load blog posts dynamically based on current page
  loadBlogPosts();
  
  // Load featured blog posts on home page
  loadFeaturedBlogPosts();
  
  // Check if we're on a blog post page and load related posts
  const postIdElement = document.getElementById('current-post-id');
  if (postIdElement) {
    const currentPostId = postIdElement.getAttribute('data-post-id');
    loadRelatedPosts(currentPostId);
  }
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

// Helper function to determine the correct path to blog-posts.json based on current page
function getBlogDataPath() {
  // Get the current path
  const path = window.location.pathname;
  
  // Check if we're in the blog folder or blog/posts folder
  if (path.includes('/blog/posts/')) {
    return '../../data/blog-posts.json';
  } else if (path.includes('/blog/')) {
    return '../data/blog-posts.json';
  } else {
    // We're on the main page or another top-level page
    return './data/blog-posts.json';
  }
}

// Function to load featured blog posts on the home page
async function loadFeaturedBlogPosts() {
  const featuredPostsContainer = document.getElementById('featured-blog-posts');
  
  // Only proceed if we're on a page with the featured posts container
  if (!featuredPostsContainer) return;
  
  try {
    const response = await fetch(getBlogDataPath());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
    
    // Clear existing content
    featuredPostsContainer.innerHTML = '';
    
    // Add only the first 3 featured posts (or less if there are fewer posts)
    const featuredPosts = posts.slice(0, 3);
    
    featuredPosts.forEach((post) => {
      const postElement = document.createElement('a');
      postElement.href = post.url;
      postElement.className = 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';
      
      postElement.innerHTML = `
        <div class="h-48 bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden rounded-t-lg">
          <img src="${post.image}" alt="${post.imageAlt}" class="w-full h-full object-cover">
        </div>
        <div class="p-4">
          <p class="text-primary dark:text-blue-400 text-sm font-medium mb-2">${post.date}</p>
          <h3 class="text-lg font-bold mb-2 hover:text-primary dark:hover:text-blue-400">
            ${post.title}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            ${post.excerpt}
          </p>
          <span class="text-primary dark:text-blue-400 font-medium">Read more →</span>
        </div>
      `;
      
      featuredPostsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error('Error loading featured blog posts:', error);
    featuredPostsContainer.innerHTML = '<p class="text-center text-red-500">Failed to load featured posts.</p>';
  }
}

// Function to load blog posts dynamically
async function loadBlogPosts() {
  const blogPostsContainer = document.getElementById('blog-posts-container');
  
  // Only proceed if we're on a page with the blog posts container
  if (!blogPostsContainer) return;
  
  try {
    const response = await fetch(getBlogDataPath());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
    
    // Clear existing content
    blogPostsContainer.innerHTML = '';
    
    // Add posts with staggered animation delay
    posts.forEach((post, index) => {
      const article = createBlogPostElement(post, index);
      blogPostsContainer.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading blog posts:', error);
    blogPostsContainer.innerHTML = '<p class="text-center text-red-500">Failed to load blog posts. Please try again later.</p>';
  }
}

// Function to create an individual blog post element
function createBlogPostElement(post, index) {
  const article = document.createElement('article');
  article.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0';
  
  // Add staggered animation with delay based on index
  article.style.animationDelay = `${index * 0.2}s`;
  article.classList.add('animate-[fadeIn_0.5s_ease-in-out_forwards]');
  
  article.innerHTML = `
    <div class="h-48 bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden rounded-t-lg">
      <img src="${post.image}" alt="${post.imageAlt}" class="w-full h-full object-cover">
    </div>
    <div class="p-5">
      <p class="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">${post.date}</p>
      <h2 class="text-xl font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
        <a href="${post.url}">${post.title}</a>
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        ${post.excerpt}
      </p>
      <a href="${post.url}" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Read more →</a>
    </div>
  `;
  
  return article;
}

// Function to load related posts on a blog post page
async function loadRelatedPosts(currentPostId) {
  const relatedPostsContainer = document.getElementById('related-posts-container');
  
  // Only proceed if we're on a page with the related posts container
  if (!relatedPostsContainer) return;
  
  try {
    const response = await fetch(getBlogDataPath());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const posts = await response.json();
    
    // Filter out current post and get up to 3 other posts
    const relatedPosts = posts
      .filter(post => post.id !== currentPostId)
      .slice(0, 3);
    
    if (relatedPosts.length === 0) {
      relatedPostsContainer.parentElement.style.display = 'none';
      return;
    }
    
    // Clear existing content
    relatedPostsContainer.innerHTML = '';
    
    // Add related posts
    relatedPosts.forEach((post) => {
      const article = document.createElement('article');
      article.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1';
      
      article.innerHTML = `
        <div class="h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-t-lg">
          <img src="${post.image}" alt="${post.imageAlt}" class="w-full h-full object-cover">
        </div>
        <div class="p-4">
          <p class="text-blue-600 dark:text-blue-400 text-xs font-medium mb-1">${post.date}</p>
          <h3 class="text-lg font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
            <a href="${post.url}">${post.title}</a>
          </h3>
          <a href="${post.url}" class="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm">Read more →</a>
        </div>
      `;
      
      relatedPostsContainer.appendChild(article);
    });
  } catch (error) {
    console.error('Error loading related posts:', error);
    relatedPostsContainer.innerHTML = '';
    relatedPostsContainer.parentElement.style.display = 'none';
  }
}