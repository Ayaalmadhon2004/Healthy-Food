"use client"

import { useEffect, useState } from "react"
import KitchensFilter from "./kitchen"

export default function KitchensFilterClient() {
  const [kitchens, setKitchens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const url = "/api/kitchens"

        const res = await fetch(url)
        if (!res.ok) throw new Error("Failed to fetch kitchens")
        const data = await res.json()
        setKitchens(data)
      } catch (err) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchKitchens()
  }, [])

  if (loading) return <p>Loading kitchens...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return <KitchensFilter kitchens={kitchens} />
}
