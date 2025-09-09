// src/components/BrandNovaEditor/Toolbar.jsx
import { useSlate } from "slate-react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Quote,
  List,
  ListOrdered,
  Undo,
  Redo,
  Maximize,
  Minimize,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"
import { toggleBlock, toggleMark, isBlockActive, isMarkActive } from "./BrandNovaEditor"

const Toolbar = ({ 
  theme = "light", 
  isFullscreen = false,
  onToggleFullscreen,
  stickyEnabled = true,
  className = "",
  toolbarConfig = {}
}) => {
  const editor = useSlate()

  const handleButtonClick = (type, format, event) => {
    event.preventDefault()
    
    if (type === "mark") {
      toggleMark(editor, format)
    } else if (type === "block") {
      toggleBlock(editor, format)
    } else if (type === "align") {
      toggleBlock(editor, format)
    } else if (type === "action") {
      switch (format) {
        case "undo":
          editor.undo()
          break
        case "redo":
          editor.redo()
          break
        case "fullscreen":
          onToggleFullscreen?.()
          break
        case "paragraph":
          toggleBlock(editor, "paragraph")
          break
      }
    }
  }

  const isActive = (type, format) => {
    if (type === "mark") {
      return isMarkActive(editor, format)
    } else if (type === "block") {
      return isBlockActive(editor, format)
    } else if (type === "align") {
      return isBlockActive(editor, format, "align")
    } else if (type === "action") {
      if (format === "fullscreen") {
        return isFullscreen
      } else if (format === "paragraph") {
        return isBlockActive(editor, "paragraph")
      }
    }
    return false
  }

  // Helper function to check if a tool group should be rendered
  const shouldRenderGroup = (groupName) => {
    return toolbarConfig[groupName] && toolbarConfig[groupName].length > 0
  }

  // Helper function to check if a specific tool should be rendered
  const shouldRenderTool = (groupName, toolName) => {
    return toolbarConfig[groupName] && toolbarConfig[groupName].includes(toolName)
  }

  const groupClass = `flex items-center space-x-1 rounded-lg p-1 transition-colors duration-300 ${
    theme === "dark" ? "bg-gray-700/50" : "bg-amber-50"
  }`

  return (
    <div
      className={`border-b p-4 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-800/80 border-gray-700/50" : "bg-white/80 border-gray-200/50"
      } ${className}`}
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* Main toolbar container with proper flex wrapping */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Text Formatting */}
        {shouldRenderGroup('formatting') && (
          <div className={groupClass}>
            {shouldRenderTool('formatting', 'bold') && (
              <ToolbarButton
                theme={theme}
                active={isActive("mark", "bold")}
                onMouseDown={(event) => handleButtonClick("mark", "bold", event)}
                title="Bold"
                shortcut="Ctrl+B"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('formatting', 'italic') && (
              <ToolbarButton
                theme={theme}
                active={isActive("mark", "italic")}
                onMouseDown={(event) => handleButtonClick("mark", "italic", event)}
                title="Italic"
                shortcut="Ctrl+I"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('formatting', 'underline') && (
              <ToolbarButton
                theme={theme}
                active={isActive("mark", "underline")}
                onMouseDown={(event) => handleButtonClick("mark", "underline", event)}
                title="Underline"
                shortcut="Ctrl+U"
              >
                <Underline className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('formatting', 'strikethrough') && (
              <ToolbarButton
                theme={theme}
                active={isActive("mark", "strikethrough")}
                onMouseDown={(event) => handleButtonClick("mark", "strikethrough", event)}
                title="Strikethrough"
                shortcut="Ctrl+Shift+S"
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>
        )}

        {/* 2. Headings */}
        {shouldRenderGroup('headings') && (
          <div className={groupClass}>
            {shouldRenderTool('headings', 'heading-one') && (
              <ToolbarButton
                theme={theme}
                active={isActive("block", "heading-one")}
                onMouseDown={(event) => handleButtonClick("block", "heading-one", event)}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('headings', 'heading-two') && (
              <ToolbarButton
                theme={theme}
                active={isActive("block", "heading-two")}
                onMouseDown={(event) => handleButtonClick("block", "heading-two", event)}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('headings', 'heading-three') && (
              <ToolbarButton
                theme={theme}
                active={isActive("block", "heading-three")}
                onMouseDown={(event) => handleButtonClick("block", "heading-three", event)}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('headings', 'paragraph') && (
              <ToolbarButton
                theme={theme}
                active={isActive("action", "paragraph")}
                onMouseDown={(event) => handleButtonClick("action", "paragraph", event)}
                title="Paragraph Text"
              >
                <Type className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>
        )}

        {/* 3. Alignments */}
        {shouldRenderGroup('alignment') && (
          <div className={groupClass}>
            {shouldRenderTool('alignment', 'left') && (
              <ToolbarButton
                theme={theme}
                active={isActive("align", "left")}
                onMouseDown={(event) => handleButtonClick("align", "left", event)}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('alignment', 'center') && (
              <ToolbarButton
                theme={theme}
                active={isActive("align", "center")}
                onMouseDown={(event) => handleButtonClick("align", "center", event)}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('alignment', 'right') && (
              <ToolbarButton
                theme={theme}
                active={isActive("align", "right")}
                onMouseDown={(event) => handleButtonClick("align", "right", event)}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('alignment', 'justify') && (
              <ToolbarButton
                theme={theme}
                active={isActive("align", "justify")}
                onMouseDown={(event) => handleButtonClick("align", "justify", event)}
                title="Align Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>
        )}

        {/* 4. Lists and Quote */}
        {shouldRenderGroup('blocks') && (
          <div className={groupClass}>
            {shouldRenderTool('blocks', 'block-quote') && (
              <ToolbarButton
                theme={theme}
                active={isActive("block", "block-quote")}
                onMouseDown={(event) => handleButtonClick("block", "block-quote", event)}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('blocks', 'bulleted-list') && (
              <ToolbarButton
                theme={theme}
                active={isActive("block", "bulleted-list")}
                onMouseDown={(event) => handleButtonClick("block", "bulleted-list", event)}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('blocks', 'numbered-list') && (
              <ToolbarButton
                theme={theme}
                active={isActive("block", "numbered-list")}
                onMouseDown={(event) => handleButtonClick("block", "numbered-list", event)}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>
        )}

        {/* 5. Actions */}
        {shouldRenderGroup('actions') && (
          <div className={groupClass}>
            {shouldRenderTool('actions', 'undo') && (
              <ToolbarButton
                theme={theme}
                active={false}
                onMouseDown={(event) => handleButtonClick("action", "undo", event)}
                title="Undo"
                shortcut="Ctrl+Z"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
            )}
            {shouldRenderTool('actions', 'redo') && (
              <ToolbarButton
                theme={theme}
                active={false}
                onMouseDown={(event) => handleButtonClick("action", "redo", event)}
                title="Redo"
                shortcut="Ctrl+Y"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>
        )}

        {/* 6. Fullscreen - Always visible if included in config */}
        {shouldRenderGroup('fullscreen') && shouldRenderTool('fullscreen', 'fullscreen') && (
          <div className={groupClass}>
            <ToolbarButton
              theme={theme}
              active={isActive("action", "fullscreen")}
              onMouseDown={(event) => handleButtonClick("action", "fullscreen", event)}
              title="Toggle Fullscreen"
              shortcut="F11"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </ToolbarButton>
          </div>
        )}
      </div>

      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite" id="toolbar-instructions">
        Use the toolbar buttons to format your text. Press Tab to navigate between buttons, Space or Enter to activate.
      </div>
    </div>
  )
}

const ToolbarButton = ({ 
  active, 
  children, 
  theme = "light", 
  className = "", 
  title, 
  shortcut,
  ...props 
}) => {
  const baseStyles = "p-2 rounded transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 relative group"
  
  const activeStyles = active
    ? "bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200"
    : ""
    
  const hoverStyles = theme === "dark"
    ? "text-gray-300 hover:bg-gray-600 hover:text-amber-400"
    : "text-gray-600 hover:bg-amber-100 hover:text-amber-600"
  
  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"

  const tooltipText = shortcut ? `${title} (${shortcut})` : title

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
      aria-label={tooltipText}
      {...props}
    >
      {children}
      
      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-500 z-50 whitespace-nowrap ${
        theme === "dark" 
          ? "bg-gray-900 text-gray-100 border border-gray-700" 
          : "bg-gray-800 text-white"
      }`}>
        {tooltipText}
        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
          theme === "dark" ? "border-t-gray-900" : "border-t-gray-800"
        }`}></div>
      </div>
    </button>
  )
}

export default Toolbar