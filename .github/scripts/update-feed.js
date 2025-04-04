const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const RSS_URL = 'https://github.blog/changelog/label/copilot/feed/';
const OUTPUT_FILE = path.join(process.cwd(), 'copilot-feed.html');
const MAX_ITEMS = 10; // Number of feed items to display

async function fetchFeed() {
  try {
    const response = await axios.get(RSS_URL);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    
    return result.rss.channel.item.slice(0, MAX_ITEMS);
  } catch (error) {
    console.error('Error fetching or parsing the feed:', error);
    return [];
  }
}

function generateHTML(items) {
  const lastUpdated = new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Copilot Updates</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      color: #0366d6;
      border-bottom: 1px solid #eaecef;
      padding-bottom: 10px;
    }
    
    .feed-item {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaecef;
    }
    
    .feed-title {
      margin-bottom: 10px;
    }
    
    .feed-title a {
      color: #0366d6;
      text-decoration: none;
      font-weight: bold;
      font-size: 20px;
    }
    
    .feed-title a:hover {
      text-decoration: underline;
    }
    
    .feed-date {
      color: #586069;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .feed-description {
      color: #24292e;
    }
    
    .update-info {
      margin-top: 40px;
      font-size: 14px;
      color: #586069;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>GitHub Copilot Latest Updates</h1>
`;

  if (items.length === 0) {
    html += `<p>No feed items found.</p>`;
  } else {
    items.forEach(item => {
      const pubDate = new Date(item.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Clean up description (remove HTML tags for summary)
      let description = item.description;
      if (description) {
        description = description.replace(/<\/?[^>]+(>|$)/g, "");
      }

      html += `
  <div class="feed-item">
    <div class="feed-title">
      <a href="${item.link}" target="_blank">${item.title}</a>
    </div>
    <div class="feed-date">${pubDate}</div>
    <div class="feed-description">
      ${description}
      <p><a href="${item.link}" target="_blank">Read more →</a></p>
    </div>
  </div>
`;
    });
  }

  html += `
  <div class="update-info">
    Feed last updated: ${lastUpdated}
  </div>
</body>
</html>
`;

  return html;
}

async function main() {
  const items = await fetchFeed();
  const html = generateHTML(items);
  
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`Feed updated successfully with ${items.length} items. Output written to ${OUTPUT_FILE}`);
}

main();