'use client'

import { useEffect, useState } from 'react'

export default function RecommendationsSection({ user }) {
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/recommendations')
        if (res.ok) {
          const data = await res.json()
          setRecommendations(data)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      }
    }

    fetchRecommendations()
  }, [])

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">💡 النصائح الموصى بها</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-lg hover:shadow-md transition"
            >
              <h4 className="font-bold text-blue-900 mb-2">{rec.title}</h4>
              <p className="text-sm text-blue-800">{rec.description}</p>
              {rec.icon && <span className="text-2xl mt-2 inline-block">{rec.icon}</span>}
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">لا توجد نصائح حالياً</p>
        )}
      </div>
    </div>
  )
}
