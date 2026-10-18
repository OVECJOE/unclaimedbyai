"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type CheckedList } from "@/lib/api"
import BrowseTab from "@/components/dashboard/watch-browse-tab"
import Watchlist from "@/components/dashboard/watchlist"

/**
 * Two surfaces on one page. "Pick a name" browses checked names you have
 * not starred yet; "Watching" lists the watchlist itself. A shared version
 * counter remounts both on any change, so a name watched in one tab
 * disappears from the other and a removal reappears in the pick list.
 */
export default function WatchlistTabs({
  initialChecked,
}: {
  initialChecked: CheckedList
}) {
  const [tab, setTab] = useState("watching")
  const [version, setVersion] = useState(0)

  function changed() {
    setVersion((current) => current + 1)
  }

  return (
    <Tabs data-tour="watchlist-tabs" value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="watching">Watching</TabsTrigger>
        <TabsTrigger value="browse">Pick a name</TabsTrigger>
      </TabsList>

      <TabsContent value="watching" className="pt-6">
        <Watchlist key={`watching-${version}`} onChanged={changed} />
      </TabsContent>

      <TabsContent value="browse" className="pt-6">
        <BrowseTab
          key={`browse-${version}`}
          initial={initialChecked}
          onWatched={changed}
        />
      </TabsContent>
    </Tabs>
  )
}
