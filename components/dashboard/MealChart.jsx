"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const MealChart = ({ meals = [], lang }) => {
  const [mounted, setMounted] = useState(false);

  // التأكد من أن المكون يعمل في المتصفح فقط (حل مشكلة Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[350px] w-full bg-gray-50 animate-pulse rounded-[2rem]" />;

  // تجهيز البيانات الافتراضية
  const chartData = [
    { name: lang === "ar" ? "الفطور" : "Breakfast", value: 0, color: "#fb923c", id: "breakfast" },
    { name: lang === "ar" ? "الغداء" : "Lunch", value: 0, color: "#3b82f6", id: "lunch" },
    { name: lang === "ar" ? "العشاء" : "Dinner", value: 0, color: "#6366f1", id: "dinner" },
    { name: lang === "ar" ? "وجبات خفيفة" : "Snacks", value: 0, color: "#22c55e", id: "snacks" },
  ];

  // دمج البيانات القادمة من المكون الأب
  meals.forEach((meal) => {
    const typeId = meal.mealType?.toLowerCase().trim();
    const entry = chartData.find((d) => d.id === typeId);
    if (entry) {
      entry.value += Number(meal.calories) || 0;
    }
  });

  // تصفية الأقسام التي ليس بها سعرات
  const finalData = chartData.filter((d) => d.value > 0);

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mt-10">
      <h3 className="text-xl font-black mb-6 text-gray-800 border-b pb-4">
        {lang === "ar" ? "تحليل الوجبات" : "Meal Analysis"}
      </h3>

      {finalData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={finalData}
                innerRadius={65}
                outerRadius={90}
                paddingAngle={10}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {finalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={12} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[200px] flex flex-col items-center justify-center text-gray-400">
          <p className="font-bold italic italic">
            {lang === "ar" ? "لا توجد سعرات مسجلة اليوم" : "No calories recorded for today"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MealChart;