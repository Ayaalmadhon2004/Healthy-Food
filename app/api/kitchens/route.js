// app/api/kitchens/route.js

export async function GET() {
  const kitchens = [
    {
      name: "Al-Sadaqa Kitchen",
      location: "Al-Shuja'iyya, Gaza City",
      region: "Gaza",
      distribution_time: "1:00 PM",
      capacity: "350-500 families",
      todays_meal: "Lentil soup + bread",
      access_info: "Open to all families. No registration needed.",
      contact: "+970-599-123456"
    },
    {
      name: "Rahma Charity Kitchen",
      location: "Beit Lahia, North Gaza",
      region: "North",
      distribution_time: "12:30 PM",
      capacity: "300 families",
      todays_meal: "Rice & beans",
      access_info: "First come, first served. Bring your own containers.",
      contact: "+970-597-554321"
    },
    {
      name: "Al-Amal Women's Community Kitchen",
      location: "Nuseirat Camp, Middle Area",
      region: "Middle",
      distribution_time: "2:00 PM",
      capacity: "250 families",
      todays_meal: "Vegetable soup",
      access_info: "Women-run kitchen. Wheelchair accessible entrance.",
      contact: "+970-592-876543"
    },
    {
      name: "Khan Younis Public Kitchen",
      location: "Khan Younis Camp, Khan Younis",
      region: "Khan Younis",
      distribution_time: "1:30 PM",
      capacity: "600 families",
      todays_meal: "Chicken rice (weekly), lentils (daily)",
      access_info: "Large capacity. Multiple distribution points in the camp.",
      contact: "+970-591-334477"
    },
    {
      name: "Al-Tadhamon Social Kitchen",
      location: "Tal Al-Sultan, Rafah",
      region: "Rafah",
      distribution_time: "12:00 PM",
      capacity: "200 families",
      todays_meal: "Pasta + tomato sauce",
      access_info: "Located near main road. Easy to find.",
      contact: "+970-599-884422"
    }
  ];

  return Response.json(kitchens);
}
