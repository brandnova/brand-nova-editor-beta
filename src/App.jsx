import { useState } from "react"
import BrandNovaEditor from "./components/BrandNovaEditor"

function App() {
  const [editorConfig, setEditorConfig] = useState({
    preset: "standard",
    theme: "light",
    compact: false,
    colors: { primary: "#3b82f6" },
    customTools: null,
  })

  const presetDescriptions = {
    minimal: "Bold, Italic, Underline, Strikethrough, H1, Paragraph",
    standard: "Minimal + H2, H3, Lists, MD Paste",
    full: "Standard + Code, Quotes, HR, Alignment, Enhanced MD",
    custom: "User-defined toolbar configuration",
  }

  const customToolbarOptions = {
    "Writing Focus": ["bold", "italic", "heading1", "heading2", "paragraph"],
    "Blog Editor": [
      "bold",
      "italic",
      "underline",
      "heading1",
      "heading2",
      "heading3",
      "bulletList",
      "numberedList",
      "blockquote",
      "paragraph",
    ],
    Documentation: [
      "bold",
      "italic",
      "code",
      "heading1",
      "heading2",
      "heading3",
      "bulletList",
      "numberedList",
      "blockquote",
      "horizontalRule",
      "paragraph",
    ],
    "Minimal Writer": ["bold", "italic", "paragraph"],
    "Full Featured": [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "code",
      "heading1",
      "heading2",
      "heading3",
      "bulletList",
      "numberedList",
      "blockquote",
      "horizontalRule",
      "alignLeft",
      "alignCenter",
      "alignRight",
      "paragraph",
    ],
  }

  const handleConfigChange = (key, value) => {
    setEditorConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleColorChange = (colorKey, value) => {
    setEditorConfig((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  const handleCustomToolsChange = (toolsName) => {
    if (toolsName === "none") {
      setEditorConfig((prev) => ({ ...prev, customTools: null, preset: "standard" }))
    } else {
      setEditorConfig((prev) => ({
        ...prev,
        customTools: customToolbarOptions[toolsName],
        preset: "custom",
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Brand Nova Editor - Full Testing Ground</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Basic Configuration</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Preset:</label>
                <select
                  value={editorConfig.preset}
                  onChange={(e) => handleConfigChange("preset", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="minimal">Minimal</option>
                  <option value="standard">Standard</option>
                  <option value="full">Full</option>
                  <option value="custom">Custom</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{presetDescriptions[editorConfig.preset]}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Theme:</label>
                <select
                  value={editorConfig.theme}
                  onChange={(e) => handleConfigChange("theme", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editorConfig.compact}
                    onChange={(e) => handleConfigChange("compact", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Compact Layout</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Custom Toolbar</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Toolbar Config:</label>
                <select
                  onChange={(e) => handleCustomToolsChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  value={
                    editorConfig.customTools
                      ? Object.keys(customToolbarOptions).find(
                          (key) =>
                            JSON.stringify(customToolbarOptions[key]) === JSON.stringify(editorConfig.customTools),
                        ) || "custom"
                      : "none"
                  }
                >
                  <option value="none">Use Preset</option>
                  {Object.keys(customToolbarOptions).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {editorConfig.customTools && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <strong>Tools:</strong> {editorConfig.customTools.join(", ")}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Color Customization</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color:</label>
                <input
                  type="color"
                  value={editorConfig.colors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Background:</label>
                <input
                  type="color"
                  value={editorConfig.colors.background || (editorConfig.theme === "dark" ? "#111827" : "#ffffff")}
                  onChange={(e) => handleColorChange("background", e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Text Color:</label>
                <input
                  type="color"
                  value={editorConfig.colors.text || (editorConfig.theme === "dark" ? "#f9fafb" : "#1f2937")}
                  onChange={(e) => handleColorChange("text", e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current Configuration:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">{JSON.stringify(editorConfig, null, 2)}</pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Editor Instance</h2>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Testing Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Type a heading and press Enter to test auto-reset behavior</li>
              <li>• Paste markdown content to test MD formatting (standard/full presets)</li>
              <li>• Try different toolbar configurations to see available tools</li>
              <li>• Switch themes to test color contrast and styling</li>
            </ul>
          </div>
          <BrandNovaEditor
            {...editorConfig}
            placeholder="Start writing your content... Try typing '# Heading' and pressing Enter!"
            onChange={(value) => console.log("[v0] Editor content changed:", value)}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Feature Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Markdown Test Content</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div>## Heading 2</div>
                <div>### Heading 3</div>
                <div>**Bold text** and *italic text*</div>
                <div>- [ ] Unchecked item</div>
                <div>- [x] Checked item</div>
                <div>| Col 1 | Col 2 |</div>
                <div>|-------|-------|</div>
                <div>| Data | More |</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Copy and paste this into the editor to test markdown formatting
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Available Tools by Preset</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Minimal:</strong> Bold, Italic, Underline, Strike, H1, Paragraph
                </div>
                <div>
                  <strong>Standard:</strong> + H2, H3, Lists, MD Paste
                </div>
                <div>
                  <strong>Full:</strong> + Code, Quotes, HR, Alignment, Enhanced MD
                </div>
                <div>
                  <strong>Custom:</strong> User-defined combinations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
