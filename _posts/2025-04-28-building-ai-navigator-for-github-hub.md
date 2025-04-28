---
layout: post
title: "Building an AI Navigator for GitHub's The Hub Documentation"
date: 2025-04-28
categories: ai github documentation productivity
description: "How I created an AI-powered application to help new hires efficiently navigate GitHub's extensive internal documentation repository."
image: https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80
---

## The Challenge of Internal Documentation

When I joined GitHub, I was granted access to "The Hub" - the company's internal documentation repository. While it contained a wealth of valuable information about processes, policies, and tools, I quickly discovered what many new hires experience: information overload. With hundreds of markdown files spread across numerous directories, finding exactly what I needed was like searching for a needle in a digital haystack.

The Hub is a comprehensive repository of institutional knowledge, but its size and structure made it challenging to:

- Quickly locate answers to specific questions without knowing exactly where to look
- Understand relationships between different documents and processes
- Discover relevant information I didn't know to search for
- Navigate efficiently to find the right documentation for my role

I needed a better way to extract value from this knowledge repository, especially during my critical onboarding period.

## The AI Solution: Hub Navigator

Rather than continuing to struggle with manual searches, I decided to build an AI-powered documentation navigator specifically for The Hub. My goal was to create a tool that would function as my personal guide through GitHub's vast documentation landscape.

### Core Requirements

I established several key requirements for my project:

1. **Natural Language Understanding**: Allow querying in plain English questions, not just keywords
2. **Context-Aware Responses**: Provide answers that incorporate content from multiple relevant documents
3. **Source Transparency**: Always show which documents information came from
4. **Easy Updating**: Keep the knowledge base current with minimal maintenance
5. **Privacy Preservation**: Keep all company information secure by running locally

## Building the Application

### Step 1: Setting Up the Repository

I started by creating a local copy of The Hub's markdown content that I could work with:

```python
import os
from git import Repo
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_repository(repo_url, local_dir="./hub_repo"):
    """Clone or pull the latest from The Hub repository"""
    try:
        if not os.path.exists(local_dir):
            logger.info(f"Cloning repository to {local_dir}...")
            Repo.clone_from(repo_url, local_dir)
            logger.info("Repository cloned successfully")
        else:
            logger.info("Repository exists, pulling latest changes...")
            repo = Repo(local_dir)
            repo.remotes.origin.pull()
            logger.info("Repository updated successfully")
        return True
    except Exception as e:
        logger.error(f"Error setting up repository: {str(e)}")
        return False
```

### Step 2: Processing Markdown Files

Next, I created functionality to process markdown files, breaking them into manageable chunks and preserving metadata about their source:

```python
import re
from langchain.text_splitter import MarkdownTextSplitter

def process_markdown_files(repo_dir):
    """Process all markdown files in the repository"""
    documents = []
    
    for root, _, files in os.walk(repo_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, repo_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Extract title from markdown
                    title = extract_title(content) or os.path.splitext(file)[0]
                    
                    # Process file content
                    documents.append({
                        "content": content,
                        "path": relative_path,
                        "title": title
                    })
                    
                except Exception as e:
                    logger.error(f"Error processing file {relative_path}: {str(e)}")
    
    logger.info(f"Processed {len(documents)} markdown files")
    return documents

def extract_title(content):
    """Extract title from markdown content"""
    # Try to find a # heading
    heading_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    if heading_match:
        return heading_match.group(1)
    
    # Try to find YAML front matter title
    frontmatter_match = re.search(r'^---\s*\n.*?title:\s*[\'"]?(.*?)[\'"]?\s*\n.*?---', 
                                   content, re.DOTALL)
    if frontmatter_match:
        return frontmatter_match.group(1)
    
    return None
```

### Step 3: Creating Document Embeddings

To enable semantic search, I used OpenAI's embeddings to create vector representations of the document chunks:

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import os

def create_embeddings(documents):
    """Create embeddings for all documents"""
    # Initialize embeddings
    embeddings = OpenAIEmbeddings(
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Split documents into chunks
    text_splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=200)
    doc_chunks = []
    
    for doc in documents:
        chunks = text_splitter.split_text(doc["content"])
        for chunk in chunks:
            doc_chunks.append({
                "text": chunk,
                "metadata": {
                    "source": doc["path"],
                    "title": doc["title"]
                }
            })
    
    # Create vector DB
    db = Chroma.from_documents(
        documents=[{"page_content": d["text"], "metadata": d["metadata"]} for d in doc_chunks],
        embedding=embeddings,
        persist_directory="./hub_db"
    )
    
    db.persist()
    logger.info(f"Created embeddings for {len(doc_chunks)} document chunks")
    return db
