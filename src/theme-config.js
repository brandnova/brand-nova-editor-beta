// Theme Configuration File
// Modify this file to customize the editor appearance for different projects

export const themeConfig = {
  // Color schemes
  colors: {
    light: {
      primary: "#3b82f6", // Brand color for buttons/highlights
      background: "#ffffff", // Editor background
      text: "#1f2937", // Main text color
      textSecondary: "#6b7280", // Secondary text (word count, etc.)
      border: "#e5e7eb", // Border colors
      toolbarBg: "#f9fafb", // Toolbar background
      hoverBg: "#f3f4f6", // Hover states
      accent: "#b9105fff", // Success/accent color
    },
    dark: {
      primary: "#60a5fa", // Brand color for buttons/highlights
      background: "#111827", // Editor background
      text: "#f9fafb", // Main text color
      textSecondary: "#9ca3af", // Secondary text (word count, etc.)
      border: "#374151", // Border colors
      toolbarBg: "#1f2937", // Toolbar background
      hoverBg: "#374151", // Hover states
      accent: "#b9105fff", // Success/accent color
    },
  },

  // Typography
  typography: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: {
      base: "16px",
      small: "14px",
      large: "18px",
    },
    lineHeight: "1.6",
  },

  // Spacing and layout
  spacing: {
    padding: {
      editor: "24px", // Editor content padding
      toolbar: "12px", // Toolbar padding
      header: "16px", // Header padding
    },
    borderRadius: "8px", // Border radius for containers
    borderWidth: "1px", // Border width
  },

  // Component-specific styling
  components: {
    toolbar: {
      height: "48px",
      buttonSize: "32px",
      gap: "4px",
    },
    editor: {
      minHeight: "400px",
      maxWidth: "none",
    },
  },
}

// Preset configurations for different use cases
export const presets = {
  minimal: {
    tools: ["bold", "italic", "underline", "strikethrough", "heading-one", "paragraph"],
    features: ["wordCount"],
  },
  standard: {
    tools: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "heading-one",
      "heading-two",
      "heading-three",
      "bulleted-list",
      "numbered-list",
      "paragraph",
    ],
    features: ["wordCount", "markdownPaste"],
  },
  full: {
    tools: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "code",
      "heading-one",
      "heading-two",
      "heading-three",
      "bulleted-list",
      "numbered-list",
      "block-quote",
      "horizontal-rule",
      "left",
      "center",
      "right",
      "justify",
      "paragraph",
    ],
    features: ["wordCount", "markdownPaste", "stickyToolbar"],
  },
}
