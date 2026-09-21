"use client"

import { useRef, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProfilePhoto() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar className="h-16 w-16">
        <AvatarImage src={preview ?? "https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=Victor%20Ohachor"} />
        <AvatarFallback>VO</AvatarFallback>
      </Avatar>
      <div>
        <Button variant="link" className="p-0" type="button" onClick={() => inputRef.current?.click()}>
          Change photo
        </Button>
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
