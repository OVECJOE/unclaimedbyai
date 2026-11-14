"use client"

import dynamic from "next/dynamic"

export const PostEditor = dynamic(() => import("./post-editor"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="skeleton skeleton-faint h-96 border border-input"
      aria-label="Loading editor"
    />
  ),
})
