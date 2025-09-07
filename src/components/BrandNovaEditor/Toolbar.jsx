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
  Minus,
  Type,
} from "lucide-react"
import { toggleBlock, toggleMark, isBlockActive, isMarkActive } from "./BrandNovaEditor"

const Toolbar = ({ theme, preset, isSticky = false, compact = false, className = "" }) => {
  const editor = useSlate()

  const allTools = {
    bold: { type: "mark", format: "bold", icon: Bold, label: "Bold (Ctrl+B)", shortcut: "Ctrl+B" },
    italic: { type: "mark", format: "italic", icon: Italic, label: "Italic (Ctrl+I)", shortcut: "Ctrl+I" },
    underline: { type: "mark", format: "underline", icon: Underline, label: "Underline (Ctrl+U)", shortcut: "Ctrl+U" },
    strikethrough: {
      type: "mark",
      format: "strikethrough",
      icon: Strikethrough,
      label: "Strikethrough",
      shortcut: null,
    },
    code: { type: "mark", format: "code", icon: Code, label: "Inline Code (Ctrl+`)", shortcut: "Ctrl+`" },
    "heading-one": { type: "block", format: "heading-one", icon: Heading1, label: "Heading 1", shortcut: null },
    "heading-two": { type: "block", format: "heading-two", icon: Heading2, label: "Heading 2", shortcut: null },
    "heading-three": { type: "block", format: "heading-three", icon: Heading3, label: "Heading 3", shortcut: null },
    paragraph: { type: "block", format: "paragraph", icon: Type, label: "Paragraph", shortcut: null }, // Added paragraph tool
    "bulleted-list": { type: "block", format: "bulleted-list", icon: List, label: "Bullet List", shortcut: null },
    "numbered-list": {
      type: "block",
      format: "numbered-list",
      icon: ListOrdered,
      label: "Numbered List",
      shortcut: null,
    },
    "block-quote": { type: "block", format: "block-quote", icon: Quote, label: "Block Quote", shortcut: null },
    "horizontal-rule": {
      type: "block",
      format: "horizontal-rule",
      icon: Minus,
      label: "Horizontal Rule",
      shortcut: null,
    },
    left: { type: "align", format: "left", icon: AlignLeft, label: "Align Left", shortcut: null },
    center: { type: "align", format: "center", icon: AlignCenter, label: "Center", shortcut: null },
    right: { type: "align", format: "right", icon: AlignRight, label: "Align Right", shortcut: null },
    justify: { type: "align", format: "justify", icon: AlignJustify, label: "Justify", shortcut: null },
  }

  const activeTools = preset?.tools ? preset.tools.map((toolName) => allTools[toolName]).filter(Boolean) : []

  const toolbarGroups = []
  const textFormatting = activeTools.filter((tool) => tool.type === "mark")
  const headings = activeTools.filter((tool) => tool.format.startsWith("heading"))
  const paragraphTool = activeTools.filter((tool) => tool.format === "paragraph") // Added paragraph tool grouping
  const blocks = activeTools.filter(
    (tool) => tool.type === "block" && !tool.format.startsWith("heading") && tool.format !== "paragraph",
  )
  const alignment = activeTools.filter((tool) => tool.type === "align")

  if (textFormatting.length > 0) toolbarGroups.push({ name: "Text Formatting", items: textFormatting })
  if (headings.length > 0 || paragraphTool.length > 0) {
    toolbarGroups.push({ name: "Headings", items: [...headings, ...paragraphTool] }) // Combined headings and paragraph tool
  }
  if (blocks.length > 0) toolbarGroups.push({ name: "Lists and Blocks", items: blocks })
  if (alignment.length > 0) toolbarGroups.push({ name: "Alignment", items: alignment })

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

  const toolbarStyles = {
    backgroundColor: theme.toolbarBg,
    borderColor: theme.border,
    padding: compact ? "8px 16px" : "12px 24px",
  }

  return (
    <div
      className={`toolbar border-b ${className}`}
      style={toolbarStyles}
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      <div className={`flex flex-wrap items-center ${compact ? "gap-1" : "gap-2"}`}>
        {toolbarGroups.map((group, groupIndex) => (
          <div key={group.name} className="flex items-center gap-1">
            <div className="flex items-center gap-1" role="group" aria-label={group.name}>
              {group.items.map((item) => {
                const IconComponent = item.icon
                const active = isActive(item)

                return (
                  <ToolbarButton
                    key={item.format}
                    theme={theme}
                    active={active}
                    compact={compact}
                    onMouseDown={(event) => handleButtonClick(item, event)}
                    aria-label={item.label}
                    aria-pressed={active}
                    title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                  >
                    <IconComponent size={compact ? 14 : 16} aria-hidden="true" />
                  </ToolbarButton>
                )
              })}
            </div>

            {/* Group separator */}
            {groupIndex < toolbarGroups.length - 1 && (
              <div
                className={`w-px h-6 mx-2`}
                style={{ backgroundColor: theme.border }}
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

const ToolbarButton = ({ active, children, theme, compact = false, className = "", ...props }) => {
  const baseStyles = `${compact ? "p-1.5" : "p-2"} rounded transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50`

  const buttonStyles = {
    color: active ? theme.primary : theme.textSecondary,
    backgroundColor: active ? theme.hoverBg : "transparent",
    borderColor: active ? theme.primary : "transparent",
    borderWidth: active ? "1px" : "0px",
  }

  const hoverStyles = {
    ":hover": {
      backgroundColor: theme.hoverBg,
      color: theme.text,
    },
  }

  return (
    <button
      type="button"
      className={`${baseStyles} ${className}`}
      style={buttonStyles}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.backgroundColor = theme.hoverBg
          e.target.style.color = theme.text
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.backgroundColor = "transparent"
          e.target.style.color = theme.textSecondary
        }
      }}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </button>
  )
}

export default Toolbar