```

### Step 4: Building the Query Interface

With the embeddings in place, I created a query engine that could understand natural language questions:

```python
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

def setup_qa_system(db):
    """Set up the question-answering system"""
    
    # Define a custom prompt template that includes instructions for formatting
    template = """
    You are an AI assistant helping a GitHub employee navigate internal documentation from 'The Hub'.
    Use the following context from The Hub documentation to answer the question. 
    If you don't know the answer, say you don't know - don't make up information.
    Always specify which documents you sourced the information from.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:
    """
    
    PROMPT = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )
    
    # Create the retrieval QA chain
    qa = RetrievalQA.from_chain_type(
        llm=OpenAI(temperature=0),
        chain_type="stuff",
        retriever=db.as_retriever(search_kwargs={"k": 5}),
        chain_type_kwargs={"prompt": PROMPT},
        return_source_documents=True
    )
    
    return qa

def ask_question(qa, question):
    """Ask a question to the QA system"""
    try:
        result = qa({"query": question})
        
        # Extract source documents
        sources = []
        for doc in result["source_documents"]:
            if doc.metadata["source"] not in [s["path"] for s in sources]:
                sources.append({
                    "path": doc.metadata["source"],
                    "title": doc.metadata["title"]
                })
        
        return {
            "answer": result["result"],
            "sources": sources
        }
    except Exception as e:
        logger.error(f"Error asking question: {str(e)}")
        return {
            "answer": f"Error processing your question: {str(e)}",
            "sources": []
        }
```

### Step 5: Creating the Flask Web Application

Finally, I built a simple Flask application to serve as the interface:

```python
from flask import Flask, request, jsonify, render_template
import os

app = Flask(__name__)

# Global variables
db = None
qa = None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/refresh", methods=["POST"])
def refresh_docs():
    """Refresh the document database"""
    global db, qa
    
    repo_url = request.json.get("repo_url")
    if not repo_url:
        return jsonify({"error": "No repository URL provided"})
    
    # Set up repository
    success = setup_repository(repo_url)
    if not success:
        return jsonify({"error": "Failed to set up repository"})
    
    # Process markdown files
    documents = process_markdown_files("./hub_repo")
    
    # Create embeddings
    db = create_embeddings(documents)
    
    # Set up QA system
    qa = setup_qa_system(db)
    
    return jsonify({
        "status": "success", 
        "message": f"Processed {len(documents)} documents"
    })

@app.route("/ask", methods=["POST"])
def ask():
    """Ask a question to the Hub Navigator"""
    global qa
    
    if qa is None:
        return jsonify({
            "error": "Documentation not loaded. Please refresh the documentation first."
        })
    
    question = request.json.get("question")
    if not question:
        return jsonify({"error": "No question provided"})
    
    result = ask_question(qa, question)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
