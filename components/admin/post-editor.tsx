"use client"

import "@mdxeditor/editor/style.css"
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  GenericJsxEditor,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  insertJsx$,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  usePublisher,
  type JsxComponentDescriptor,
} from "@mdxeditor/editor"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WIDGETS } from "@/lib/blog/widgets/meta"
import { cn } from "@/lib/utils"

const jsxComponentDescriptors: JsxComponentDescriptor[] = WIDGETS.map(
  (widget) => ({
    name: widget.name,
    kind: widget.kind,
    hasChildren: widget.hasChildren,
    props: widget.props.map((prop) => ({
      name: prop.name,
      type: "string" as const,
      required: prop.required,
    })),
    Editor: GenericJsxEditor,
  })
)

function WidgetMenu() {
  const insertJsx = usePublisher(insertJsx$)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          Insert widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {WIDGETS.map((widget) => (
          <DropdownMenuItem
            key={widget.name}
            onSelect={() =>
              insertJsx({
                name: widget.name,
                kind: widget.kind,
                props: Object.fromEntries(
                  widget.props.map((prop) => [
                    prop.name,
                    prop.defaultValue ?? "",
                  ])
                ),
              })
            }
          >
            <div>
              <p className="font-medium">{widget.label}</p>
              <p className="text-xs text-muted-foreground">
                {widget.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type PostEditorProps = {
  initialMarkdown: string
  onChange: (markdown: string) => void
  uploadImage: (file: File) => Promise<string>
}

export default function PostEditor({
  initialMarkdown,
  onChange,
  uploadImage,
}: PostEditorProps) {
  const { resolvedTheme } = useTheme()

  return (
    <MDXEditor
      markdown={initialMarkdown}
      onChange={onChange}
      className={cn(
        { "dark-theme": resolvedTheme === "dark" },
        "rounded-none border border-input bg-background"
      )}
      contentEditableClassName="blog-prose min-h-96"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        imagePlugin({ imageUploadHandler: uploadImage }),
        codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            txt: "Plain text",
            js: "JavaScript",
            ts: "TypeScript",
            json: "JSON",
            bash: "Shell",
            css: "CSS",
            html: "HTML",
          },
        }),
        jsxPlugin({ jsxComponentDescriptors }),
        markdownShortcutPlugin(),
        diffSourcePlugin({ viewMode: "rich-text" }),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <InsertCodeBlock />
              <Separator />
              <WidgetMenu />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  )
}
