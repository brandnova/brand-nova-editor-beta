// src/components/BrandNovaEditor/BrandNovaEditor.jsx

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { createEditor, Transforms, Editor, Element as SlateElement, Text } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import isHotkey from "is-hotkey"
import Toolbar from "./Toolbar"
import { themeConfig, presets } from "../../theme-config"

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
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Handle tables
    if (line.includes("|") && lines[i + 1] && lines[i + 1].includes("|")) {
      const tableRows = []
      let j = i

      // Collect all table rows, skip separator lines
      while (j < lines.length && lines[j].includes("|")) {
        if (!lines[j].match(/^[\s|\-:]+$/)) {
          const cells = lines[j]
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell !== "")
          if (cells.length > 0) {
            tableRows.push({
              type: "table-row",
              children: cells.map((cell) => ({
                type: "table-cell",
                children: [{ text: cell }],
              })),
            })
          }
        }
        j++
      }

      if (tableRows.length > 0) {
        result.push({
          type: "table",
          children: tableRows,
        })
      }
      i = j
      continue
    }

    if (line.match(/^[\s]*[-*] \[([ xX])\] /)) {
      const checked = line.includes("[x]") || line.includes("[X]")
      const text = line.replace(/^[\s]*[-*] \[([ xX])\] /, "")
      result.push({
        type: "check-list-item",
        checked: checked,
        children: [{ text: text }],
      })
    }
    // Handle horizontal rules
    else if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      result.push({ type: "horizontal-rule", children: [{ text: "" }] })
    }
    // Handle headings
    else if (line.startsWith("# ")) {
      result.push({ type: "heading-one", children: [{ text: line.slice(2) }] })
    } else if (line.startsWith("## ")) {
      result.push({ type: "heading-two", children: [{ text: line.slice(3) }] })
    } else if (line.startsWith("### ")) {
      result.push({ type: "heading-three", children: [{ text: line.slice(4) }] })
    }
    // Handle multi-line quotes
    else if (line.startsWith("> ")) {
      const quoteLines = []
      let j = i

      // Collect all consecutive quote lines
      while (j < lines.length && lines[j].startsWith("> ")) {
        quoteLines.push(lines[j].slice(2))
        j++
      }

      result.push({
        type: "block-quote",
        children: [{ text: quoteLines.join("\n") }],
      })
      i = j
      continue
    }
    // Handle bullet lists
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      result.push({ type: "list-item", children: [{ text: line.slice(2) }] })
    }
    // Handle numbered lists
    else if (line.match(/^\d+\. /)) {
      result.push({ type: "list-item", children: [{ text: line.replace(/^\d+\. /, "") }] })
    }
    // Handle empty lines
    else if (line.trim() === "") {
      result.push({ type: "paragraph", children: [{ text: "" }] })
    }
    // Handle regular paragraphs with inline formatting
    else {
      const children = parseInlineFormatting(line)
      result.push({ type: "paragraph", children })
    }

    i++
  }

  return result.length > 0 ? result : [{ type: "paragraph", children: [{ text: "" }] }]
}

const parseInlineFormatting = (text) => {
  const children = []
  const currentText = text

  // Parse links first [text](url)
  const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index)
      children.push(...parseOtherFormatting(beforeText))
    }

    // Add the link
    children.push({
      type: "link",
      url: match[2],
      children: [{ text: match[1] }],
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last link
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    children.push(...parseOtherFormatting(remainingText))
  }

  // If no links found, parse other formatting
  if (children.length === 0) {
    return parseOtherFormatting(text)
  }

  return children
}

const parseOtherFormatting = (text) => {
  // Handle bold, italic, code, strikethrough
  const parts = []
  const currentIndex = 0

  // Simple approach: handle one format at a time
  if (text.includes("**")) {
    return parseInlineFormat(text, "**", "bold")
  }
  if (text.includes("*") && !text.includes("**")) {
    return parseInlineFormat(text, "*", "italic")
  }
  if (text.includes("`")) {
    return parseInlineFormat(text, "`", "code")
  }
  if (text.includes("~~")) {
    return parseInlineFormat(text, "~~", "strikethrough")
  }

  return [{ text }]
}

