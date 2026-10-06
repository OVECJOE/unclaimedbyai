export type PropDef = {
  name: string
  label: string
  type: "string" | "select"
  options?: readonly string[]
  pattern?: string
  required?: boolean
  defaultValue?: string
}

export type WidgetMeta = {
  name: string
  label: string
  description: string
  kind: "flow" | "text"
  hasChildren: boolean
  props: PropDef[]
}

export const WIDGETS: WidgetMeta[] = [
  {
    name: "Callout",
    label: "Callout",
    description: "A highlighted note, tip or warning.",
    kind: "flow",
    hasChildren: true,
    props: [
      {
        name: "tone",
        label: "Tone",
        type: "select",
        options: ["info", "tip", "warning"],
        defaultValue: "info",
      },
    ],
  },
  {
    name: "Cta",
    label: "Call to action",
    description: "A box with a heading, a sentence and a button.",
    kind: "flow",
    hasChildren: false,
    props: [
      { name: "heading", label: "Heading", type: "string", required: true },
      { name: "body", label: "Text", type: "string" },
      { name: "label", label: "Button label", type: "string", required: true },
      {
        name: "href",
        label: "Button link",
        type: "string",
        required: true,
        pattern: "^(/|https://)",
      },
    ],
  },
  {
    name: "Figure",
    label: "Figure",
    description: "An image with a caption.",
    kind: "flow",
    hasChildren: false,
    props: [
      {
        name: "src",
        label: "Image URL",
        type: "string",
        required: true,
        pattern: "^(/|https://)",
      },
      { name: "alt", label: "Alt text", type: "string", required: true },
      { name: "caption", label: "Caption", type: "string" },
    ],
  },
  {
    name: "CompanyCard",
    label: "Company card",
    description: "A link to a company that previews its site details on hover.",
    kind: "text",
    hasChildren: false,
    props: [
      {
        name: "name",
        label: "Company name",
        type: "string",
        required: true,
      },
      {
        name: "domain",
        label: "Domain",
        type: "string",
        required: true,
        pattern: "^(https?://)?[A-Za-z0-9.-]+\\.[A-Za-z]{2,}([/?#].*)?$",
      },
    ],
  },
]

export const widgetByName = new Map(
  WIDGETS.map((widget) => [widget.name, widget])
)
