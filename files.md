// src/components/BrandNovaEditor/BrandNovaEditor.jsx

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { createEditor, Transforms, Editor, Element as SlateElement, Text } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import isHotkey from "is-hotkey"
import Toolbar from "./Toolbar"

import logoImage from "../../assets/logo.png"

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"]

const parseMarkdown = (text) => {
  const lines = text.split("\n")
  const result = []

  for (const line of lines) {
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      result.push({ type: "horizontal-rule", children: [{ text: "" }] })
    } else if (line.startsWith("# ")) {
      result.push({ type: "heading-one", children: [{ text: line.slice(2) }] })
    } else if (line.startsWith("## ")) {
      result.push({ type: "heading-two", children: [{ text: line.slice(3) }] })
    } else if (line.startsWith("### ")) {
      result.push({ type: "heading-three", children: [{ text: line.slice(4) }] })
    } else if (line.startsWith("> ")) {
      result.push({ type: "block-quote", children: [{ text: line.slice(2) }] })
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      result.push({ type: "list-item", children: [{ text: line.slice(2) }] })
    } else if (line.match(/^\d+\. /)) {
      result.push({ type: "list-item", children: [{ text: line.replace(/^\d+\. /, "") }] })
    } else if (line.includes("~~")) {
      const children = parseInlineFormatting(line, "~~", "strikethrough")
      result.push({ type: "paragraph", children })
    } else if (line.trim() === "") {
      result.push({ type: "paragraph", children: [{ text: "" }] })
    } else {
      let children = [{ text: line }]

      if (line.includes("**")) {
        children = parseInlineFormatting(line, "**", "bold")
      }
      if (line.includes("*") && !line.includes("**")) {
        children = parseInlineFormatting(line, "*", "italic")
      }
      if (line.includes("`")) {
        children = parseInlineFormatting(line, "`", "code")
      }

      result.push({ type: "paragraph", children })
    }
  }

  return result.length > 0 ? result : [{ type: "paragraph", children: [{ text: "" }] }]
}

const parseInlineFormatting = (text, marker, format) => {
  const parts = text.split(marker)
  const children = []

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) children.push({ text: parts[i] })
    } else {
      if (parts[i]) children.push({ text: parts[i], [format]: true })
    }
  }

  return children.length > 0 ? children : [{ text }]
}

