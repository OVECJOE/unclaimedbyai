import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * The sign-in ask in front of an anonymous sandbox. Sits above the ideas
 * rather than replacing them, because the taste run is what earns the
 * ask: someone who has just seen six ideas generated for their brief is
 * answering a different question than someone who has seen a signup form.
 */
export default function SandboxGate() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10">
      <div className="flex flex-col items-center gap-3 border border-dashed p-6 text-center">
        <p className="font-heading text-xl">Keep this sandbox.</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Sign in and this sandbox moves into your account automatically, so
          the ideas you are looking at stay yours.
        </p>
        <Button asChild>
          <Link href="/auth">Sign in to keep them</Link>
        </Button>
      </div>
    </div>
  )
}
