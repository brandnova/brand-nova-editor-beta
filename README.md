# Brand Nova Editor

A customizable rich text editor built with React and Slate.js. Designed for easy integration into Django, HTML, PHP, and other web projects via standalone JavaScript and CSS files.

## Features

- **Three Preset Configurations**: Minimal, Standard, and Full
- **Customizable Theming**: Light/dark themes with color overrides
- **Enhanced Markdown Paste Support**: Auto-formatting for pasted markdown content including tables, checklists, multi-line quotes, and links (Standard and Full presets)
- **Paragraph Tool**: Reset formatting to normal text with dedicated paragraph button
- **Auto-Reset Headings**: Automatically converts headings to paragraphs when pressing Enter
- **Text Alignment**: Left, center, right, and justify alignment (Full preset only)
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Standalone Deployment**: Generate JS/CSS files for any web framework
- **Real-time Configuration**: Live preview of configuration changes
- **Demo HTML**: Included demo file for testing standalone builds

## Preset Configurations

### Minimal
- **Tools**: Bold, Italic, Underline, Strikethrough, Heading 1, Paragraph Tool
- **Features**: Word count

### Standard  
- **Tools**: Bold, Italic, Underline, Strikethrough, Headings 1-3, Bulleted Lists, Numbered Lists, Paragraph Tool
- **Features**: Word count, Enhanced markdown paste support

### Full
- **Tools**: All formatting options + Text alignment (left, center, right, justify), Block quotes, Horizontal rules, Code formatting, Paragraph Tool
- **Features**: Word count, Enhanced markdown paste support, Sticky toolbar

## Installation & Setup

### For React Projects

\`\`\`bash
npm install
npm start
\`\`\`

### For Django/HTML/PHP Projects

1. **Build standalone files**:
   \`\`\`bash
   npm run build:standalone
   \`\`\`

2. **Include in your template**:
   \`\`\`html
   <link rel="stylesheet" href="path/to/brand-nova-editor.css">
   <script src="path/to/brand-nova-editor.js"></script>
   \`\`\`

3. **Auto-initialization with data attributes**:
   \`\`\`html
   <div 
     id="my-editor" 
     data-brand-nova-editor
     data-preset="full"
     data-theme="dark"
     data-colors='{"primary": "#10b981", "background": "#1f2937", "text": "#f9fafb"}'
     data-compact="true"
   ></div>
   \`\`\`

4. **Manual initialization**:
   \`\`\`html
   <div id="editor"></div>
   
   <script>
   BrandNovaEditor.init({
     elementId: 'editor',
     preset: 'standard',
     theme: 'light',
     placeholder: 'Start writing...',
     colors: {
       primary: '#3b82f6',
       background: '#ffffff',
       text: '#1f2937',
       textSecondary: '#6b7280',
       border: '#e5e7eb',
       toolbarBg: '#f9fafb',
       hoverBg: '#f3f4f6',
       accent: '#10b981'
     },
     compact: false,
     features: ['wordCount', 'stickyToolbar'],
     onChange: function(content) {
       console.log('Content changed:', content);
     }
   });
   </script>
   \`\`\`

## Testing Standalone Build

After running `npm run build:standalone`, open `dist-standalone/demo.html` in your browser to test the editor with live configuration controls and full feature examples.

## Configuration Options

### Complete Configuration Object
\`\`\`javascript
BrandNovaEditor.init({
  elementId: "editor-id",           // Required: DOM element ID
  preset: "full",                   // "minimal" | "standard" | "full"
  theme: "light",                   // "light" | "dark"
  compact: false,                   // Boolean: compact layout
  
  // Color customization
  colors: {
    primary: "#3b82f6",            // Brand/accent color
    background: "#ffffff",          // Editor background
    text: "#1f2937",               // Main text color
    textSecondary: "#6b7280",      // Secondary text
    border: "#e5e7eb",             // Border colors
    toolbarBg: "#f9fafb",          // Toolbar background
    hoverBg: "#f3f4f6",            // Hover states
    accent: "#10b981"              // Success/accent color
  },
  
  // Feature control
  features: [                      // Array or "all" | "basic" | "standard"
    "wordCount",                   // Show word/character count
    "markdownPaste",               // Enhanced markdown paste (standard & full presets)
    "stickyToolbar"                // Sticky toolbar on scroll
  ],
  
  // Content options
  placeholder: "Start writing...",  // Placeholder text
  initialValue: [...],             // Initial Slate.js value
  onChange: (value) => {...}       // Change callback
});
\`\`\`

### Enhanced Markdown Support (Standard & Full Presets)

The editor automatically formats pasted markdown content including:
- **Headings**: `# ## ###` (H1, H2, H3 only)
- **Lists**: Bulleted (`- *`) and numbered (`1. 2.`)
- **Tables**: Full table support with `|` separators and improved styling
- **Checklists**: `- [ ]` and `- [x]` checkbox items with enhanced visual styling
- **Multi-line quotes**: `>` with proper line breaks
- **Links**: `[text](url)` format
- **Inline formatting**: Bold (`**`), italic (`*`), code (`` ` ``), strikethrough (`~~`)
- **Horizontal rules**: `---`, `***`, `___`

### Editor Behavior Features

- **Auto-Reset Headings**: When typing in a heading (H1, H2, H3) and pressing Enter, the next line automatically becomes a paragraph
- **Paragraph Tool**: Click the paragraph button in the toolbar to reset any formatted text back to normal paragraph formatting
- **Text Alignment**: Use alignment tools (Full preset) to align text left, center, right, or justify
- **Enhanced Table Styling**: Tables now render with proper borders, padding, and rounded corners
- **Improved Checklist Display**: Checkboxes are properly styled with theme colors and better alignment

### Advanced Customization

Edit `src/theme-config.js` to customize:
- **Colors**: Primary, background, text, borders, hover states
- **Typography**: Font family, sizes, line height  
- **Spacing**: Padding, margins, border radius, border width
- **Component styling**: Toolbar height, button sizes, editor min-height
- **Preset configurations**: Modify which tools appear in each preset

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server (with live configuration controls)
npm start

# Build for production
npm run build

# Build standalone files
npm run build:standalone

# Test standalone build
# Open dist-standalone/demo.html in browser
\`\`\`

## File Structure

\`\`\`
src/
├── components/BrandNovaEditor/
│   ├── BrandNovaEditor.jsx    # Main editor component
│   └── Toolbar.jsx            # Toolbar component
├── theme-config.js            # Customization settings
├── App.jsx                    # Development app with live controls
├── standalone.js              # Standalone initialization
└── main.jsx                   # React entry point

public/
└── demo.html                  # Demo file for standalone testing

dist-standalone/               # Generated after build:standalone
├── brand-nova-editor.js       # Standalone JavaScript
├── brand-nova-editor.css      # Standalone CSS
└── demo.html                  # Demo file (copied from public/)
\`\`\`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use in commercial projects.
