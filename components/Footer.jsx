import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 dark:border-gray-800 bg-white dark:bg-[#111] mt-16 py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Top Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-gray-700 dark:text-gray-300">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-orange-600 flex items-center justify-center text-white font-bold">
                NF
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                NutriFlow
              </span>
            </div>
            <p className="text-sm max-w-xs">
              Your companion for healthy eating and nutrition tracking.
            </p>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/recipes">Recipes</Link></li>
              <li><Link href="/meal-tracker">Meal Tracker</Link></li>
              <li><Link href="/profile">Profile</Link></li>
            </ul>
          </div>

          {/* Admin Section */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Admin</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin">Dashboard</Link></li>
              <li><Link href="/admin/recipes">Manage Recipes</Link></li>
              <li><Link href="/admin/users">Manage Users</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact">Email Us</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
          <p className="flex items-center justify-center gap-1">
            Made with <span className="text-red-500">❤️</span> for your health
          </p>
        </div>

      </div>
    </footer>
  );
}
