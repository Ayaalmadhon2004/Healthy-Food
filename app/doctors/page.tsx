"use client"

import { Star, MapPin, Phone, Mail, Calendar } from "lucide-react"
import { useState, useEffect } from "react"

interface Doctor {
  id: number
  name: string
  specialty: string
  qualifications: string[]
  rating: number
  reviews: number
  location: string
  phone: string
  email: string
  about: string
  image: string
  availability: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main>
        {/* <Header /> */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-xl">{"loading"}</div>
        </section>
        {/* <Footer /> */}
      </main>
    )
  }

  return (
    <main>
      {/* <Header /> */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{"findHealthcareProfessional"}</h1>
          <p className="text-lg text-gray-600">{"connectWithExperts"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
              onClick={() => {
                setSelectedDoctor(doctor)
                setShowBookingModal(true)
              }}
            >
              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <img
                    src={doctor.image || "/placeholder.svg"}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-emerald-600 font-semibold mt-1">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < Math.floor(doctor.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {doctor.rating} ({doctor.reviews} {"reviews"})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">{"qualifications"}</h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.qualifications.map((qual, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{doctor.about}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-emerald-600" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-emerald-600" />
                    {doctor.availability}
                  </div>
                </div>

                <button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDoctor(doctor)
                    setShowBookingModal(true)
                  }}
                >
                  {"bookConsultation"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">
                {"bookWith"} {selectedDoctor.name}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {"specialty"}: {selectedDoctor.specialty}
                </p>
                <p className="text-sm text-gray-600 mb-4">{selectedDoctor.about}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-emerald-600" />
                  <a href={`tel:${selectedDoctor.phone}`} className="hover:text-emerald-600">
                    {selectedDoctor.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-emerald-600" />
                  <a href={`mailto:${selectedDoctor.email}`} className="hover:text-emerald-600">
                    {selectedDoctor.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-emerald-600" />
                  <span>{selectedDoctor.availability}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setShowBookingModal(false)}
                >
                  {"close"}
                </button>
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  {"scheduleNow"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </main>
  )
}
