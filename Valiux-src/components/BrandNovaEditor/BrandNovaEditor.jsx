// src/components/BrandNovaEditor/BrandNovaEditor.jsx
import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { createEditor, Transforms, Editor, Element as SlateElement, Text } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import isHotkey from "is-hotkey"
import Toolbar from "./Toolbar"

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
  "mod+z": "undo",
  "mod+shift+z": "redo",
  "mod+y": "redo",
  "f11": "fullscreen",
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"]

const parseMarkdown = (text) => {
  const lines = text.split("\n")
  const result = []
  let inCodeBlock = false
  let codeLanguage = ""
  let codeContent = []

  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        result.push({
          type: "code-block",
          language: codeLanguage,
          children: [{ text: codeContent.join("\n") }]
        })
        inCodeBlock = false
        codeLanguage = ""
        codeContent = []
      } else {
        // Start code block
        inCodeBlock = true
        codeLanguage = line.slice(3).trim() || "text"
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

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

// Convert Slate content to HTML
const serializeToHTML = (nodes) => {
  return nodes.map(node => {
    if (Text.isText(node)) {
      let text = node.text
      if (node.bold) text = `<strong>${text}</strong>`
      if (node.italic) text = `<em>${text}</em>`
      if (node.underline) text = `<u>${text}</u>`
      if (node.strikethrough) text = `<del>${text}</del>`
      if (node.code) text = `<code>${text}</code>`
      return text
    }

    const children = node.children.map(n => serializeToHTML([n])).join('')
    
    switch (node.type) {
      case 'paragraph': return `<p>${children}</p>`
      case 'heading-one': return `<h1>${children}</h1>`
      case 'heading-two': return `<h2>${children}</h2>`
      case 'heading-three': return `<h3>${children}</h3>`
      case 'block-quote': return `<blockquote>${children}</blockquote>`
      case 'bulleted-list': return `<ul>${children}</ul>`
      case 'numbered-list': return `<ol>${children}</ol>`
      case 'list-item': return `<li>${children}</li>`
      case 'code-block': return `<pre><code class="language-${node.language || 'text'}">${children}</code></pre>`
      case 'horizontal-rule': return '<hr>'
      default: return `<p>${children}</p>`
    }
  }).join('')
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const editorContainerRef = useRef(null)
  
  const renderElement = useCallback((props) => <Element {...props} theme={theme} />, [theme])
  const renderLeaf = useCallback((props) => <Leaf {...props} theme={theme} />, [theme])
  
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))

    // Define void elements
    const { isVoid } = e
    e.isVoid = (element) => {
      return ["horizontal-rule"].includes(element.type) ? true : isVoid(element)
    }

    return e
  }, [])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

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
          const action = HOTKEYS[hotkey]
          
          if (action === "undo") {
            editor.undo()
          } else if (action === "redo") {
            editor.redo()
          } else if (action === "fullscreen") {
            toggleFullscreen()
          } else {
            toggleMark(editor, action)
          }
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

  const toggleFullscreen = useCallback(async () => {
    if (!editorContainerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await editorContainerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.warn('Fullscreen not supported:', error)
    }
  }, [])

  const getHTML = useCallback(() => {
    return serializeToHTML(value)
  }, [value])

  // Determine if toolbar should be sticky
  const shouldUseSticky = stickyToolbar && !maxHeight && !isFullscreen

  return (
    <div className={`rich-text-editor transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} ${className} ${isFullscreen ? 'fullscreen-editor' : ''}`}>
      <div
        ref={editorContainerRef}
        className={`editor-container border rounded-xl shadow-lg transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50'
            : 'bg-white/80 backdrop-blur-sm border-gray-200/50'
        } ${isFullscreen ? 'fullscreen-container rounded-none border-0' : ''} ${maxHeight ? 'overflow-hidden' : ''}`}
        style={{
          maxHeight: isFullscreen ? '100vh' : (maxHeight ? `${maxHeight}px` : undefined),
          height: isFullscreen ? '100vh' : (maxHeight ? `${maxHeight}px` : undefined),
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Slate editor={editor} initialValue={value} onValueChange={handleChange}>
          {/* Toolbar */}
          <div 
            className={`toolbar-wrapper ${shouldUseSticky ? 'sticky-toolbar' : 'static-toolbar'}`}
          >
            <Toolbar 
              theme={theme} 
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              stickyEnabled={shouldUseSticky}
            />
          </div>

          {/* Editor Content */}
          <div
            className={`editor-content p-6 transition-colors duration-300 flex-1 ${
              theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
            }`}
            style={{
              overflowY: maxHeight || isFullscreen ? "auto" : "visible",
              minHeight: maxHeight || isFullscreen ? undefined : "400px",
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
              className={`${maxHeight || isFullscreen ? "min-h-0" : "min-h-[400px]"} focus:outline-none leading-relaxed ${theme === "dark" ? "text-gray-100 placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              style={{ fontSize: "16px", lineHeight: "1.7" }}
              aria-describedby={showWordCount ? "word-count" : undefined}
            />
          </div>

          {/* Word Count Footer */}
          {showWordCount && (
            <div
              className={`px-6 py-3 border-t transition-colors duration-300 ${
                theme === "dark" 
                  ? "border-gray-700/50 bg-gray-800/80 text-gray-400" 
                  : "border-gray-200/50 bg-white/80 text-gray-600"
              } text-sm flex justify-end space-x-4 flex-shrink-0`}
              id="word-count"
              aria-live="polite"
              aria-label={`Content statistics: ${wordCount} words, ${charCount} characters`}
            >
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              {isFullscreen && <span className="text-amber-500">Fullscreen</span>}
            </div>
          )}
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
          className={`border-l-4 border-amber-400 pl-4 italic ${isDark ? "text-gray-300 bg-gray-800/50" : "text-gray-700 bg-amber-50/50"} my-4 py-2 rounded-r-lg`}
        >
          {children}
        </blockquote>
      )
    case "bulleted-list":
      return (
        <ul style={style} {...attributes} className="list-disc list-inside my-4 space-y-2 ml-4">
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
        <ol style={style} {...attributes} className="list-decimal list-inside my-4 space-y-2 ml-4">
          {children}
        </ol>
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
      <code className={`px-2 py-1 rounded text-sm font-mono ${isDark ? "bg-gray-700 text-amber-400" : "bg-amber-100 text-amber-600"}`}>
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