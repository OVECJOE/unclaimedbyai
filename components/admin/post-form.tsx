"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ImageAdd01Icon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FAQ_ANSWER_MAX_LENGTH } from "@/lib/blog/config"
import { savePost } from "@/lib/blog/actions"
import type { ContentIssue, Post, PostStatus } from "@/lib/blog/types"
import { PostEditor } from "./post-editor-loader"

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function parseTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, 8)
}

function isUsableCoverSrc(value: string): boolean {
  const src = value.trim()
  return (
    src.startsWith("https://") || (src.startsWith("/") && !src.startsWith("//"))
  )
}

type UploadedImage = {
  url: string
  width: number | null
  height: number | null
}

type FaqDraft = {
  rowKey: string
  question: string
  answer: string
}

async function uploadImageFile(file: File): Promise<UploadedImage> {
  const body = new FormData()
  body.append("file", file)

  const res = await fetch("/api/admin/upload", { method: "POST", body })
  const data = (await res.json().catch(() => ({}))) as {
    url?: string
    width?: number
    height?: number
    error?: string
  }

  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed")
  return {
    url: data.url,
    width: typeof data.width === "number" ? data.width : null,
    height: typeof data.height === "number" ? data.height : null,
  }
}

async function uploadImage(file: File): Promise<string> {
  return (await uploadImageFile(file)).url
}

