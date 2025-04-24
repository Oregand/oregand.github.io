---
layout: post
title: "Building an AI Coach Based on My Mentor's Communication Style"
date: 2025-04-24
categories: ai productivity mentorship
description: "How I created an AI assistant that helps me communicate like my mentor Michelle Gill by fine-tuning Claude on her most brilliant comments."
image: /assets/images/ai-mentor-coach.jpg
---

## The Challenge of Clear Communication

When I worked at GitLab, I noticed my communication was never quite as crisp and effective as I wanted it to be. My boss and mentor, [Michelle Gill](https://gitlab.com/m_gill), on the other hand, had a remarkable ability to communicate with precision. Her comments were hyper-incisive - always asking the right questions, assigning clear responsibility to stakeholders, and creating a sense of urgency that moved conversations forward.

I found myself constantly admiring how Michelle could cut through complex situations with just a few sentences and drive action in a way that I struggled to replicate.

## My Manual Learning Process

Initially, my approach was straightforward but labor-intensive. I created a spreadsheet where I collected links to Michelle's most brilliant comments spread throughout GitLab's various platforms. These comments showcased her communication prowess in different contexts:

- Assigning clear responsibility without creating defensiveness
- Creating urgency through targeted questions rather than demands
- Refocusing meandering discussions back to core objectives
- Highlighting blockers that others had missed

When crafting my own important communications, I would manually cross-reference these examples, trying to incorporate elements of her style into my own. While effective, this process was time-consuming and interrupted my workflow. I knew there had to be a better way.

## Building the AI Michelle Coach

The solution came through leveraging AI. Here's how I built my personalized AI communication coach:

1. **Data Collection**: I organized my spreadsheet of Michelle's comments, categorizing them by communication intent and context.

2. **Creating a Contextual AI System**: I used the Claude API with carefully engineered prompts, providing selected examples of Michelle's communication style as context for the model to learn from.

3. **Browser Integration**: I developed a simple Chrome extension that allowed me to draft comments normally, then run them through my "Michelle model" with a single click.

4. **GitLab API Integration**: For responses in GitLab merge requests and issues, I integrated with the GitLab API to fetch the entire conversation thread, giving the AI more context about the ongoing discussion.

5. **Personalizing the Feedback**: To make the coaching more relevant to my specific growth areas, I included our one-on-one notes and specific feedback she had given me over the years, helping the model identify my common communication pitfalls.

Here's a simplified example of how I structure the prompt for Claude:

```javascript
// Example of prompt construction in JavaScript
async function transformCommunication(userDraft) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY', // Use environment variables in production
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system: `You are a communication coach that helps the user communicate like Michelle Gill.
      Michelle's communication style is characterized by:
      1. Clear responsibility assignment without blame
      2. Concise, action-oriented language
      3. Strategic questions that drive urgency
      4. Refocusing discussions around business objectives
      
      Your task is to rewrite the user's message to match Michelle's communication style while 
      preserving their core intent. Then provide brief coaching notes explaining what you changed.`,
      messages: [
        {
          role: "user",
          content: `Here are examples of Michelle's communication style:
          
          EXAMPLE 1 - ASSIGNING RESPONSIBILITY:
          "I think we need to establish who's the DRI for the Q2 planning document. @Sarah, since you led this last quarter, would you be able to take ownership again or should we reassign?"
          
          EXAMPLE 2 - CREATING URGENCY:
          "Looking at our timeline, what's our confidence level that we'll hit the April 30 deadline? If it's below 80%, what's the one thing we could address now to improve our chances?"
          
          EXAMPLE 3 - REFOCUSING DISCUSSION:
          "I appreciate all the creative ideas here, but I'd like to return to our primary objective: increasing conversion by 15%. Which of these proposals directly supports that goal?"
          
          Please rewrite my draft comment below to match Michelle's style:
          
          MY DRAFT:
          ${userDraft}`
        }
      ]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

## How It Works in Practice

Now, my workflow is seamless:

1. I draft a comment or message in my natural style
2. With a click of a button, my extension sends the draft to the Claude API along with relevant context examples
3. The AI returns a revised version that maintains my core message but structures it with Michelle's clarity and precision
4. Additionally, it provides specific coaching notes explaining what it changed and why, referencing patterns from Michelle's feedback to me

Here's a simplified version of the Chrome extension code following Manifest V3 standards:

```javascript
// manifest.json
{
  "name": "Michelle Coach",
  "version": "1.0.0",
  "manifest_version": 3,
  "description": "AI writing coach based on Michelle Gill's communication style",
  "permissions": ["scripting", "activeTab", "storage"],
  "host_permissions": ["https://my-michelle-coach-api.example.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js"]
    }
  ],
  "action": {
    "default_title": "Michelle Coach"
  }
}

// background.js - Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "transform_text") {
    // Need to handle this promise-based code differently in MV3
    handleTransform(request).then(sendResponse);
    return true; // Required for async sendResponse
  }
});

async function handleTransform(request) {
  try {
    // Using fetch from service worker
    const response = await fetch('https://my-michelle-coach-api.example.com/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        draft: request.text,
        context: request.contextType || "general"
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, transformed: data.result };
  } catch (error) {
    console.error('Error transforming text:', error);
    return { success: false, error: error.toString() };
  }
}

