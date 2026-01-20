'use client'

import { useEffect, useState } from 'react'
import ProgressCard from '@/components/ProgressCard'

export default function ProgressSection({ user }) {
  const [progress, setProgress] = useState({
    todayCalories: 0,
    targetCalories: 2000,
    waterIntake: 0,
    targetWater: 8,
    exerciseMinutes: 0,
    targetExercise: 30,
  })

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/progress')
        if (res.ok) {
          const data = await res.json()
          setProgress(data)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      }
    }

    fetchProgress()
  }, [])

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">📊 تقدمك اليوم</h3>
      <div className="space-y-4">
        <ProgressCard
          title="السعرات الحرارية"
          current={progress.todayCalories}
          target={progress.targetCalories}
          unit="cal"
          color="bg-orange-500"
        />
        <ProgressCard
          title="الماء"
          current={progress.waterIntake}
          target={progress.targetWater}
          unit="أكواب"
          color="bg-blue-500"
        />
        <ProgressCard
          title="التمارين"
          current={progress.exerciseMinutes}
          target={progress.targetExercise}
          unit="دقيقة"
          color="bg-green-500"
        />
      </div>
    </div>
  )
}
