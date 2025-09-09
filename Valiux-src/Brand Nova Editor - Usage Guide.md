# BrandNovaEditor

A powerful, flexible rich text editor built with React and Slate.js, designed for both React applications and standalone HTML usage.

## Features

- 🎨 **Dual Theme Support** - Light and dark themes
- 📝 **Rich Text Formatting** - Bold, italic, underline, strikethrough
- 📋 **Enhanced Markdown Support** - Advanced markdown parsing with mixed formatting and tables
- 🔤 **Typography** - Multiple heading levels, quotes, lists
- 📊 **Table Support** - Basic markdown table parsing and rendering
- ⌨️ **Keyboard Shortcuts** - Standard shortcuts with tooltips (Ctrl+B, Ctrl+I, Ctrl+Shift+S, etc.)
- 🖥️ **Fullscreen Mode** - F11 or toolbar button
- 📊 **Word/Character Count** - Optional status bar
- 📱 **Responsive Design** - Works on all screen sizes
- ♿ **Accessibility** - ARIA labels, keyboard navigation
- 🔧 **Configurable Toolbar** - Customize which tools appear in the toolbar
- 🎛️ **Full/Partial Editor Modes** - Switch between full-featured and minimal editors
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
| `fullEditor` | `boolean` | `true` | Enable all toolbar tools (overrides toolbarConfig) |
| `toolbarConfig` | `object` | `DEFAULT_TOOLBAR_CONFIG` | Custom toolbar configuration |

## Toolbar Configuration

### Full vs Partial Editor Modes

- **Full Editor** (`fullEditor: true`): Shows all available tools grouped logically
- **Partial Editor** (`fullEditor: false`): Shows only tools specified in `toolbarConfig`

### Available Tool Groups

```javascript
const DEFAULT_TOOLBAR_CONFIG = {
  formatting: ['bold', 'italic', 'underline', 'strikethrough'],
  headings: ['heading-one', 'heading-two', 'heading-three', 'paragraph'],
  alignment: ['left', 'center', 'right', 'justify'],
  blocks: ['block-quote', 'bulleted-list', 'numbered-list'],
  actions: ['undo', 'redo'],
  fullscreen: ['fullscreen']
}
```

### Custom Toolbar Examples

```javascript
// Minimal editor for comments
const commentConfig = {
  formatting: ['bold', 'italic', 'strikethrough']
}

// Blog post editor
const blogConfig = {
  formatting: ['bold', 'italic', 'underline'],
  headings: ['heading-one', 'heading-two', 'heading-three', 'paragraph'],
  blocks: ['block-quote', 'bulleted-list', 'numbered-list'],
  actions: ['undo', 'redo'],
  fullscreen: ['fullscreen']
}

// Documentation editor
const docsConfig = {
  formatting: ['bold', 'italic', 'underline', 'strikethrough'],
  headings: ['heading-one', 'heading-two', 'heading-three', 'paragraph'],
  alignment: ['left', 'center', 'right'],
  blocks: ['block-quote', 'bulleted-list', 'numbered-list'],
  actions: ['undo', 'redo'],
  fullscreen: ['fullscreen']
}
```

## Usage Examples

### React Component Usage

```jsx
import BrandNovaEditor from './components/BrandNovaEditor/BrandNovaEditor';

function App() {
  const [content, setContent] = useState([
    { type: "paragraph", children: [{ text: "" }] }
  ]);

  // Custom toolbar configuration
  const customToolbar = {
    formatting: ['bold', 'italic'],
    headings: ['heading-one', 'paragraph'],
    actions: ['undo', 'redo']
  };

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
      fullEditor={false}
      toolbarConfig={customToolbar}
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
    <!-- Full editor -->
    <div 
        id="full-editor" 
        data-brand-nova-editor
        data-theme="light"
        data-placeholder="Full editor with all tools..."
        data-full-editor="true"
    ></div>
    
    <!-- Custom toolbar editor -->
    <div 
        id="custom-editor"
        data-brand-nova-editor
        data-theme="dark"
        data-placeholder="Custom toolbar editor..."
        data-full-editor="false"
        data-toolbar-config='{"formatting": ["bold", "italic"], "headings": ["heading-one", "paragraph"], "actions": ["undo", "redo"]}'
        data-max-height="300"
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
        // Custom toolbar configuration
        const customConfig = {
            formatting: ['bold', 'italic', 'strikethrough'],
            headings: ['heading-one', 'heading-two'],
            blocks: ['bulleted-list'],
            actions: ['undo', 'redo']
        };
        
        // Initialize manually
        const editor = window.BrandNovaEditor.init({
            elementId: 'my-editor',
            fullEditor: false,
            toolbarConfig: customConfig,
            theme: 'dark',
            placeholder: 'Start writing...',
            maxHeight: 300,
            showWordCount: true,
            onChange: (value) => {
                console.log('Content changed:', value);
            }
        });
        
        // Helper function for creating configs
        const quickConfig = window.BrandNovaEditor.createConfig(['formatting', 'actions']);
        console.log('Quick config:', quickConfig);
    </script>
</body>
</html>
```

