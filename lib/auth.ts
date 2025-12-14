import { cookies } from "next/headers"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  dietaryPreferences?: string[]
  healthGoals?: string[]
}

interface StoredUser extends User {
  password: string
  createdAt: string
}

const PREDEFINED_USERS: StoredUser[] = [
  {
    id: "1",
    name: "Abdullah ALLahham",
    email: "abdullah@nutriflow.com",
    password: "abdullah123",
    avatar: "",
    phone: "",
    dietaryPreferences: ["Balanced", "High Protein"],
    healthGoals: ["Muscle Gain", "Better Energy"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Aya Almadhoon",
    email: "aya@nutriflow.com",
    password: "aya123",
    avatar: "",
    phone: "",
    dietaryPreferences: ["Vegetarian", "Low Carb"],
    healthGoals: ["Weight Loss", "Better Sleep"],
    createdAt: new Date().toISOString(),
  },
]

// In-memory user store (replace with database in production)
const users: StoredUser[] = [...PREDEFINED_USERS]

export function getAllUsers(): StoredUser[] {
  return users
}

export function findUserByEmail(email: string): StoredUser | null {
  return users.find((u) => u.email === email) || null
}

export function findUserById(id: string): StoredUser | null {
  return users.find((u) => u.id === id) || null
}

export function createUser(name: string, email: string, password: string): StoredUser | null {
  if (findUserByEmail(email)) {
    return null
  }

  const newUser: StoredUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    avatar: "",
    phone: "",
    dietaryPreferences: [],
    healthGoals: [],
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  return newUser
}

export function authenticateUser(email: string, password: string): StoredUser | null {
  const user = users.find((u) => u.email === email && u.password === password)
  return user || null
}

export function stripPassword(user: StoredUser): User {
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Session management with HTTP-only cookies
export async function setUserSession(user: StoredUser) {
  const cookieStore = await cookies()

  cookieStore.set("userId", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  cookieStore.set("userName", user.name, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  cookieStore.set("userEmail", user.email, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete("userId")
  cookieStore.delete("userName")
  cookieStore.delete("userEmail")
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return null
  }

  const user = findUserById(userId)
  if (!user) {
    return null
  }

  return stripPassword(user)
}
