export default function DashboardSection({ 
  children, 
  className = '',
  title = '',
  icon = null 
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          {icon && <span className="text-2xl">{icon}</span>}
          {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
        </div>
      )}
      {children}
    </div>
  )
}
