# BrandNovaEditor

A powerful, flexible rich text editor built with React and Slate.js, designed for both React applications and standalone HTML usage.

## Features

- 🎨 **Dual Theme Support** - Light and dark themes
- 📝 **Rich Text Formatting** - Bold, italic, underline, strikethrough
- 📋 **Enhanced Markdown Support** - Advanced markdown parsing with mixed formatting and tables
- 🔤 **Typography** - Multiple heading levels, quotes, lists
- 📊 **Table Support** - Basic markdown table parsing and rendering
- ⌨️ **Keyboard Shortcuts** - Standard shortcuts with tooltips (Ctrl+B, Ctrl+I, etc.)
- 🖥️ **Fullscreen Mode** - F11 or toolbar button
- 📊 **Word/Character Count** - Optional status bar
- 📱 **Responsive Design** - Works on all screen sizes
- ♿ **Accessibility** - ARIA labels, keyboard navigation
- 🔧 **Highly Configurable** - Extensive prop customization
- 📦 **Standalone Ready** - Use in any HTML page

## Installation & Build

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production (standalone)
npm run build:standalone
```

## Props Configuration

All props can be configured both in React and via data attributes in standalone mode:

### Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `Node[]` | `[{type: "paragraph", children: [{text: ""}]}]` | Initial Slate.js content |
| `placeholder` | `string` | `"Start writing your content..."` | Placeholder text |
| `onChange` | `function` | `null` | Callback when content changes |
| `theme` | `"light" \| "dark"` | `"light"` | Editor theme |
| `showWordCount` | `boolean` | `true` | Show/hide word and character count |
| `className` | `string` | `""` | Additional CSS classes |
| `maxHeight` | `number \| null` | `null` | Maximum height in pixels (enables scrolling) |
| `stickyToolbar` | `boolean` | `true` | Enable sticky toolbar on scroll |

## Usage Examples

### React Component Usage

```jsx
import BrandNovaEditor from './components/BrandNovaEditor/BrandNovaEditor';

function App() {
  const [content, setContent] = useState([
    { type: "paragraph", children: [{ text: "" }] }
  ]);

  return (
    <BrandNovaEditor
      initialValue={content}
      onChange={setContent}
      theme="dark"
      maxHeight={400}
      showWordCount={true}
      stickyToolbar={false}
      placeholder="Start writing..."
      className="my-editor"
    />
  );
}
```

### Standalone HTML Usage

#### Method 1: Auto-initialization with data attributes

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="dist/brand-nova-editor.css">
</head>
<body>
    <!-- Auto-initialized editor -->
    <div 
        id="my-editor" 
        data-brand-nova-editor
        data-theme="light"
        data-placeholder="Start writing your story..."
        data-show-word-count="true"
        data-max-height="500"
        data-sticky-toolbar="false"
        data-class-name="custom-editor"
    ></div>
    
    <script src="dist/brand-nova-editor.js"></script>
</body>
</html>
```

#### Method 2: Manual initialization

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="dist/brand-nova-editor.css">
</head>
<body>
    <div id="my-editor"></div>
    
    <script src="dist/brand-nova-editor.js"></script>
    <script>
        // Initialize manually
        const editor = window.BrandNovaEditor.init({
            elementId: 'my-editor',
            theme: 'dark',
            placeholder: 'Start writing...',
            maxHeight: 300,
            showWordCount: true,
            stickyToolbar: true,
            onChange: (value) => {
                console.log('Content changed:', value);
            },
            initialValue: [
                { type: 'heading-one', children: [{ text: 'Hello World!' }] },
                { type: 'paragraph', children: [{ text: 'This is a paragraph.' }] }
            ]
        });
    </script>
</body>
</html>
```

## API Reference (Standalone Mode)

### Global Methods

```javascript
// Initialize a new editor instance
const editor = window.BrandNovaEditor.init(options);

// Get existing instance
const editor = window.BrandNovaEditor.getInstance(elementId);

// Destroy specific instance
window.BrandNovaEditor.destroy(elementId);