// contentScript.js
// Use a more reliable approach for inserting UI elements
let michelleButton = null;

function createMichelleButton() {
  if (michelleButton) {
    michelleButton.remove();
  }
  
  michelleButton = document.createElement('button');
  michelleButton.id = 'michelle-coach-btn';
  michelleButton.innerText = 'Michelle-ify';
  michelleButton.style.cssText = 'position: absolute; z-index: 9999; background: #6200ea; color: white; border: none; border-radius: 4px; padding: 5px 10px; font-size: 12px; cursor: pointer;';
  
  return michelleButton;
}

function detectContextType(url) {
  // Logic to detect the context from URL
  if (url.includes('gitlab.com') && url.includes('merge_requests')) {
    return 'merge_request';
  } else if (url.includes('gitlab.com') && url.includes('issues')) {
    return 'issue';
  } else if (url.includes('gmail.com')) {
    return 'email';
  }
  return 'general';
}

// Listen for text selection
document.addEventListener('mouseup', function(event) {
  const selection = window.getSelection();
  if (!selection || !selection.toString().trim()) {
    if (michelleButton) michelleButton.remove();
    return;
  }
  
  // Only proceed if we're in an editable area
  const activeElement = document.activeElement;
  if (activeElement.tagName !== 'TEXTAREA' && 
      !(activeElement.tagName === 'DIV' && activeElement.getAttribute('contenteditable') === 'true')) {
    return;
  }
  
  // Create and position the button
  const button = createMichelleButton();
  document.body.appendChild(button);
  
  // Position near the cursor
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  button.style.top = `${window.scrollY + rect.bottom + 10}px`;
  button.style.left = `${window.scrollX + rect.left}px`;
  
  button.onclick = function() {
    chrome.runtime.sendMessage(
      { 
        action: "transform_text", 
        text: activeElement.value || activeElement.innerHTML,
        contextType: detectContextType(window.location.href)
      },
      function(response) {
        if (response && response.success) {
          if (activeElement.tagName === 'TEXTAREA') {
            activeElement.value = response.transformed;
          } else {
            activeElement.innerHTML = response.transformed;
          }
          // Clean up
          button.remove();
        } else {
          button.innerText = 'Error!';
          setTimeout(() => button.remove(), 2000);
        }
      }
    );
  };
});

// Example of GitLab API integration
async function getGitLabConversationContext(projectId, issueId, type) {
  // Get GitLab access token from storage
  const { gitlabToken } = await chrome.storage.sync.get('gitlabToken');
  
  if (!gitlabToken) {
    throw new Error('GitLab token not found. Please configure the extension settings.');
  }
  
  // Determine the API endpoint based on conversation type
  const endpoint = type === 'merge_request' 
    ? `https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${issueId}/notes`
    : `https://gitlab.com/api/v4/projects/${projectId}/issues/${issueId}/notes`;
  
  // Get the conversation history
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${gitlabToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitLab API error: ${response.status}`);
  }
  
  const notes = await response.json();
  
  // Format notes into conversation context
  return notes.map(note => ({
    author: note.author.name,
    date: new Date(note.created_at).toLocaleDateString(),
    content: note.body,
    isFromMentor: note.author.username === 'michelle_gill'
  }));
}

// Using the conversation context in our prompt
async function transformWithContext(userDraft, projectId, issueId, type) {
  try {
    // Get the entire conversation thread
    const conversationContext = await getGitLabConversationContext(projectId, issueId, type);
    
    // Extract only the most relevant exchanges
    const relevantExchanges = conversationContext
      .filter(note => note.isFromMentor || conversationContext.some(
        reply => reply.isFromMentor && 
        new Date(reply.date) - new Date(note.date) < 24 * 60 * 60 * 1000
      ))
      .slice(-5); // Use only the 5 most recent relevant exchanges
    
    // Format the context for the prompt
    const contextText = relevantExchanges
      .map(note => `${note.author} (${note.date}): ${note.content}`)
      .join('\n\n');
    
    // Include context in the API call to Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        system: "You are a communication coach that helps the user communicate like Michelle Gill...",
        messages: [
          {
            role: "user",
            content: `Here's the current conversation context in this GitLab thread:\n\n${contextText}\n\n
                     Please rewrite my draft comment below to match Michelle's style, making it relevant 
                     to the ongoing conversation:\n\n
                     MY DRAFT:\n${userDraft}`
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error fetching conversation context:', error);
    // Fall back to standard transformation without context
    return transformCommunication(userDraft);
  }
}
```

## The Results

This AI coach has transformed my written communication. I've received feedback that my messages are more actionable and clear. Discussions I lead tend to reach conclusions faster, and there's less back-and-forth needed to clarify expectations.

What I find particularly valuable is how this tool has trained me over time. I'm starting to internalize these communication patterns, and I now often catch myself instinctively structuring messages in a more effective way, even before using the AI assistant.

### Example Transformation

Here's a real example of how the AI coach transformed one of my messages:

> **Original Message**: 
> Hey team, just checking in on the status of the project. Can someone provide an update?
> 
> **Transformed Message**: 
> Hi team, I wanted to touch base regarding the project status. @John, could you please share the latest updates? If there are any blockers, let's discuss how we can resolve them promptly. Thanks!