```

## Creating a Clean User Interface

I wanted a straightforward interface that would allow me to ask questions naturally and see the sources of information clearly. Here's the HTML template I created:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hub Navigator - GitHub Documentation Assistant</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Hub Navigator</h1>
            <p class="text-gray-600">Your AI guide to GitHub's internal documentation</p>
        </header>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Setup Repository</h2>
            <div class="flex">
                <input type="text" id="repo-url" placeholder="Enter Hub repository URL" 
                       class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="refresh-btn" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Load Documentation
                </button>
            </div>
            <div id="status-message" class="mt-2 text-sm"></div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Ask About GitHub Documentation</h2>
            <div class="flex mb-4">
                <input type="text" id="question-input" placeholder="Ask anything about GitHub processes, tools, or policies..." 
                       class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="ask-btn" 
                        class="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    Ask
                </button>
            </div>
            
            <div id="answer-container" class="hidden">
                <h3 class="font-semibold text-lg mb-2">Answer</h3>
                <div id="answer-text" class="mb-4 p-4 bg-gray-50 rounded-md"></div>
                
                <h3 class="font-semibold text-lg mb-2">Sources</h3>
                <ul id="sources-list" class="list-disc pl-5"></ul>
            </div>
        </div>
    </div>
    
    <script>
        // JavaScript for interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const refreshBtn = document.getElementById('refresh-btn');
            const askBtn = document.getElementById('ask-btn');
            const statusMessage = document.getElementById('status-message');
            const answerContainer = document.getElementById('answer-container');
            const answerText = document.getElementById('answer-text');
            const sourcesList = document.getElementById('sources-list');
            
            refreshBtn.addEventListener('click', async function() {
                const repoUrl = document.getElementById('repo-url').value;
                if (!repoUrl) {
                    statusMessage.textContent = 'Please enter a repository URL';
                    statusMessage.className = 'mt-2 text-sm text-red-600';
                    return;
                }
                
                refreshBtn.disabled = true;
                refreshBtn.textContent = 'Loading...';
                statusMessage.textContent = 'Processing documentation, please wait...';
                statusMessage.className = 'mt-2 text-sm text-blue-600';
                
                try {
                    const response = await fetch('/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ repo_url: repoUrl }),
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        statusMessage.textContent = data.error;
                        statusMessage.className = 'mt-2 text-sm text-red-600';
                    } else {
                        statusMessage.textContent = data.message;
                        statusMessage.className = 'mt-2 text-sm text-green-600';
                    }
                } catch (error) {
                    statusMessage.textContent = 'Error loading documentation: ' + error.message;
                    statusMessage.className = 'mt-2 text-sm text-red-600';
                } finally {
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = 'Load Documentation';
                }
            });
            
            askBtn.addEventListener('click', async function() {
                const question = document.getElementById('question-input').value;
                if (!question) return;
                
                askBtn.disabled = true;
                askBtn.textContent = 'Thinking...';
                answerContainer.classList.add('hidden');
                
                try {
                    const response = await fetch('/ask', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question }),
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        answerText.textContent = data.error;
                        sourcesList.innerHTML = '';
                    } else {
                        // Set answer text
                        answerText.textContent = data.answer;
                        
                        // Clear and populate sources list
                        sourcesList.innerHTML = '';
                        data.sources.forEach(source => {
                            const li = document.createElement('li');
                            li.textContent = `${source.title} (${source.path})`;
                            sourcesList.appendChild(li);
                        });
                        
                        answerContainer.classList.remove('hidden');
                    }
                } catch (error) {
                    answerText.textContent = 'Error: ' + error.message;
                    sourcesList.innerHTML = '';
                    answerContainer.classList.remove('hidden');
                } finally {
                    askBtn.disabled = false;
                    askBtn.textContent = 'Ask';
                }
            });
            
            // Allow pressing Enter to submit question
            document.getElementById('question-input').addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    askBtn.click();
                }
            });
        });
    </script>
</body>
</html>
```

## Real-World Impact

After implementing the Hub Navigator, my onboarding experience transformed completely. Here are some concrete ways it helped:

### Finding Team-Specific Information

When asked "What's the deploy process for the Copilot team?", the navigator instantly retrieved the relevant documentation and highlighted:

1. The specific branch strategy used by the Copilot team
2. Required approvals before deployment
3. Links to the CI/CD pipeline configurations

Without the navigator, finding this information would have required asking multiple team members or searching through dozens of files.

### Understanding Cross-Team Dependencies

For a project involving multiple teams, I asked "How does authentication work between Copilot and the Enterprise authentication systems?" The navigator provided:

1. Architecture diagrams from different documentation sources
2. API specifications for the auth endpoints
3. Contact information for the auth platform team

This saved me from incorrectly implementing integration points and avoided unnecessary meetings.

### Discovering Institutional Context

When I wondered about team culture aspects not explicitly documented in onboarding guides, questions like "What is GitHub's approach to incident management?" yielded nuanced information from multiple sources, giving me both the official processes and cultural context.

## How You Can Build Your Own Documentation Navigator

If you're facing similar documentation challenges, here are some tips for building your own navigator:

1. **Choose the Right Embedding Model**: I found OpenAI's embeddings worked well, but you can also use open-source alternatives like BERT or Sentence Transformers for more sensitive environments.

2. **Chunk Documents Thoughtfully**: The 1000-token chunks with 200-token overlap worked well for markdown files, but you might need different parameters depending on your documentation structure.

3. **Use Retrieval Augmented Generation**: This approach ensures answers are grounded in your actual documentation rather than the model's pre-trained knowledge.

4. **Monitor and Update Regularly**: Set up a scheduled task to refresh your document database as the underlying documentation evolves.

5. **Respect Privacy Concerns**: For internal company documentation, ensure your solution keeps data secure and complies with your organization's policies.

## Conclusion

Building the Hub Navigator took me about a week of part-time work, but it has saved me countless hours since then. More importantly, it has transformed The Hub from an overwhelming repository into an accessible knowledge base that I can query conversationally.

As companies accumulate more internal documentation, tools like this will become increasingly important for knowledge management and employee onboarding. The combination of semantic search and LLM-powered question answering creates a truly useful layer on top of static documentation.

For my next iteration, I'm planning to add:
- Role-based filtering to prioritize documentation relevant to my specific team
- Question history and favorites for frequently accessed information
- Integration with GitHub's authentication system for easier deployment to other team members

Whether you're at GitHub or another company with extensive internal documentation, building a similar tool could significantly enhance how you and your colleagues interact with your collective knowledge base.