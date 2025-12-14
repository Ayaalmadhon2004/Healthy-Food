export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  dietaryPreferences?: string[]
  healthGoals?: string[]
  createdAt?: string
}

const USERS: User[] = [
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

export function initUsers() {
  if (typeof window === "undefined") return
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(USERS))
  }
}

export const initializeUsers = initUsers

function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("users")
  return data ? JSON.parse(data) : []
}

function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("users", JSON.stringify(users))
}


export function signup(name: string, email: string, password: string): User | null {
  const users = getUsers()

    if (users.find((u) => u.email === email)) {
    return null
    }
    const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    phone: "",
    dietaryPreferences: [],
    healthGoals: [],
    createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)

    return newUser

  
  return null
}


export function login(email: string, password: string): User | null {
  const users = getUsers()
  console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrr', email, password)
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
    return user
  }
  return null
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userId = localStorage.getItem("currentUser")
  if (!userId) return null

  const users = getUsers()
  return users.find((u) => u.id === userId) || null
}

export function logout() {
  if (typeof window === "undefined") return
  localStorage.removeItem("currentUser")
}

export const logoutUser = logout

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === userId)

  if (index === -1) return null

  users[index] = { ...users[index], ...updates }
  saveUsers(users)
  return users[index]
}

export const updateUserProfile = updateUser