const parseInlineFormat = (text, marker, format) => {
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

  preset = "standard", // "minimal", "standard", "full"
  colors = {}, // Color overrides
  compact = false, // Compact layout
  features = "all", // "basic", "standard", "all" or array
  theme = "light", // Keep for backward compatibility
}) => {
  const currentTheme = useMemo(() => {
    const baseColors = themeConfig.colors[theme] || themeConfig.colors.light
    return {
      ...baseColors,
      ...colors, // Apply color overrides
    }
  }, [theme, colors])

  const presetConfig = useMemo(() => {
    if (typeof preset === "string" && presets[preset]) {
      return presets[preset]
    }
    return presets.standard // fallback
  }, [preset])

  const activeFeatures = useMemo(() => {
    if (features === "all") return presetConfig.features
    if (features === "basic") return ["wordCount"]
    if (features === "standard") return ["wordCount"]
    if (Array.isArray(features)) return features
    return presetConfig.features
  }, [features, presetConfig])

  const [value, setValue] = useState(initialValue)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isToolbarSticky, setIsToolbarSticky] = useState(false)
  const editorContainerRef = useRef(null)
  const toolbarRef = useRef(null)

  const renderElement = useCallback((props) => <Element {...props} theme={currentTheme} />, [currentTheme])
  const renderLeaf = useCallback((props) => <Leaf {...props} theme={currentTheme} />, [currentTheme])

  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))

    // Define void elements
    const { isVoid } = e
    e.isVoid = (element) => {
      return element.type === "horizontal-rule" ? true : isVoid(element)
    }

    return e
  }, [])

  useEffect(() => {
    if (!activeFeatures.includes("stickyToolbar") || compact) {
      setIsToolbarSticky(false)
      return
    }

    const handleScroll = () => {
      if (!editorContainerRef.current || !toolbarRef.current) return

      const containerRect = editorContainerRef.current.getBoundingClientRect()
      const toolbarHeight = toolbarRef.current.offsetHeight

      const shouldBeSticky = containerRect.top <= 0 && containerRect.bottom > toolbarHeight + 20
      setIsToolbarSticky(shouldBeSticky)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeFeatures, compact])

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

      if (event.key === "Enter") {
        const { selection } = editor
        if (selection) {
          const [match] = Array.from(
            Editor.nodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n.type === "heading-one" || n.type === "heading-two" || n.type === "heading-three"),
            }),
          )

          if (match) {
            event.preventDefault()
            // Insert a new line and convert to paragraph
            Transforms.insertBreak(editor)
            Transforms.setNodes(editor, { type: "paragraph" })
            return
          }
        }
      }
    },
    [editor],
  )

  const handlePaste = useCallback(
    (event) => {
      if ((preset !== "full" && preset !== "standard") || !activeFeatures.includes("markdownPaste")) return

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
        pastedText.includes("~~") ||
        pastedText.includes("|") ||
        pastedText.includes("- [") ||
        (pastedText.includes("[") && pastedText.includes("]("))
      ) {
        event.preventDefault()
        const parsedContent = parseMarkdown(pastedText)
        Transforms.insertNodes(editor, parsedContent)
      }
    },
    [editor, activeFeatures, preset],
  )

  const containerStyles = {
    backgroundColor: currentTheme.background,
    borderColor: currentTheme.border,
    borderRadius: themeConfig.spacing.borderRadius,
    borderWidth: themeConfig.spacing.borderWidth,
  }

  const headerStyles = {
    backgroundColor: currentTheme.toolbarBg,
    borderColor: currentTheme.border,
    padding: compact
      ? `${Number.parseInt(themeConfig.spacing.padding.header) / 2}px`
      : themeConfig.spacing.padding.header,
  }

  const editorContentStyles = {
    backgroundColor: currentTheme.background,
    padding: compact
      ? `${Number.parseInt(themeConfig.spacing.padding.editor) / 2}px`
      : themeConfig.spacing.padding.editor,
    minHeight: compact ? "200px" : themeConfig.components.editor.minHeight,
  }

  return (
    <div className={`brand-nova-editor ${theme}`} key={`${preset}-${theme}-${compact}`}>
      <div
        ref={editorContainerRef}
        className="editor-container rounded-lg shadow-lg border overflow-hidden"
        style={{
          ...containerStyles,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeFeatures.includes("wordCount") && (
          <div
            className="editor-header px-4 py-2 border-b flex items-center justify-end flex-shrink-0"
            style={headerStyles}
          >
            <div
              className="flex items-center space-x-4 text-xs"
              style={{ color: currentTheme.textSecondary }}
              aria-live="polite"
              aria-label={`Content statistics: ${wordCount} words, ${charCount} characters`}
            >
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          </div>
        )}

        <Slate editor={editor} initialValue={value} onValueChange={handleChange}>
          {/* Toolbar Container */}
          <div
            ref={toolbarRef}
            className={`
              ${isToolbarSticky ? "fixed top-0 left-0 right-0 z-50 shadow-lg" : "relative"} 
              ${activeFeatures.includes("stickyToolbar") ? "transition-all duration-200 ease-in-out" : ""} 
              flex-shrink-0
            `}
            style={
              isToolbarSticky
                ? {
                    width: editorContainerRef.current?.offsetWidth + "px",
                    marginLeft: editorContainerRef.current?.getBoundingClientRect().left + "px",
                  }
                : {}
            }
          >
            <Toolbar
              theme={currentTheme}
              preset={presetConfig}
              isSticky={isToolbarSticky}
              compact={compact}
              className={isToolbarSticky ? "rounded-none border-l-0 border-r-0" : ""}
            />
          </div>

          {/* Editor Content */}
          <div
            className="editor-content flex-1"
            style={editorContentStyles}
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
              className="focus:outline-none prose prose-lg max-w-none"
              style={{
                color: currentTheme.text,
                minHeight: compact ? "150px" : "400px",
              }}
              aria-describedby={activeFeatures.includes("wordCount") ? "word-count" : undefined}
            />
          </div>
        </Slate>
      </div>
    </div>
  )
}

