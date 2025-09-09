// src/standalone.js
import React from "react"
import { createRoot } from "react-dom/client"
import BrandNovaEditor from "./components/BrandNovaEditor"
import "./index.css"

// Default toolbar configuration - all tools available
const DEFAULT_TOOLBAR_CONFIG = {
  formatting: ['bold', 'italic', 'underline', 'strikethrough'],
  headings: ['heading-one', 'heading-two', 'heading-three', 'paragraph'],
  alignment: ['left', 'center', 'right', 'justify'],
  blocks: ['block-quote', 'bulleted-list', 'numbered-list'],
  actions: ['undo', 'redo'],
  fullscreen: ['fullscreen']
}

// Helper function to parse toolbar config from string or use object
const parseToolbarConfig = (config) => {
  if (typeof config === 'string') {
    try {
      return JSON.parse(config)
    } catch (e) {
      console.warn('Invalid toolbar config JSON, using default config')
      return DEFAULT_TOOLBAR_CONFIG
    }
  }
  return config || DEFAULT_TOOLBAR_CONFIG
}

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
      fullEditor = true,
      toolbarConfig = DEFAULT_TOOLBAR_CONFIG,
    } = options

    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with id "${elementId}" not found`)
      return null
    }

    const root = createRoot(element)

    // Parse toolbar configuration
    const parsedToolbarConfig = parseToolbarConfig(toolbarConfig)

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
        fullEditor: fullEditor,
        toolbarConfig: parsedToolbarConfig,
      })

    root.render(React.createElement(EditorWrapper))

    return {
      destroy: () => root.unmount(),
      getElement: () => element,
    }
  },
  
  // Expose the default config for reference
  DEFAULT_TOOLBAR_CONFIG: DEFAULT_TOOLBAR_CONFIG
}

// Auto-initialize if data attributes are present
document.addEventListener("DOMContentLoaded", () => {
  const autoInitElements = document.querySelectorAll("[data-brand-nova-editor]")

  autoInitElements.forEach((element) => {
    // Parse fullEditor setting
    const fullEditor = element.dataset.fullEditor !== "false"
    
    // Parse toolbar configuration from data attribute
    let toolbarConfig = DEFAULT_TOOLBAR_CONFIG
    if (element.dataset.toolbarConfig) {
      toolbarConfig = parseToolbarConfig(element.dataset.toolbarConfig)
    }

    const options = {
      elementId: element.id,
      theme: element.dataset.theme || "light",
      placeholder: element.dataset.placeholder || "Start writing your content...",
      showWordCount: element.dataset.showWordCount !== "false",
      maxHeight: element.dataset.maxHeight ? Number.parseInt(element.dataset.maxHeight) : null,
      stickyToolbar: element.dataset.stickyToolbar !== "false",
      fullEditor: fullEditor,
      toolbarConfig: toolbarConfig,
    }

    window.BrandNovaEditor.init(options)
  })
})

// Export configuration helper for easier usage
window.BrandNovaEditor.createConfig = (groups) => {
  const config = {}
  
  if (groups.includes('formatting')) {
    config.formatting = ['bold', 'italic', 'underline', 'strikethrough']
  }
  if (groups.includes('headings')) {
    config.headings = ['heading-one', 'heading-two', 'heading-three', 'paragraph']
  }
  if (groups.includes('alignment')) {
    config.alignment = ['left', 'center', 'right', 'justify']
  }
  if (groups.includes('blocks')) {
    config.blocks = ['block-quote', 'bulleted-list', 'numbered-list']
  }
  if (groups.includes('actions')) {
    config.actions = ['undo', 'redo']
  }
  if (groups.includes('fullscreen')) {
    config.fullscreen = ['fullscreen']
  }
  
  return config
}