import { login } from "@/lib/auth-storage"
import { cookies } from "next/headers"

const users = [
  {
    id: "1",
    name: "Abdullah ALLahham",
    email: "abdullah@nutriflow.com",
    password: "abdullah123",
    phone: "",
    dietaryPreferences: [],
    healthGoals: [],
  },
  {
    id: "2",
    name: "Aya Almadhoon",
    email: "aya@nutriflow.com",
    password: "aya123",
    phone: "",
    dietaryPreferences: [],
    healthGoals: [],
  },
]



export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

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

    // localStorage.setItem("currentUser", JSON.stringify(user))

    login( email, password );


    return Response.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
