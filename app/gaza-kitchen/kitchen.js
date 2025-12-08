"use client";

import { useState } from "react";

const REGIONS = ["ALL", "North", "Gaza", "Middle", "Khan Younis", "Rafah"];

export default function KitchensFilter({ kitchens }) {
  const [selected, setSelected] = useState("ALL");

  const filteredKitchens =
    selected === "ALL"
      ? kitchens
      : kitchens.filter((kitchen) => kitchen.region === selected);

  return (
    <>
      <div className="flex justify-center items-center gap-6 mb-4 bg-[var(--color-secondary-light)] bg-opacity-50 p-5 border-[var(--color-secondary-light)] rounded-xl mr-12">
        <i className="fa-solid fa-circle-info text-[var(--color-primary)]"></i>
        <div>
          <h3 className="text-[var(--color-primary)] font-bold">How to Get Meals</h3>
          <p className="text-[var(--color-gray-300)]">All kitchens below provide free meals to families in need. Arrive during distribution times listed. No prior registration required at most locations.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 mt-12 justify-start w-full pl-40">
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => setSelected(region)}
            className={`px-4 py-2 rounded-full  transition-colors ${
              selected === region
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Kitchens List */}
      {filteredKitchens.length === 0 ? (
        <p className="text-gray-500 text-lg">No kitchens found in this region.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {filteredKitchens.map((kitchen) => (
            <div
              key={kitchen.name}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <h2 className="font-bold text-2xl mb-1">{kitchen.name}</h2>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <span className="mr-1">📍</span>
                  <span>{kitchen.location}</span>
                </div>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Open & Serving
                </span>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-3 text-gray-700 text-sm">
                <div className="flex items-center">
                  <span className="mr-2">⏰</span>
                  <span>
                    <strong>Distribution Time:</strong> {kitchen.distribution_time}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">👥</span>
                  <span>
                    <strong>Capacity:</strong> {kitchen.capacity}
                  </span>
                </div>
                <div className="bg-gray-100 p-2 rounded-md">
                  <strong>TODAY'S MEAL</strong>
                  <p>{kitchen.todays_meal}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <strong>ACCESS INFORMATION</strong>
                  <p>{kitchen.access_info}</p>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">📞</span>
                  <span>{kitchen.contact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