// Destroy all instances
window.BrandNovaEditor.destroyAll();
```

### Instance Methods

```javascript
const editor = window.BrandNovaEditor.getInstance('my-editor');

// Get HTML content
const html = editor.getHTML();

// Get Slate.js value
const value = editor.getValue();

// Destroy instance
editor.destroy();

// Get DOM element
const element = editor.getElement();
```

## Keyboard Shortcuts

All shortcuts are displayed in tooltips when hovering over toolbar buttons:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` / `Ctrl/Cmd + Shift + Z` | Redo |
| `F11` | Toggle fullscreen |

## Enhanced Markdown Support

The editor automatically parses markdown when pasting with advanced features:

### Basic Formatting
- `# Heading 1` → Heading 1
- `## Heading 2` → Heading 2  
- `### Heading 3` → Heading 3
- `> Quote` → Block quote
- `- Item` or `* Item` → Bullet list
- `1. Item` → Numbered list

### Advanced Inline Formatting
- `**bold**` → **Bold text**
- `*italic*` → *Italic text*
- `***bold and italic***` → ***Bold and italic text***
- `~~strikethrough~~` → ~~Strikethrough~~
- `` `code` `` → `code`
- Mixed formatting: `**bold with *italic* inside**` → **bold with *italic* inside**

### Table Support
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Data A   | Data B   | Data C   |
```

### Code Blocks
```markdown
```javascript
function hello() {
    console.log("Hello World!");
}
```
```

## Toolbar Features

### Enhanced Tooltips
- Hover over any toolbar button to see keyboard shortcuts
- Tooltips appear after 500ms delay
- Theme-aware styling
- Shows both action name and keyboard shortcut

### Button Groups
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3, Paragraph
- **Alignment**: Left, Center, Right, Justify
- **Lists & Quotes**: Quote, Bullet List, Numbered List
- **Actions**: Undo, Redo
- **View**: Fullscreen Toggle

## Responsive Behavior

- **Mobile**: Optimized toolbar layout with smaller buttons
- **Tablet**: Balanced toolbar with adequate spacing
- **Desktop**: Full feature set with sticky toolbar option
- **Print**: Toolbar and status bar hidden automatically

## Accessibility Features

- ARIA labels and roles for all interactive elements
- Keyboard navigation support
- Focus management
- Screen reader announcements
- High contrast mode support
- Reduced motion support
- Proper heading hierarchy

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- **Enhanced Parsing**: New markdown parser is optimized for performance
- **Mixed Formatting**: Handles complex nested formatting efficiently
- **Table Rendering**: Responsive tables with overflow handling
- **Tooltip System**: Minimal overhead with efficient event handling
- **maxHeight**: Use when dealing with very long documents
- **stickyToolbar**: Disable for better performance on mobile
- **onChange**: Debounce external API calls

## Advanced Features

### Table Editing
- Paste markdown tables directly
- Responsive table layout
- Theme-aware styling
- Automatic header detection

### Mixed Format Support
- Handle complex inline formatting combinations
- Proper precedence handling
- Overlap prevention
- Escaped character support

### Enhanced UX
- Tooltip system with keyboard shortcuts
- Smooth theme transitions
- Improved focus management
- Better error handling

## Troubleshooting

### Editor not initializing
```javascript
// Check if element exists
const element = document.getElementById('my-editor');
if (!element) {
    console.error('Element not found');
}

// Check if library loaded
if (!window.BrandNovaEditor) {
    console.error('BrandNovaEditor library not loaded');
}
```

### Markdown not parsing
```javascript
// Ensure content includes markdown syntax
// Tables need proper header separator: |---|---|
// Mixed formatting needs proper nesting
```

### Tooltips not showing
```javascript
// Check CSS is properly loaded
// Ensure buttons are not disabled
// Verify theme is correctly applied
```

### Tables not rendering
```javascript
// Verify table format:
// | Header 1 | Header 2 |
// |----------|----------|
// | Cell 1   | Cell 2   |
```

## License

MIT License - see LICENSE file for details.