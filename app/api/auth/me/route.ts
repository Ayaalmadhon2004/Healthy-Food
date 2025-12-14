import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("userId")?.value
    const userName = cookieStore.get("userName")?.value
    const userEmail = cookieStore.get("userEmail")?.value

    if (!userId) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    return Response.json({
      user: {
        id: userId,
        name: userName,
        email: userEmail,
      },
    })
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
