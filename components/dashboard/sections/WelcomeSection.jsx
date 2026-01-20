'use client'

export default function WelcomeSection({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'مساء الخير'
    return 'تصبح على خير'
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-2">{getGreeting}، {user?.name || 'صديقي'} 👋</h1>
      <p className="text-green-50">
        مرحباً بك في لوحة المعلومات. تابع رحلتك نحو نمط حياة صحي!
      </p>
    </div>
  )
}
