# David O'Regan's Personal Website and Blog

This repository contains my personal website and blog, built with Jekyll and deployed on GitHub Pages.

## Hey there, I'm David! 👋 <img src="https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif" width="30px">

## 🚀 Senior Engineering Manager & Full-Stack AI Developer

> "If it didn't ship, it didn't happen"

### 🌟 About Me

I'm a versatile leader and developer, driving AI initiatives at GitHub. My expertise spans from frontend development to AI infrastructure, blending technical depth with strategic leadership.

- 🧠 AI Infrastructure Architect
- 🐍 Python & LLM Specialist
- 🎭 Frontend to Backend Polyglot
- 🚢 Delivery-Focused Senior Engineering Manager

### 🏆 Key Responsibilities & Achievements

- 🤖 Leading AI innovation at GitHub
- 🛡️ Managing AI infrastructure and development teams
- 🌉 Architecting scalable AI solutions and frameworks
- 🏗️ Designing robust CI/CD pipelines for AI systems
- 👨‍👩‍👧‍👦 Directing cross-functional teams across the AI ecosystem

### 💼 Technical Expertise

- **AI & Machine Learning**: Large Language Models, AI Frameworks, Model Validation
- **Infrastructure**: Kubernetes, CI/CD, AI Gateway, Scalable Systems
- **Backend**: Python, RESTful APIs, Microservices Architecture
- **Frontend**: React, TypeScript, Modern JavaScript
- **DevOps**: Docker, Kubernetes, GitHub Actions

### 🛠️ Tech Stack

<p>
  <img alt="Python" src="https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img alt="Kubernetes" src="https://img.shields.io/badge/-Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/-Docker-46a2f1?style=flat-square&logo=docker&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/-React-45b8d8?style=flat-square&logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Git" src="https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white" />
  <img alt="GitHub" src="https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github&logoColor=white" />
</p>

### 💼 Leadership Philosophy

