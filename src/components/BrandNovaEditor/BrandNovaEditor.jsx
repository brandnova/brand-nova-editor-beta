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