export default function PostForm({ post }: { post: Post | null }) {
  const [id, setId] = useState(post?.id)
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft")
  const [liveSlug, setLiveSlug] = useState(post?.slug ?? "")
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(post))
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "")
  const [coverImageWidth, setCoverImageWidth] = useState<number | null>(
    post?.coverImageWidth ?? null
  )
  const [coverImageHeight, setCoverImageHeight] = useState<number | null>(
    post?.coverImageHeight ?? null
  )
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? ""
  )
  const [body, setBody] = useState(post?.bodyMdx ?? "")
  const [faqs, setFaqs] = useState<FaqDraft[]>(() => {
    const rows = post?.faqs ?? []
    if (!rows.length) return [{ rowKey: "0", question: "", answer: "" }]
    return rows.map((faq, index) => ({ rowKey: String(index), ...faq }))
  })
  const [issues, setIssues] = useState<ContentIssue[]>([])
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [pending, startTransition] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)
  const issuesAlert = useRef<HTMLDivElement>(null)
  const faqRowsUsed = useRef(faqs.length)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setDirty(true)
    }
  }

  function revealIssues() {
    const node = issuesAlert.current
    if (!node) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    node.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    })
  }

  function updateFaq(
    index: number,
    patch: Partial<{ question: string; answer: string }>
  ) {
    setFaqs((value) => {
      const next = [...value]
      next[index] = { ...next[index], ...patch }
      return next
    })
    setDirty(true)
  }

  function removeFaq(index: number) {
    setFaqs((value) => value.filter((_, position) => position !== index))
    setDirty(true)
  }

  function addFaq() {
    setFaqs((value) => [
      ...value,
      { rowKey: String(faqRowsUsed.current++), question: "", answer: "" },
    ])
    setDirty(true)
  }

  function save(nextStatus: PostStatus) {
    startTransition(async () => {
      const result = await savePost({
        id,
        slug,
        title,
        excerpt,
        coverImageUrl: coverImageUrl.trim() || null,
        coverImageWidth: coverImageUrl.trim() ? coverImageWidth : null,
        coverImageHeight: coverImageUrl.trim() ? coverImageHeight : null,
        bodyMdx: body,
        status: nextStatus,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        tags: parseTags(tags),
        faqs: faqs
          .map((faq) => ({
            question: faq.question.trim(),
            answer: faq.answer.trim(),
          }))
          .filter((faq) => faq.question || faq.answer),
      })

      if (!result.ok) {
        setIssues(result.issues)
        toast.error(
          result.issues.length === 1
            ? "Not saved. One thing to fix first."
            : `Not saved. ${result.issues.length} things to fix first.`
        )
        requestAnimationFrame(revealIssues)
        return
      }

      setIssues([])
      setUploadError(null)
      setStatus(result.post.status)
      setLiveSlug(result.post.slug)
      setSlug(result.post.slug)
      setSavedAt(new Date())
      setDirty(false)

      if (!id) {
        setId(result.post.id)
        window.history.replaceState(null, "", `/admin/blog/${result.post.id}`)
      }
    })
  }

  async function onCoverSelected(file: File | undefined) {
    if (!file || uploading) return
    setUploadError(null)
    setUploading(true)
    try {
      const uploaded = await uploadImageFile(file)
      edit(setCoverImageUrl)(uploaded.url)
      edit(setCoverImageWidth)(uploaded.width)
      edit(setCoverImageHeight)(uploaded.height)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function onCoverRemoved() {
    setUploadError(null)
    edit(setCoverImageUrl)("")
    edit(setCoverImageWidth)(null)
    edit(setCoverImageHeight)(null)
  }

  function onCoverUrlChanged(value: string) {
    setUploadError(null)
    edit(setCoverImageUrl)(value)
    edit(setCoverImageWidth)(null)
    edit(setCoverImageHeight)(null)
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="space-y-6">
          <Input
            value={title}
            onChange={(event) => {
              edit(setTitle)(event.target.value)
              if (!slugTouched) setSlug(slugify(event.target.value))
            }}
            placeholder="Post title"
            aria-label="Post title"
            className="h-12 font-heading text-2xl sm:h-14 sm:text-3xl md:text-4xl"
          />
          <PostEditor
            initialMarkdown={post?.bodyMdx ?? ""}
            onChange={(markdown) => {
              setBody(markdown)
              setDirty(true)
            }}
            uploadImage={uploadImage}
          />

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl">
                Frequently asked questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Publishing needs at least one question and answer. Answers
                render under the post and feed the FAQ schema on the page, so
                ask them the way a reader would and keep each answer under{" "}
                {FAQ_ANSWER_MAX_LENGTH} characters.
              </p>
            </div>

            {faqs.map((faq, index) => (
              <Card key={faq.rowKey} size="sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={`faq-question-${faq.rowKey}`}>
                      Question
                    </Label>
                    {faqs.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaq(index)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    id={`faq-question-${faq.rowKey}`}
                    value={faq.question}
                    onChange={(event) =>
                      updateFaq(index, { question: event.target.value })
                    }
                    placeholder="What does an AI name check actually measure?"
                  />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Answer</Label>
                    <span
                      className={cn(
                        "text-xs text-muted-foreground tabular-nums",
                        faq.answer.trim().length > FAQ_ANSWER_MAX_LENGTH &&
                          "text-destructive"
                      )}
                    >
                      {faq.answer.trim().length} / {FAQ_ANSWER_MAX_LENGTH}
                    </span>
                  </div>
                  <PostEditor
                    compact
                    initialMarkdown={faq.answer}
                    onChange={(markdown) =>
                      updateFaq(index, { answer: markdown })
                    }
                    uploadImage={uploadImage}
                  />
                </CardContent>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addFaq}>
              Add question
            </Button>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {issues.length ? (
            <div ref={issuesAlert} tabIndex={-1} className="outline-none">
              <Alert variant="destructive">
                <AlertTitle>Fix these before saving</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc space-y-1 ps-4">
                    {issues.map((issue, index) => (
                      <li key={index}>
                        {issue.line ? `Line ${issue.line}: ` : ""}
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          ) : null}

          {savedAt && !issues.length ? (
            <Alert role="status">
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>
                {status === "published"
                  ? "Live on the blog."
                  : "Saved as draft."}{" "}
                {savedAt.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="hidden flex-wrap gap-2 lg:flex">
            {status === "published" ? (
              <>
                <Button disabled={pending} onClick={() => save("published")}>
                  {pending ? "Saving…" : "Update"}
                </Button>
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() => save("draft")}
                >
                  Unpublish
                </Button>
              </>
            ) : (
              <>
                <Button disabled={pending} onClick={() => save("published")}>
                  {pending ? "Saving…" : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() => save("draft")}
                >
                  Save draft
                </Button>
              </>
            )}
          </div>

          {id ? (
            <div className="flex gap-4 text-sm">
              <Link
                href={`/admin/blog/${id}/preview`}
                target="_blank"
                className="underline underline-offset-4"
              >
                Preview
              </Link>
              {status === "published" ? (
                <Link
                  href={`/blog/${liveSlug}`}
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  View live
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 space-y-2 md:mt-2">
            <Label htmlFor="slug">URL slug</Label>
            <div className="flex h-10 items-center border border-transparent border-b-input bg-transparent transition-[color,border-color] focus-within:border-b-ring">
              <span
                aria-hidden="true"
                className="shrink-0 text-base text-muted-foreground md:text-sm"
              >
                /blog/
              </span>
              <input
                id="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  edit(setSlug)(slugify(event.target.value))
                }}
                placeholder="my-post"
                autoComplete="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent px-0 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(event) => edit(setExcerpt)(event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(event) => edit(setTags)(event.target.value)}
              placeholder="naming, domains"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover image</Label>
            {coverImageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video border border-input bg-muted/40">
                  {isUsableCoverSrc(coverImageUrl) ? (
                    <Image
                      src={coverImageUrl}
                      alt="Cover preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 640px"
                      className="object-cover"
                      onError={() =>
                        setUploadError(
                          "That image couldn't be loaded. Check the URL and try again."
                        )
                      }
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                      onError={() =>
                        setUploadError(
                          "That doesn't look like an image URL that will load. Use an https:// address."
                        )
                      }
                    />
                  )}
                  {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
                      Uploading…
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploading}
                    onClick={onCoverRemoved}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragging(false)
                  void onCoverSelected(event.dataTransfer.files?.[0])
                }}
                className={cn(
                  "flex w-full flex-col items-center gap-1 border border-dashed border-input bg-muted/40 px-4 py-8 text-center transition-colors hover:border-ring hover:bg-muted",
                  dragging && "border-primary bg-primary/5",
                  uploading && "opacity-70"
                )}
              >
                <HugeiconsIcon
                  icon={ImageAdd01Icon}
                  className="size-8 text-muted-foreground"
                />
                <span className="text-sm font-medium">
                  {uploading
                    ? "Uploading…"
                    : "Drop an image here, or click to browse"}
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPEG, WebP, GIF or AVIF · up to 4 MB
                </span>
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(event) => {
                void onCoverSelected(event.target.files?.[0])
                event.target.value = ""
              }}
            />
            <Input
              id="cover"
              value={coverImageUrl}
              onChange={(event) => onCoverUrlChanged(event.target.value)}
              placeholder="…or paste an image URL"
              inputMode="url"
              aria-invalid={
                Boolean(coverImageUrl.trim()) &&
                !isUsableCoverSrc(coverImageUrl)
              }
            />
            {coverImageUrl.trim() && !isUsableCoverSrc(coverImageUrl) ? (
              <p className="text-xs text-destructive">
                Needs an https:// URL, or a site path starting with a single /
                like /images/cover.jpg.
              </p>
            ) : null}
            {uploadError ? (
              <p className="text-xs text-destructive">{uploadError}</p>
            ) : null}
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="seo">
              <AccordionTrigger>Search and sharing</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Search title</Label>
                  <Input
                    id="seo-title"
                    value={seoTitle}
                    onChange={(event) => edit(setSeoTitle)(event.target.value)}
                    placeholder={title}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-description">Search description</Label>
                  <Textarea
                    id="seo-description"
                    value={seoDescription}
                    onChange={(event) =>
                      edit(setSeoDescription)(event.target.value)
                    }
                    rows={3}
                    placeholder={excerpt}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-8 border-t bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        {issues.length ? (
          <p className="mb-2 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            {issues.length === 1
              ? "1 thing to fix before this saves."
              : `${issues.length} things to fix before this saves.`}
          </p>
        ) : null}
        <div className="flex gap-2">
          {status === "published" ? (
            <>
              <Button
                className="flex-1"
                disabled={pending}
                onClick={() => save("published")}
              >
                {pending ? "Saving…" : "Update"}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={pending}
                onClick={() => save("draft")}
              >
                Unpublish
              </Button>
            </>
          ) : (
            <>
              <Button
                className="flex-1"
                disabled={pending}
                onClick={() => save("published")}
              >
                {pending ? "Saving…" : "Publish"}
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                disabled={pending}
                onClick={() => save("draft")}
              >
                Save draft
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