const BrandNovaEditor = ({
  initialValue = [{ type: "paragraph", children: [{ text: "" }] }],
  placeholder = "Start writing your content...",
  onChange,
  theme = "light",
  showWordCount = true,
  className = "",
  maxHeight = null,
  stickyToolbar = true,
}) => {
  const [value, setValue] = useState(initialValue)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isToolbarSticky, setIsToolbarSticky] = useState(false)
  const editorContainerRef = useRef(null)
  const toolbarRef = useRef(null)
  
  const renderElement = useCallback((props) => <Element {...props} theme={theme} />, [theme])
  const renderLeaf = useCallback((props) => <Leaf {...props} theme={theme} />, [theme])
  
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))

    // Define void elements
    const { isVoid } = e
    e.isVoid = (element) => {
      return element.type === "horizontal-rule" ? true : isVoid(element)
    }

    return e
  }, [])

  // Handle sticky toolbar logic
  useEffect(() => {
    if (!stickyToolbar || maxHeight) {
      setIsToolbarSticky(false)
      return
    }

    const handleScroll = () => {
      if (!editorContainerRef.current || !toolbarRef.current) return

      const containerRect = editorContainerRef.current.getBoundingClientRect()
      const toolbarHeight = toolbarRef.current.offsetHeight
      
      // Make toolbar sticky when container top goes above viewport
      // and unsticky when container bottom is close to viewport top
      const shouldBeSticky = containerRect.top <= 0 && 
                           containerRect.bottom > toolbarHeight + 20

      setIsToolbarSticky(shouldBeSticky)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [stickyToolbar, maxHeight])

  const handleChange = useCallback(
    (newValue) => {
      setValue(newValue)

      const text = newValue
        .map((n) =>
          SlateElement.isElement(n) ? n.children.map((child) => (Text.isText(child) ? child.text : "")).join("") : "",
        )
        .join(" ")
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const chars = text.length
      setWordCount(words)
      setCharCount(chars)

      if (onChange) {
        onChange(newValue)
      }
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (event) => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
      }
    },
    [editor],
  )

  const handlePaste = useCallback(
    (event) => {
      const pastedText = event.clipboardData.getData("text/plain")

      if (
        pastedText.includes("#") ||
        pastedText.includes("**") ||
        pastedText.includes("*") ||
        pastedText.includes("`") ||
        pastedText.includes("> ") ||
        pastedText.includes("- ") ||
        pastedText.includes("---") ||
        pastedText.includes("***") ||
        pastedText.includes("___") ||
        pastedText.includes("~~")
      ) {
        event.preventDefault()

        const parsedContent = parseMarkdown(pastedText)
        Transforms.insertNodes(editor, parsedContent)
      }
    },
    [editor],
  )

  return (
    <div className={`brand-nova-editor ${theme} ${className}`}>
      <div
        ref={editorContainerRef}
        className={`editor-container ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} rounded-lg shadow-lg border overflow-hidden`}
        style={{
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          height: maxHeight ? `${maxHeight}px` : undefined,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Editor Header */}
        <div
          className={`editor-header ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} px-4 py-2 border-b flex items-center justify-between flex-shrink-0`}
        >
          <div className="flex items-center space-x-3">
            <div className="logo-container relative group">
              <img
                src={logoImage || "/placeholder.svg"}
                alt="Brand Nova"
                className="w-7 h-7 rounded-full object-cover shadow-md ring-2 ring-yellow-400/20"
              />
              <div
                className={`absolute left-9 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-black text-white"} px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg`}
                role="tooltip"
                aria-label="Brand Nova Editor"
              >
                BRAND NOVA
              </div>
            </div>
          </div>
          {showWordCount && (
            <div
              className={`flex items-center space-x-4 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              aria-live="polite"
              aria-label={`Content statistics: ${wordCount} words, ${charCount} characters`}
            >
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          )}
        </div>

        <Slate editor={editor} initialValue={value} onValueChange={handleChange}>
          {/* Toolbar Container */}
          <div 
            ref={toolbarRef}
            className={`
              ${isToolbarSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative'} 
              ${!maxHeight && stickyToolbar ? 'transition-all duration-200 ease-in-out' : ''} 
              flex-shrink-0
            `}
            style={isToolbarSticky ? {
              width: editorContainerRef.current?.offsetWidth + 'px',
              marginLeft: editorContainerRef.current?.getBoundingClientRect().left + 'px'
            } : {}}
          >
            <Toolbar 
              theme={theme} 
              isSticky={isToolbarSticky}
              className={isToolbarSticky ? 'rounded-none border-l-0 border-r-0' : ''}
            />
          </div>

          {/* Editor Content */}
          <div
            className={`editor-content p-6 ${theme === "dark" ? "bg-gray-900" : "bg-white"} flex-1`}
            style={{
              overflowY: maxHeight ? "auto" : "visible",
              minHeight: maxHeight ? undefined : "400px",
            }}
            role="textbox"
            aria-multiline="true"
            aria-label="Rich text editor"
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder={placeholder}
              spellCheck
              autoFocus
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className={`${maxHeight ? "min-h-0" : "min-h-[400px]"} focus:outline-none prose prose-lg max-w-none ${theme === "dark" ? "prose-invert" : ""}`}
              aria-describedby={showWordCount ? "word-count" : undefined}
            />
          </div>
        </Slate>
      </div>
    </div>
  )
}

const Element = ({ attributes, children, element, theme = "light" }) => {
  const style = { textAlign: element.align }
  const isDark = theme === "dark"
  
  switch (element.type) {
    case "horizontal-rule":
      return (
        <div {...attributes} contentEditable={false} className="my-6">
          <hr className={`border-t-2 ${isDark ? "border-gray-600" : "border-gray-300"}`} />
          {children}
        </div>
      )
    case "block-quote":
      return (
        <blockquote
          style={style}
          {...attributes}
          className={`border-l-4 border-yellow-400 pl-4 italic ${isDark ? "text-gray-300" : "text-gray-700"} my-4`}
        >
          {children}
        </blockquote>
      )
    case "bulleted-list":
      return (
        <ul style={style} {...attributes} className="list-disc list-inside my-4 space-y-2">
          {children}
        </ul>
      )
    case "heading-one":
      return (
        <h1 style={style} {...attributes} className={`text-3xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"} my-4`}>
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 style={style} {...attributes} className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"} my-3`}>
          {children}
        </h2>
      )
    case "heading-three":
      return (
        <h3 style={style} {...attributes} className={`text-xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"} my-3`}>
          {children}
        </h3>
      )
    case "list-item":
      return (
        <li style={style} {...attributes} className="my-1">
          {children}
        </li>
      )
    case "numbered-list":
      return (
        <ol style={style} {...attributes} className="list-decimal list-inside my-4 space-y-2">
          {children}
        </ol>
      )
    case "link":
      return (
        <a {...attributes} href={element.url} className="text-yellow-600 hover:text-yellow-700 underline">
          {children}
        </a>
      )
    default:
      return (
        <p style={style} {...attributes} className="my-2 leading-relaxed">
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf, theme = "light" }) => {
  const isDark = theme === "dark"
  
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = (
      <code className={`px-1 py-0.5 rounded text-sm font-mono ${isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
        {children}
      </code>
    )
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>
  }

  return <span {...attributes}>{children}</span>
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? "align" : "type")
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    }
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    }),
  )

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

export default BrandNovaEditor
export { toggleBlock, toggleMark, isBlockActive, isMarkActive }


// src\components\BrandNovaEditor\Toolbar.jsx

// src/components/BrandNovaEditor/Toolbar.jsx

import { useSlate } from "slate-react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus
} from "lucide-react"
import { toggleBlock, toggleMark, isBlockActive, isMarkActive } from "./BrandNovaEditor"

const Toolbar = ({ theme = "light", isSticky = false, className = "" }) => {
  const editor = useSlate()

  const toolbarGroups = [
    {
      name: "Text Formatting",
      items: [
        { type: "mark", format: "bold", icon: Bold, label: "Bold (Ctrl+B)", shortcut: "Ctrl+B" },
        { type: "mark", format: "italic", icon: Italic, label: "Italic (Ctrl+I)", shortcut: "Ctrl+I" },
        { type: "mark", format: "underline", icon: Underline, label: "Underline (Ctrl+U)", shortcut: "Ctrl+U" },
        { type: "mark", format: "strikethrough", icon: Strikethrough, label: "Strikethrough", shortcut: null },
        { type: "mark", format: "code", icon: Code, label: "Inline Code (Ctrl+`)", shortcut: "Ctrl+`" },
      ]
    },
    {
      name: "Headings",
      items: [
        { type: "block", format: "heading-one", icon: Heading1, label: "Heading 1", shortcut: null },
        { type: "block", format: "heading-two", icon: Heading2, label: "Heading 2", shortcut: null },
        { type: "block", format: "heading-three", icon: Heading3, label: "Heading 3", shortcut: null },
      ]
    },
    {
      name: "Lists and Blocks",
      items: [
        { type: "block", format: "bulleted-list", icon: List, label: "Bullet List", shortcut: null },
        { type: "block", format: "numbered-list", icon: ListOrdered, label: "Numbered List", shortcut: null },
        { type: "block", format: "block-quote", icon: Quote, label: "Block Quote", shortcut: null },
        { type: "block", format: "horizontal-rule", icon: Minus, label: "Horizontal Rule", shortcut: null },
      ]
    },
    {
      name: "Alignment",
      items: [
        { type: "align", format: "left", icon: AlignLeft, label: "Align Left", shortcut: null },
        { type: "align", format: "center", icon: AlignCenter, label: "Center", shortcut: null },
        { type: "align", format: "right", icon: AlignRight, label: "Align Right", shortcut: null },
        { type: "align", format: "justify", icon: AlignJustify, label: "Justify", shortcut: null },
      ]
    }
  ]

  const handleButtonClick = (item, event) => {
    event.preventDefault()
    
    if (item.type === "mark") {
      toggleMark(editor, item.format)
    } else if (item.type === "block") {
      if (item.format === "horizontal-rule") {
        // Special handling for horizontal rule
        editor.insertNode({ type: "horizontal-rule", children: [{ text: "" }] })
      } else {
        toggleBlock(editor, item.format)
      }
    } else if (item.type === "align") {
      toggleBlock(editor, item.format)
    }
  }

  const isActive = (item) => {
    if (item.type === "mark") {
      return isMarkActive(editor, item.format)
    } else if (item.type === "block") {
      return isBlockActive(editor, item.format)
    } else if (item.type === "align") {
      return isBlockActive(editor, item.format, "align")
    }
    return false
  }

  return (
    <div
      className={`toolbar ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} border-b px-6 py-3 ${className}`}
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      <div className="flex flex-wrap items-center gap-2">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={group.name} className="flex items-center gap-1">
            <div 
              className="flex items-center gap-1"
              role="group"
              aria-label={group.name}
            >
              {group.items.map((item) => {
                const IconComponent = item.icon
                const active = isActive(item)
                
                return (
                  <ToolbarButton
                    key={item.format}
                    theme={theme}
                    active={active}
                    onMouseDown={(event) => handleButtonClick(item, event)}
                    aria-label={item.label}
                    aria-pressed={active}
                    title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                  >
                    <IconComponent size={16} aria-hidden="true" />
                  </ToolbarButton>
                )
              })}
            </div>
            
            {/* Group separator */}
            {groupIndex < toolbarGroups.length - 1 && (
              <div 
                className={`w-px h-6 mx-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}
                role="separator"
                aria-orientation="vertical"
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite" id="toolbar-instructions">
        Use the toolbar buttons to format your text. Press Tab to navigate between buttons, Space or Enter to activate.
      </div>
    </div>
  )
}

const ToolbarButton = ({ active, children, theme = "light", className = "", ...props }) => {
  const baseStyles = "p-2 rounded transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
  
  const activeStyles = active
    ? "bg-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-200"
    : ""
    
  const hoverStyles = theme === "dark"
    ? "text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-sm"
    : "text-gray-600 hover:bg-gray-200 hover:text-gray-800 hover:shadow-sm"
  
  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"

  return (
    <button
      type="button"
      className={`
        ${baseStyles}
        ${active ? activeStyles : hoverStyles}
        ${disabledStyles}
        ${className}
      `}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </button>
  )
}

export default Toolbar


// src\components\BrandNovaEditor\index.js

export { default } from "./BrandNovaEditor"


// src\App.jsx

import BrandNovaEditor from "./components/BrandNovaEditor"

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BrandNovaEditor />
      </div>
    </div>
  )
}

export default App


// src\standalone.js

import React from "react"
import { createRoot } from "react-dom/client"
import BrandNovaEditor from "./components/BrandNovaEditor"
import "./index.css"

// Global initialization function for standalone usage
window.BrandNovaEditor = {
  init: (options = {}) => {
    const {
      elementId = "brand-nova-editor",
      initialValue = [{ type: "paragraph", children: [{ text: "" }] }],
      placeholder = "Start writing your content...",
      onChange = null,
      theme = "light",
      showWordCount = true,
      className = "",
      maxHeight = null,
      stickyToolbar = true,
    } = options

    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id "${elementId}" not found`)
      return null
    }

    const root = createRoot(element)

    const EditorWrapper = () =>
      React.createElement(BrandNovaEditor, {
        initialValue: initialValue,
        placeholder: placeholder,
        onChange: onChange,
        theme: theme,
        showWordCount: showWordCount,
        className: className,
        maxHeight: maxHeight,
        stickyToolbar: stickyToolbar,
      })

    root.render(React.createElement(EditorWrapper))

    return {
      destroy: () => root.unmount(),
      getElement: () => element,
    }
  },
}

// Auto-initialize if data attributes are present
document.addEventListener("DOMContentLoaded", () => {
  const autoInitElements = document.querySelectorAll("[data-brand-nova-editor]")

  autoInitElements.forEach((element) => {
    const options = {
      elementId: element.id,
      theme: element.dataset.theme || "light",
      placeholder: element.dataset.placeholder || "Start writing your content...",
      showWordCount: element.dataset.showWordCount !== "false",
      maxHeight: element.dataset.maxHeight ? Number.parseInt(element.dataset.maxHeight) : null,
      stickyToolbar: element.dataset.stickyToolbar !== "false",
    }

    window.BrandNovaEditor.init(options)
  })
})


// src/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Enhanced styles for Brand Nova Editor */

/* Base editor styles */
.brand-nova-editor {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
}

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles for better accessibility */
.brand-nova-editor *:focus {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.brand-nova-editor button:focus {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
  z-index: 10;
}

/* Toolbar enhancements */
.toolbar {
  position: relative;
  z-index: 30;
}

.toolbar.sticky-active {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Dark theme toolbar when sticky */
.brand-nova-editor.dark .toolbar.sticky-active {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

/* Smooth transitions for toolbar */
.toolbar {
  transition: all 0.2s ease-in-out;
}

/* Button hover and active states */
.toolbar button {
  position: relative;
  transition: all 0.15s ease-in-out;
  border: 1px solid transparent;
}

.toolbar button:hover {
  transform: translateY(-1px);
}

.toolbar button:active {
  transform: translateY(0);
}

/* Enhanced button active states */
.toolbar button[aria-pressed="true"] {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  position: relative;
}

.toolbar button[aria-pressed="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
  border-radius: inherit;
  pointer-events: none;
}

/* Group separators */
.toolbar [role="separator"] {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.brand-nova-editor.dark .toolbar [role="separator"] {
  opacity: 0.3;
}

/* Editor content enhancements */
.editor-content {
  position: relative;
}

/* Prosemirror-like focus ring for content area */
.editor-content [contenteditable]:focus {
  outline: none;
}

/* Word count accessibility */
[aria-live="polite"] {
  font-variant-numeric: tabular-nums;
}

/* Loading states */
.toolbar button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none !important;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .brand-nova-editor {
    --toolbar-border: 2px solid;
    --button-border: 1px solid;
  }

  .toolbar {
    border-width: 2px;
  }

  .toolbar button {
    border-width: 1px;
    border-style: solid;
  }

  .toolbar button[aria-pressed="true"] {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .brand-nova-editor *,
  .brand-nova-editor *::before,
  .brand-nova-editor *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .toolbar button:hover {
    transform: none;
  }
}

/* Print styles */
@media print {
  .toolbar,
  .editor-header {
    display: none !important;
  }

  .editor-content {
    box-shadow: none !important;
    border: none !important;
  }

  .brand-nova-editor {
    background: white !important;
    color: black !important;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .toolbar {
    padding: 0.75rem 1rem;
  }

  .toolbar > div {
    gap: 0.25rem;
  }

  .toolbar button {
    padding: 0.5rem;
    min-width: 2.5rem;
    min-height: 2.5rem;
  }

  /* Stack toolbar groups on very small screens */
  @media (max-width: 480px) {
    .toolbar > div {
      flex-wrap: wrap;
    }

    .toolbar [role="group"] {
      margin-bottom: 0.5rem;
    }

    .toolbar [role="separator"] {
      display: none;
    }
  }
}

/* Enhanced tooltip styles */
.logo-container [role="tooltip"] {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
