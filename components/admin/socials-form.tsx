"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { saveSocials } from "@/lib/blog/actions"
import { SOCIAL_PLATFORMS, socialHandle } from "@/lib/blog/socials"
import type { Editor, SocialsFormState } from "@/lib/blog/types"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save links"}
    </Button>
  )
}

export default function SocialsForm({ editor }: { editor: Editor }) {
  const [state, action] = useActionState(saveSocials, {
    ok: false,
    message: "",
  } satisfies SocialsFormState)

  return (
    <form action={action} className="max-w-prose space-y-4">
      {SOCIAL_PLATFORMS.map((platform) => {
        const current = editor.socials.find(
          (social) => social.platform === platform.value
        )
        return (
          <div key={platform.value} className="space-y-1">
            <Label
              htmlFor={`social-${platform.value}`}
              className="flex items-center gap-2"
            >
              <HugeiconsIcon icon={platform.icon} size="1rem" />
              {platform.label}
            </Label>
            {platform.prefix ? (
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText className="font-mono">
                    {platform.prefix.replace("https://", "")}
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={`social-${platform.value}`}
                  name={platform.value}
                  defaultValue={
                    current ? socialHandle(current.url, platform.prefix) : ""
                  }
                  autoComplete="off"
                />
              </InputGroup>
            ) : (
              <Input
                id={`social-${platform.value}`}
                name={platform.value}
                type="url"
                inputMode="url"
                defaultValue={current?.url ?? ""}
                placeholder="https://"
              />
            )}
          </div>
        )
      })}
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-sm" : "text-sm text-destructive"}
        >
          {state.message}
        </p>
      ) : null}
      <SaveButton />
    </form>
  )
}
