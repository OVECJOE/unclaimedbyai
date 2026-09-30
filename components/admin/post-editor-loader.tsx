"use client"

import dynamic from "next/dynamic"

export const PostEditor = dynamic(() => import("./post-editor"), {
  ssr: false,
  loading: () => <div className="h-96 border" />,
})
