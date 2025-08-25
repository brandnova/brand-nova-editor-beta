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