import { redirect } from "next/navigation"

/**
 * The watchlist moved under the Playground section when the dashboard
 * grew a sidebar. Old links and emails keep working through this.
 */
export default function OldWatchRoute() {
  redirect("/dashboard/playground/watchlist")
}
