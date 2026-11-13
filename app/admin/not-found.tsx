import NotFoundContent from "@/components/not-found-content"

/**
 * notFound() inside this area renders within its layout, which already
 * has the header and footer, so only the body goes here. Without this
 * file the root not-found rendered here too and doubled the chrome.
 */
export default function NotFound() {
  return <NotFoundContent />
}
