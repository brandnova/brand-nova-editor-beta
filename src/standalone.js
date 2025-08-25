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