I believe in being an approachable manager and a [human-first leader](#). My focus is on empowering teams to innovate, deliver, and grow in the rapidly evolving AI landscape.

## 💫 Inspiration

This site is inspired by the work and writing style of [Ben Balter](https://ben.balter.com/), Director of Hubber Enablement within the Office of the COO at GitHub. I particularly appreciate his detailed, thoughtful posts on GitHub culture, such as [The seven habits of highly effective GitHubbers](https://ben.balter.com/2016/09/13/seven-habits-of-highly-effective-githubbers/), which provides valuable insights into GitHub's unique work culture through traits like:

- Professional, but not formal
- Ship early, ship often
- If you see something, say something
- Curiosity and self-improvement
- Always be willing to help
- Contribute to the appreciation economy
- Honesty, integrity, and authenticity

Ben's approach to transparent, human-centric technical writing has greatly influenced how I structure my own posts and share my experiences.

## Common Tasks

This section explains how to perform common tasks when working with this repository.

### Quick Reference

| Task | Command | Time Required |
|------|---------|---------------|
| Add new blog post | Create file in `_posts/` | 5-10 minutes |
| Update site styling | Edit `css/styles.css` + `npm run build` | 10-30 minutes |
| Change site config | Edit `_config.yml` | 5 minutes |
| Add new page | Create `.html` or `.md` in root | 10-15 minutes |
| Local development | `bundle exec jekyll serve` | Initial setup: 15 minutes |
| Build CSS | `npm run build` | < 1 minute |
| Preview changes | `http://localhost:4000` | Real-time |

### Task 1: How to Add a New Blog Post

Adding a new blog post to the site is straightforward with Jekyll. Here's a step-by-step guide:

**Step 1: Create the Blog Post File**

Create a new Markdown file in the `_posts` directory following this naming convention:
```
_posts/YYYY-MM-DD-title-with-hyphens.md
```

For example: `_posts/2025-04-30-my-new-blog-post.md`

**Step 2: Add Front Matter**

At the very top of your file, add the YAML front matter with these required fields:

```yaml
---
layout: post
title: "Your Blog Post Title"
date: 2025-04-30
author: "David O'Regan"
authorImage: "https://avatars.githubusercontent.com/u/4388753?s=400&u=56053676f0fe2eb4d7f6986a022f2becc8279a0e&v=4"
image: "URL-to-your-header-image"
imageAlt: "Description of the image for accessibility"
excerpt: "A brief excerpt of your blog post that will appear in previews..."
readTime: "5 min read"
description: "SEO-friendly description of your post"
---
```

**Field Explanations:**
- `title`: The main title of your blog post (appears as H1)
- `date`: Publication date in YYYY-MM-DD format
- `author`: Your name
- `authorImage`: URL to your author photo
- `image`: Header image URL for the post
- `imageAlt`: Accessibility description for the header image
- `excerpt`: Short preview text shown on blog listing pages (2-3 sentences)
- `readTime`: Estimated reading time (e.g., "5 min read")
- `description`: SEO description for search engines

**Step 3: Write Your Content**

Below the front matter (after the closing `---`), write your blog post content using Markdown formatting.

**Step 4: Preview Locally (Optional)**

To see how your post looks before publishing:
```bash
bundle exec jekyll serve
```
Then visit `http://localhost:4000` in your browser.

**Step 5: Publish**

Commit and push your changes to GitHub:
```bash
git add _posts/2025-04-30-my-new-blog-post.md
git commit -m "Add new blog post: My New Blog Post"
git push origin main
```

Your post will be automatically published via GitHub Pages within a few minutes!

### Task 2: How to Update Site Styling

The site uses Tailwind CSS for styling. To update or customize the styles:

**Step 1: Edit the Tailwind Configuration**

The Tailwind configuration is in `tailwind.config.js`. Here you can:
- Customize colors, fonts, and spacing
- Add custom utility classes
- Configure responsive breakpoints

**Step 2: Edit the Source CSS**

Edit `css/styles.css` to add custom styles or override defaults.

**Step 3: Build the CSS**

Run the build command to generate the production CSS:
```bash
npm run build
```

For development with auto-rebuild on changes:
```bash
npm run dev
```

**Step 4: Commit the Generated CSS**

Make sure to commit both your source changes and the generated `css/output.css` file:
```bash
git add css/styles.css css/output.css tailwind.config.js
git commit -m "Update site styling"
git push origin main
```

### Task 3: How to Update Site Configuration

Site-wide settings are managed in `_config.yml`. Common updates include:

**Changing Site Title or Description:**
```yaml
title: Your Name
description: Your site description
```

**Updating Contact Information:**
```yaml
email: your-email@example.com
github_username: yourusername
twitter_username: yourusername
```

**After Editing `_config.yml`:**

1. Test locally (Jekyll must be restarted after config changes):
   ```bash
   bundle exec jekyll serve
   ```

2. Commit and push:
   ```bash
   git add _config.yml
   git commit -m "Update site configuration"
   git push origin main
   ```

**Note:** Configuration changes require a full Jekyll restart, unlike content changes which hot-reload during development.

### Task 4: How to Add a New Page

To add a new standalone page (not a blog post):

**Step 1: Create the HTML or Markdown File**

Create a new file in the root directory (e.g., `about.html` or `about.md`).

**Step 2: Add Front Matter**

For HTML pages:
```html
---
layout: default
title: About Me
---
<h1>About Me</h1>
<p>Your content here...</p>
```

For Markdown pages:
```markdown
---
layout: default
title: About Me
---

# About Me

Your content here...
```

**Step 3: Link to Your Page**

Add a link in your navigation by editing the appropriate layout file in `_layouts/`.

**Step 4: Publish**
```bash
git add your-new-page.html
git commit -m "Add new page: Your Page Title"
git push origin main
```

### Task 5: How to Set Up Local Development

To work on the site locally with live preview:

**Step 1: Install Prerequisites**

You need Ruby and Bundler installed. On macOS:
```bash
brew install ruby
gem install bundler
```

On Ubuntu/Debian:
```bash
sudo apt-get install ruby-full build-essential
gem install bundler
```

**Step 2: Install Dependencies**

Install Jekyll and Ruby dependencies:
```bash
bundle install
```

Install Node.js dependencies (for Tailwind CSS):
```bash
npm install
```

**Step 3: Start Development Servers**

In one terminal, start Jekyll:
```bash
bundle exec jekyll serve
```

In another terminal (if working on styles), start the CSS watcher:
```bash
npm run dev
```

**Step 4: Preview Your Site**

Open your browser to `http://localhost:4000`

The site will automatically reload when you make changes to content files. For configuration changes, you'll need to restart the Jekyll server.

## Markdown Writing Tips

When writing blog posts in Markdown, use these formatting options:

**Headings:**
- `## H2 Heading` for main sections
- `### H3 Heading` for subsections
- `#### H4 Heading` for sub-subsections

**Text Formatting:**
- `**bold text**` for **bold text**
- `*italic text*` for *italic text*
- `` `inline code` `` for `inline code`

**Links and Images:**
- `[Link text](https://url.com)` for links
- `![Alt text](image-url)` for images

**Code Blocks:**
Use triple backticks with optional language specifier:
````markdown
```python
def hello():
    print("Hello, World!")
```
````

**Lists:**
- Unordered lists: Use `-` or `*`
  - Sub-items: Indent with 2 spaces
- Ordered lists: Use `1.`, `2.`, etc.

**Blockquotes:**
```markdown
> This is a quote
> that spans multiple lines
```

**Tables:**
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## Site Structure

- `_posts/`: Contains all blog posts as Markdown files
- `_layouts/`: Contains the HTML templates for different page types
- `_includes/`: Contains reusable HTML components
- `_config.yml`: Main configuration file for Jekyll
- `assets/images/`: Store images here
- `css/`: Contains stylesheets

## GitHub Pages Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch using the GitHub Actions workflow defined in `.github/workflows/jekyll-gh-pages.yml`.

**Deployment Process:**
1. Push changes to the `main` branch
2. GitHub Actions automatically triggers the build workflow
3. Jekyll builds the site
4. The built site is deployed to GitHub Pages
5. Site is live at `https://oregand.github.io` (typically within 1-2 minutes)

**Checking Deployment Status:**
- Visit the "Actions" tab in the GitHub repository
- Look for the latest workflow run
- Green checkmark = successful deployment
- Red X = build failed (check logs for errors)

## Troubleshooting Common Issues

### Blog Post Not Appearing

**Problem:** Your new blog post doesn't show up on the site.

**Solutions:**
1. Check the filename format: Must be `YYYY-MM-DD-title.md`
2. Verify the date in front matter matches the filename
3. Ensure the date is not in the future (Jekyll won't publish future-dated posts by default)
4. Check that front matter is valid YAML (proper indentation, no syntax errors)
5. Make sure the file is in the `_posts` directory

### Jekyll Serve Fails Locally

**Problem:** `bundle exec jekyll serve` doesn't work.

**Solutions:**
1. Run `bundle install` to ensure all dependencies are installed
2. Check Ruby version: Jekyll requires Ruby 2.5 or higher
3. Try `bundle update` to update all gems
4. Clear the cache: `rm -rf _site .jekyll-cache`

### Styles Not Updating

**Problem:** CSS changes aren't reflected on the site.

**Solutions:**
1. Run `npm run build` to regenerate `css/output.css`
2. Clear your browser cache (Cmd+Shift+R or Ctrl+Shift+R)
3. Check that `css/output.css` was committed and pushed
4. Verify Tailwind config syntax in `tailwind.config.js`

### GitHub Pages Build Failing

**Problem:** GitHub Actions shows a failed deployment.

**Solutions:**
1. Check the Actions tab for specific error messages
2. Verify all files are valid (YAML front matter, Markdown syntax)
3. Ensure no forbidden plugins are used (GitHub Pages has restrictions)
4. Test the build locally first: `bundle exec jekyll build`
5. Check for any Ruby gem dependency issues

### Images Not Loading

**Problem:** Images in blog posts show broken links.

**Solutions:**
1. Use full URLs (starting with `https://`) for external images
2. For local images, ensure they're in a committed directory (not in `.gitignore`)
3. Check image file paths are correct (case-sensitive)
4. Verify image URLs in front matter don't have typos

## Need Help?

If you need assistance with Jekyll or GitHub Pages, check out:
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

### 📫 Let's Connect!

<a href="https://www.linkedin.com/in/oregand7/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=LinkedIn&logoColor=white" /></a>

---