const Element = ({ attributes, children, element, theme }) => {
  const style = { textAlign: element.align }

  switch (element.type) {
    case "horizontal-rule":
      return (
        <div {...attributes} contentEditable={false} className="my-6">
          <hr style={{ borderColor: theme.border, borderTopWidth: "2px" }} />
          {children}
        </div>
      )
    case "block-quote":
      return (
        <blockquote
          style={{ ...style, color: theme.text, borderLeftColor: theme.accent, borderLeftWidth: "4px" }}
          {...attributes}
          className="pl-4 italic my-4 whitespace-pre-line"
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
        <h1 style={{ ...style, color: theme.text }} {...attributes} className="text-3xl font-bold my-4">
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 style={{ ...style, color: theme.text }} {...attributes} className="text-2xl font-bold my-3">
          {children}
        </h2>
      )
    case "heading-three":
      return (
        <h3 style={{ ...style, color: theme.text }} {...attributes} className="text-xl font-bold my-3">
          {children}
        </h3>
      )
    case "list-item":
      return (
        <li style={{ ...style, color: theme.text }} {...attributes} className="my-1">
          {children}
        </li>
      )
    case "numbered-list":
      return (
        <ol style={style} {...attributes} className="list-decimal list-inside my-4 space-y-2">
          {children}
        </ol>
      )
    case "check-list-item":
      return (
        <div style={{ ...style, color: theme.text }} {...attributes} className="flex items-start my-2 group">
          <input
            type="checkbox"
            checked={element.checked}
            className="mr-3 mt-1 rounded border-2 flex-shrink-0 cursor-pointer"
            style={{
              borderColor: theme.border,
              backgroundColor: element.checked ? theme.accent : theme.background,
              accentColor: theme.accent,
              width: "16px",
              height: "16px",
            }}
            contentEditable={false}
            readOnly
          />
          <span
            className={`flex-1 ${element.checked ? "" : ""}`}
            style={{
              color: theme.text,
              lineHeight: "1.5",
              paddingTop: "1px",
            }}
          >
            {children}
          </span>
        </div>
      )
    case "table":
      return (
        <div {...attributes} className="my-6 overflow-x-auto">
          <table
            className="w-full border-collapse shadow-sm"
            style={{
              borderColor: theme.border,
              borderWidth: "1px",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: theme.background,
            }}
          >
            <tbody>{children}</tbody>
          </table>
        </div>
      )
    case "table-row":
      return (
        <tr
          {...attributes}
          className="hover:bg-opacity-50"
          style={{
            backgroundColor: theme.hoverBg + "20", // 20% opacity
          }}
        >
          {children}
        </tr>
      )
    case "table-cell":
      const isFirstRow = element.parent?.children?.[0] === element.parent
      const isHeader = isFirstRow

      return (
        <td
          {...attributes}
          className={`px-4 py-3 border-r border-b last:border-r-0 ${isHeader ? "font-semibold" : ""}`}
          style={{
            borderColor: theme.border,
            color: theme.text,
            backgroundColor: isHeader ? theme.hoverBg + "40" : "transparent", // Header background
            verticalAlign: "top",
            lineHeight: "1.5",
            fontWeight: isHeader ? "600" : "400",
          }}
        >
          {children}
        </td>
      )
    default:
      return (
        <p style={{ ...style, color: theme.text }} {...attributes} className="my-2 leading-relaxed">
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf, theme }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = (
      <code
        className="px-1 py-0.5 rounded text-sm font-mono"
        style={{
          backgroundColor: theme.hoverBg,
          color: theme.text,
        }}
      >
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

  return (
    <span {...attributes} style={{ color: theme.text }}>
      {children}
    </span>
  )
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
