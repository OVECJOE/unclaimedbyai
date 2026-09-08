import AppFooter from "@/components/app-footer";
import AppHeader from "@/components/app-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Globe02Icon,
  SmileIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />

      <main className="flex flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-20 sm:px-8 md:py-24">
          <section className="mx-auto w-full max-w-3xl text-center">
            <h1 className="font-heading text-7xl font-medium leading-none tracking-tight text-primary sm:text-8xl md:text-9xl">
              404
            </h1>

            <h2 className="mt-6 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
              Looks like you&apos;ve lost your way.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Looks like this page went unclaimed. Here is a fun fact and a
              joke to help soften your poor landing.
            </p>
          </section>

          <section className="mx-auto mt-14 grid w-full max-w-5xl gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
            <Card className="border-0">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center border border-border bg-muted text-primary">
                    <HugeiconsIcon
                      icon={Globe02Icon}
                      size={15}
                      strokeWidth={1.8}
                    />
                  </span>

                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Fun fact
                  </span>
                </div>

                <CardTitle className="mt-3 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
                  Some names are worth millions.
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                <p className="text-base leading-7 text-muted-foreground">
                  In the early 2000s, the domain{" "}
                  <code className="font-mono text-sm text-foreground">
                    business.com
                  </code>{" "}
                  sold for $7.5 million. At the time, it was the single most
                  expensive domain purchase ever.
                </p>

                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Meanwhile,{" "}
                  <code className="font-mono text-sm text-foreground">
                    voice.com
                  </code>{" "}
                  later beat it at $30 million in 2019.
                </p>

                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Two words, no punctuation, no cleverness. Just the plainest
                  possible noun someone could think of.
                </p>

                <div className="mt-6 border-l-2 border-primary pl-4">
                  <p className="font-heading text-xl leading-7 text-foreground">
                    Boring but exactly what people search for.
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Sometimes clever loses to obvious.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center border border-border bg-muted text-primary">
                    <HugeiconsIcon
                      icon={SmileIcon}
                      size={15}
                      strokeWidth={1.8}
                    />
                  </span>

                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Joke
                  </span>
                </div>

                <CardTitle className="mt-3 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
                  The 2 a.m. naming Ceremony.
                </CardTitle>

                <CardDescription className="mt-3 text-base leading-6">
                  Why did the startup founder refuse to name their company
                  until 2 a.m.?
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <p className="text-lg leading-8 text-foreground sm:text-xl">
                  Because that&apos;s the only time zone where the good{" "}
                  <code className="font-mono text-sm">.com</code>s are still
                  unclaimed.
                </p>
              </CardContent>

              <CardFooter className="border-t border-border">
                <div className="flex w-full items-center justify-between gap-4 pt-5">
                  <span className="text-sm text-muted-foreground">
                    Did you laugh?
                  </span>

                  <Link href="/">
                    <Toggle
                      name="laugh"
                      aria-label="Did you laugh?"
                      className="gap-2"
                    >
                      <HugeiconsIcon
                        icon={SmileIcon}
                        size={16}
                        strokeWidth={1.8}
                      />

                      <span>Yes</span>
                    </Toggle>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </section>

          <div className="mt-8 text-center">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Nothing to claim here
            </p>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
