'use client'

import { useEffect, useState } from 'react'
import MealList from '@/components/MealList'

export default function MealLogSection({ user }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch('/api/meals/today')
        if (res.ok) {
          const data = await res.json()
          setMeals(data)
        }
      } catch (error) {
        console.error('Error fetching meals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">🍽️ الوجبات اليومية</h3>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          + إضافة وجبة
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">جاري التحميل...</div>
      ) : meals.length > 0 ? (
        <MealList meals={meals} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>لم تسجل أي وجبات اليوم</p>
          <p className="text-sm mt-2">ابدأ بإضافة وجبة الآن!</p>
        </div>
      )}
    </div>
  )
}
