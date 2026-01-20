'use client'

import { useEffect, useState } from 'react'

export default function NutritionSummarySection({ user }) {
  const [nutrition, setNutrition] = useState({
    proteins: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  })

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        const res = await fetch('/api/nutrition/summary')
        if (res.ok) {
          const data = await res.json()
          setNutrition(data)
        }
      } catch (error) {
        console.error('Error fetching nutrition:', error)
      }
    }

    fetchNutrition()
  }, [])

  const macroData = [
    { name: 'البروتينات', value: nutrition.proteins, target: 50, color: 'bg-red-500', icon: '🥚' },
    { name: 'الكربوهيدرات', value: nutrition.carbs, target: 300, color: 'bg-yellow-500', icon: '🌾' },
    { name: 'الدهون', value: nutrition.fats, target: 70, color: 'bg-purple-500', icon: '🥑' },
    { name: 'الألياف', value: nutrition.fiber, target: 25, color: 'bg-green-500', icon: '🥬' },
  ]

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">🥗 ملخص التغذية</h3>
      <div className="space-y-3">
        {macroData.map((macro) => (
          <div key={macro.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{macro.icon}</span>
              <span className="text-sm text-gray-700">{macro.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`${macro.color} h-2 rounded-full transition-all`}
                  style={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                {macro.value}g
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
