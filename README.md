# Brand Nova Rich Text Editor Beta

A powerful, customizable rich text editor built with Slate.js and React. Designed for seamless integration into any web project including Django, PHP, HTML, and modern JavaScript frameworks.

## ✨ Features

### Core Functionality
- **Rich Text Editing**: Full-featured WYSIWYG editor with Slate.js
- **Theme Support**: Light and dark themes with smooth transitions
- **Keyboard Shortcuts**: Comprehensive keyboard support for power users
- **Accessibility**: WCAG compliant with screen reader support

### Toolbar Tools
- **Text Formatting**: Bold, italic, underline, strikethrough, inline code
- **Headings**: H1, H2, H3, H4, H5, H6 with normal text reset
- **Lists**: Ordered and unordered lists with proper nesting
- **Text Alignment**: Left, center, right, justify 


## 🚀 Quick Start

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/brand-nova-editor.git
cd brand-nova-editor

# Install dependencies
npm install

# Build for standalone use
npm run build:standalone
\`\`\`

### Integration

#### HTML Projects

1. Copy the built files to your project:
\`\`\`
dist/
├── brand-nova-editor.js
├── brand-nova-editor.css
└── assets/
\`\`\`

2. Include in your HTML:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="brand-nova-editor.css">
</head>
<body>
    <!-- Editor container -->
    <div id="my-editor" data-brand-nova-editor data-niche="writer"></div>
    
    <!-- Include the script -->
    <script src="brand-nova-editor.js"></script>
    
    <!-- Initialize -->
    <script>
        window.BrandNovaEditor.init({
            elementId: "my-editor",
            theme: "light",
            placeholder: "Start writing...",
            onChange: (content) => {
                console.log("Content changed:", content);
            }
        });
    </script>
</body>
</html>
\`\`\`

#### Django Projects

1. Copy files to `static/js/` and `static/css/`:
\`\`\`
static/
├── css/brand-nova-editor.css
├── js/brand-nova-editor.js
└── js/assets/
\`\`\`

2. In your template:
\`\`\`html
{% load static %}

<!-- In head -->
<link rel="stylesheet" href="{% static 'css/brand-nova-editor.css' %}">

<!-- In body -->
<div id="article-editor" data-brand-nova-editor data-niche="blogger"></div>

<!-- Before closing body -->
<script src="{% static 'js/brand-nova-editor.js' %}"></script>
<script>
    window.BrandNovaEditor.init({
        elementId: "article-editor",
        theme: "light",
        onChange: (content) => {
            // Send to Django backend
            fetch("{% url 'save_article' %}", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": "{{ csrf_token }}"
                },
                body: JSON.stringify({ content: content })
            });
        }
    });
</script>
\`\`\`

#### PHP Projects

1. Copy files to your assets directory
2. Include in your PHP template:
\`\`\`php
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="assets/brand-nova-editor.css">
</head>
<body>
    <div id="content-editor" data-brand-nova-editor data-niche="developer"></div>
    
    <script src="assets/brand-nova-editor.js"></script>
    <script>
        window.BrandNovaEditor.init({
            elementId: "content-editor",
            onChange: (content) => {
                // Send to PHP backend
                fetch("save_content.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: content })
                });
            }
        });
    </script>
</body>
</html>
\`\`\`

## ⚙️ Configuration Options

\`\`\`javascript
window.BrandNovaEditor.init({
    // Required
    elementId: "my-editor",           // DOM element ID
    
    // Optional
    theme: "light",                  // light|dark
    placeholder: "Start writing...", // Placeholder text
    initialValue: [],                // Initial Slate.js value
    showWordCount: true,             // Show word count
    stickyToolbar: true,             // Sticky toolbar behavior
    maxHeight: "500px",              // Maximum editor height
    className: "custom-editor",      // Additional CSS classes
    
    // Callbacks
    onChange: (content) => {},       // Content change handler
    onReady: (editor) => {},         // Editor ready callback
    onFocus: () => {},               // Focus event
    onBlur: () => {}                 // Blur event
});
\`\`\`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+E` | Inline Code |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+0` | Normal Text |
| `Ctrl+1-6` | Headings H1-H6 |
| `F11` | Full Screen |
| `Ctrl+K` | Insert Link *(Coming Soon)* |

## 🎨 Theming

### Built-in Themes
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for extended writing

### Custom Themes
Override CSS variables to create custom themes:

\`\`\`css
.brand-nova-editor[data-theme="custom"] {
    --editor-bg: #your-color;
    --editor-text: #your-color;
    --toolbar-bg: #your-color;
    --button-hover: #your-color;
    --border-color: #your-color;
}
\`\`\`

## 🔧 Development

### Local Development
\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Build standalone version
npm run build:standalone
\`\`\`

### Project Structure
\`\`\`
src/
├── components/
│   └── BrandNovaEditor/
│       ├── BrandNovaEditor.jsx    # Main editor component
│       ├── Toolbar.jsx            # Toolbar component
│       └── index.js
├── standalone.js                  # Standalone build entry
└── assets/
    └── logo.png                   # Editor logo
\`\`\`
