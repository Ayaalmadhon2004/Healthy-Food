"use client"

import type { User } from "./auth"

export async function getUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.user
  } catch (error) {
    return null
  }
}

export async function logout(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    return res.ok
  } catch (error) {
    return false
  }
}
