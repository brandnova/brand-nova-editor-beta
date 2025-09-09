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
  "mod+shift+s": "strikethrough", // Added strikethrough shortcut
  "mod+z": "undo",
  "mod+shift+z": "redo",
  "mod+y": "redo",
  "f11": "fullscreen",
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"]

// Default toolbar configuration - all tools available
const DEFAULT_TOOLBAR_CONFIG = {
  formatting: ['bold', 'italic', 'underline', 'strikethrough'],
  headings: ['heading-one', 'heading-two', 'heading-three', 'paragraph'],
  alignment: ['left', 'center', 'right', 'justify'],
  blocks: ['block-quote', 'bulleted-list', 'numbered-list'],
  actions: ['undo', 'redo'],
  fullscreen: ['fullscreen']
}

// Enhanced inline formatting parser that handles mixed formats
const parseInlineFormatting = (text) => {
  // Define formatting patterns in order of precedence
  const patterns = [
    { regex: /\*\*\*(.*?)\*\*\*/g, format: ['bold', 'italic'] },
    { regex: /\*\*(.*?)\*\*/g, format: ['bold'] },
    { regex: /\*(.*?)\*/g, format: ['italic'] },
    { regex: /~~(.*?)~~/g, format: ['strikethrough'] },
    { regex: /`(.*?)`/g, format: ['code'] },
  ]

  // Track all formatting matches
  const matches = []
  patterns.forEach(pattern => {
    let match
    while ((match = pattern.regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        format: pattern.format,
        original: match[0]
      })
    }
  })

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start)

  // Remove overlapping matches (keep the first one)
  const validMatches = []
  matches.forEach(match => {
    const overlaps = validMatches.some(existing => 
      (match.start < existing.end && match.end > existing.start)
    )
    if (!overlaps) {
      validMatches.push(match)
    }
  })

  // If no formatting found, return simple text
  if (validMatches.length === 0) {
    return [{ text }]
  }

  // Build the result array
  const result = []
  let currentIndex = 0

  validMatches.forEach(match => {
    // Add text before the match
    if (match.start > currentIndex) {
      result.push({ text: text.slice(currentIndex, match.start) })
    }

    // Add the formatted text
    const formatObj = { text: match.text }
    match.format.forEach(fmt => {
      formatObj[fmt] = true
    })
    result.push(formatObj)

    currentIndex = match.end
  })

  // Add remaining text
  if (currentIndex < text.length) {
    result.push({ text: text.slice(currentIndex) })
  }

  return result.filter(item => item.text !== '')
}

// Parse basic table structure
const parseTable = (lines, startIndex) => {
  const tableLines = []
  let currentIndex = startIndex

  // Check if it's a valid table (needs header separator)
  if (currentIndex + 1 >= lines.length) return null
  
  const headerLine = lines[currentIndex]
  const separatorLine = lines[currentIndex + 1]
  
  // Basic table validation
  if (!headerLine.includes('|') || !separatorLine.match(/^\s*\|?[\s\-\|:]+\|?\s*$/)) {
    return null
  }

  // Parse header
  const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
  tableLines.push({ type: 'table-header', children: headers.map(header => ({ text: header })) })
  
  currentIndex += 2 // Skip header and separator

  // Parse rows
  while (currentIndex < lines.length && lines[currentIndex].includes('|')) {
    const row = lines[currentIndex].split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    if (row.length > 0) {
      tableLines.push({ type: 'table-row', children: row.map(cell => ({ text: cell })) })
    }
    currentIndex++
  }

  return {
    nodes: [{ type: 'table', children: tableLines }],
    linesConsumed: currentIndex - startIndex
  }
}

const parseMarkdown = (text) => {
  const lines = text.split("\n")
  const result = []
  let inCodeBlock = false
  let codeLanguage = ""
  let codeContent = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

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
      i++
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      i++
      continue
    }

    // Check for table
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?[\s\-\|:]+\|?\s*$/)) {
      const tableResult = parseTable(lines, i)
      if (tableResult) {
        result.push(...tableResult.nodes)
        i += tableResult.linesConsumed
        continue
      }
    }

    // Handle other markdown elements
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      result.push({ type: "horizontal-rule", children: [{ text: "" }] })
    } else if (line.startsWith("# ")) {
      const children = parseInlineFormatting(line.slice(2))
      result.push({ type: "heading-one", children })
    } else if (line.startsWith("## ")) {
      const children = parseInlineFormatting(line.slice(3))
      result.push({ type: "heading-two", children })
    } else if (line.startsWith("### ")) {
      const children = parseInlineFormatting(line.slice(4))
      result.push({ type: "heading-three", children })
    } else if (line.startsWith("> ")) {
      const children = parseInlineFormatting(line.slice(2))
      result.push({ type: "block-quote", children })
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const children = parseInlineFormatting(line.slice(2))
      result.push({ type: "list-item", children })
    } else if (line.match(/^\d+\. /)) {
      const children = parseInlineFormatting(line.replace(/^\d+\. /, ""))
      result.push({ type: "list-item", children })
    } else if (line.trim() === "") {
      result.push({ type: "paragraph", children: [{ text: "" }] })
    } else {
      const children = parseInlineFormatting(line)
      result.push({ type: "paragraph", children })
    }

    i++
  }

  return result.length > 0 ? result : [{ type: "paragraph", children: [{ text: "" }] }]
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
      case 'table': return `<table>${children}</table>`
      case 'table-header': return `<thead><tr>${node.children.map(cell => `<th>${serializeToHTML([cell])}</th>`).join('')}</tr></thead>`
      case 'table-row': return `<tr>${node.children.map(cell => `<td>${serializeToHTML([cell])}</td>`).join('')}</tr>`
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
  fullEditor = true,
  toolbarConfig = DEFAULT_TOOLBAR_CONFIG,
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

  // Determine the effective toolbar configuration
  const effectiveToolbarConfig = useMemo(() => {
    return fullEditor ? DEFAULT_TOOLBAR_CONFIG : toolbarConfig
  }, [fullEditor, toolbarConfig])

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

      // Enhanced markdown detection
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
        pastedText.includes("~~") ||
        pastedText.includes("|") ||
        pastedText.match(/^\d+\. /m)
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
              toolbarConfig={effectiveToolbarConfig}
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
    case "table":
      return (
        <div className="my-4 overflow-x-auto">
          <table {...attributes} className={`min-w-full border-collapse border ${isDark ? "border-gray-600" : "border-gray-300"}`}>
            <tbody>{children}</tbody>
          </table>
        </div>
      )
    case "table-header":
      return (
        <tr {...attributes} className={isDark ? "bg-gray-700" : "bg-gray-100"}>
          {element.children.map((cell, index) => (
            <th key={index} className={`border px-4 py-2 text-left font-semibold ${isDark ? "border-gray-600" : "border-gray-300"}`}>
              {cell.text}
            </th>
          ))}
          {children}
        </tr>
      )
    case "table-row":
      return (
        <tr {...attributes}>
          {element.children.map((cell, index) => (
            <td key={index} className={`border px-4 py-2 ${isDark ? "border-gray-600" : "border-gray-300"}`}>
              {cell.text}
            </td>
          ))}
          {children}
        </tr>
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