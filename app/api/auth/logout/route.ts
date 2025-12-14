import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("userId")
    cookieStore.delete("userName")
    cookieStore.delete("userEmail")

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
