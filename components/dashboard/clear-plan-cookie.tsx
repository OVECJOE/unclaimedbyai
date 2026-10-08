"use client"

import { useEffect } from "react"
import { clearPlanCookie } from "@/components/public/plan-cookie"

export default function ClearPlanCookie() {
  useEffect(() => {
    clearPlanCookie()
  }, [])

  return null
}