## API Reference (Standalone Mode)

### Global Methods

```javascript
// Initialize a new editor instance
const editor = window.BrandNovaEditor.init(options);

// Create toolbar configuration helper
const config = window.BrandNovaEditor.createConfig(['formatting', 'headings', 'actions']);

// Access default configuration
console.log(window.BrandNovaEditor.DEFAULT_TOOLBAR_CONFIG);

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

### Configuration Helper

```javascript
// Create configuration with specific groups
const config = window.BrandNovaEditor.createConfig([
    'formatting',    // Bold, italic, underline, strikethrough
    'headings',      // H1, H2, H3, paragraph
    'alignment',     // Left, center, right, justify
    'blocks',        // Quote, bulleted list, numbered list
    'actions',       // Undo, redo
    'fullscreen'     // Fullscreen toggle
]);
```

## Keyboard Shortcuts

All shortcuts are displayed in tooltips when hovering over toolbar buttons:

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + Shift + S` | Strikethrough |
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

## Toolbar Configuration Use Cases

### 1. Comment Editor
Perfect for user comments with minimal formatting needs:
```javascript
const commentConfig = {
    formatting: ['bold', 'italic', 'strikethrough']
};
```

### 2. Blog Post Editor
Comprehensive editor for content creation:
```javascript
const blogConfig = {
    formatting: ['bold', 'italic', 'underline'],
    headings: ['heading-one', 'heading-two', 'heading-three', 'paragraph'],
    blocks: ['block-quote', 'bulleted-list', 'numbered-list'],
    actions: ['undo', 'redo'],
    fullscreen: ['fullscreen']
};
```

### 3. Email Composer
Professional email formatting tools:
```javascript
const emailConfig = {
    formatting: ['bold', 'italic', 'underline'],
    alignment: ['left', 'center', 'right'],
    blocks: ['bulleted-list', 'numbered-list'],
    actions: ['undo', 'redo']
};
```

### 4. Note Taking
Quick notes with essential formatting:
```javascript
const noteConfig = {
    formatting: ['bold', 'italic'],
    headings: ['heading-one', 'heading-two', 'paragraph'],
    actions: ['undo', 'redo']
};
```

### 5. Social Media Post
Simple formatting for social platforms:
```javascript
const socialConfig = {
    formatting: ['bold', 'italic', 'strikethrough'],
    blocks: ['bulleted-list']
};
```

## Toolbar Features

### Enhanced Tooltips
- Hover over any toolbar button to see keyboard shortcuts
- Tooltips appear after 500ms delay
- Theme-aware styling
- Shows both action name and keyboard shortcut

### Smart Group Rendering
- **Conditional Groups**: Groups only appear if they contain at least one configured tool
- **Individual Tool Control**: Each tool can be individually enabled/disabled
- **Visual Grouping**: Maintains clean visual separation even with partial tool sets
- **Responsive Layout**: Toolbar adapts to different screen sizes while preserving grouping

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
- **Conditional Rendering**: Only renders configured toolbar tools
- **maxHeight**: Use when dealing with very long documents
- **stickyToolbar**: Disable for better performance on mobile
- **onChange**: Debounce external API calls

## Advanced Features

### Configurable Toolbar System
- **Full Control**: Choose exactly which tools appear in each editor
- **Group Preservation**: Visual grouping maintained even with partial tool sets
- **Easy Configuration**: Simple object-based configuration system
- **Helper Functions**: Built-in helpers for common configurations

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

### Toolbar configuration not working
```javascript
// Ensure fullEditor is set to false
const editor = window.BrandNovaEditor.init({
    elementId: 'my-editor',
    fullEditor: false,  // Required for custom toolbar
    toolbarConfig: customConfig
});

// Check configuration format
const validConfig = {
    formatting: ['bold', 'italic'],  // Array of tool names
    headings: ['heading-one', 'paragraph']
};
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