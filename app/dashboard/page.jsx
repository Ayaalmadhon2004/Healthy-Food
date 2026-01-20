'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DashboardSection from '@/components/dashboard/DashboardSection'
import WelcomeSection from '@/components/dashboard/sections/WelcomeSection'
import ProgressSection from '@/components/dashboard/sections/ProgressSection'
import MealLogSection from '@/components/dashboard/sections/MealLogSection'
import NutritionSummarySection from '@/components/dashboard/sections/NutritionSummarySection'
import RecommendationsSection from '@/components/dashboard/sections/RecommendationsSection'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const userData = await res.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Dashboard Sections Container - Extensible */}
        <div className="space-y-6">
          
          {/* Welcome Section */}
          <DashboardSection>
            <WelcomeSection user={user} />
          </DashboardSection>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Progress Section */}
            <DashboardSection>
              <ProgressSection user={user} />
            </DashboardSection>

            {/* Nutrition Summary Section */}
            <DashboardSection>
              <NutritionSummarySection user={user} />
            </DashboardSection>

          </div>

          {/* Full Width Sections */}
          
          {/* Meal Log Section */}
          <DashboardSection>
            <MealLogSection user={user} />
          </DashboardSection>

          {/* Recommendations Section */}
          <DashboardSection>
            <RecommendationsSection user={user} />
          </DashboardSection>

        </div>
      </main>

      <Footer />
    </div>
  )
}
