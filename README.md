# Healthy Food and Gaza Kitchen Community

## Overview

**Healthy Food** is a community-driven platform designed to promote healthy eating, calorie awareness, and efficient food distribution. The project brings together health tracking, medical guidance, and community organization to tackle two main challenges:

1. Helping individuals calculate daily calories and follow healthier eating habits.
2. Supporting Gaza kitchen communities to organize food distribution and reduce wait times through digital coordination.

---

## Project Goals

* Encourage healthy nutrition through calorie calculation and practical food tips.
* Provide access to professional nutrition opinions and medical guidance.
* Streamline food distribution workflows for Gaza kitchens using real-time data.
* Reduce overcrowding and chaos during food distribution through a reservation system.
* Build a scalable, user-friendly platform for both individuals and community kitchens.

---

# Your Journey to Health and Community Support

### 1. Landing Page

The journey begins at the **Landing Page**: *Eat Healthy, Live Healthy*. Users can explore recipes, track meals, and start their nutrition journey immediately. From here, you can **Browse Recipes** or **Start Tracking**. Authentication is required to personalize the experience and save progress.
<img width="1857" height="861" alt="image" src="https://github.com/user-attachments/assets/239bd64f-768d-4192-9d5c-494a1594fcb6" />


### 2. Browse Recipes

The **Browse Recipes** page is the hub for discovering meals that fit your lifestyle.

* **Filtering:** Sort by Breakfast, Lunch, Dinner, or Snacks.
* **Details:** View prep time, total calories, ingredients, and instructions.
* **Action:** Users can **Log this Meal** to their tracker or **Add to Favorites** to save it for later.
  <img width="1149" height="687" alt="image" src="https://github.com/user-attachments/assets/29482493-298e-4817-9e24-f5c933962554" />


### Favorites and Calorie Overview

When a recipe is added to Favorites, the system displays the **name, quantity, and calorie value**. Adjusting quantities updates the total calories automatically, helping users stay within their daily targets.
<img width="1289" height="891" alt="image" src="https://github.com/user-attachments/assets/3f3626c1-4eba-4849-a2f4-d27a27849023" />


### 3. Meal Tracker

The **Meal Tracker** allows for easy daily calorie management.

* Log new meals throughout the day.
* Monitor real-time progress toward a specific daily calorie goal.
* Review a history of all meals added for the day with their specific calorie counts.
  <img width="1571" height="815" alt="image" src="https://github.com/user-attachments/assets/ae5d1021-9304-4de3-bce6-6c70171ddd85" />


### 4. Health and Nutrition Tips

This section provides practical daily habits to improve well-being:

* **Hydration:** Guidance on staying energized through water intake.
* **Balanced Meals:** Instructions on balancing proteins, vegetables, and healthy fats.
* **Rest and Movement:** The importance of sleep and daily physical activity.
* **Mental Health:** Breathing techniques to reduce anxiety and stress.
  <img width="1637" height="917" alt="image" src="https://github.com/user-attachments/assets/083546be-374b-4cd7-8822-5012a30891b2" />


### 5. Doctors and Appointments

The **Healthcare Professionals** section connects users with experts for personalized guidance. Users can browse profiles, check qualifications, view ratings, and **Book a Consultation** directly.

* **Nutritionists:** For weight management and chronic disease prevention.
* **Cardiologists:** For heart-healthy lifestyle guidance.
* **Holistic Coaches:** Combining nutrition science with wellness practices.
  <img width="1340" height="740" alt="image" src="https://github.com/user-attachments/assets/3c51d161-b4c6-4389-8277-52d1ec2e0861" />


### 6. Gaza Kitchen Community (Integrated Distribution)

The **Gaza Kitchen Community** module helps families locate and reserve free meals.

* **Live Reservations:** A digital pre-ordering system that ensures a meal is saved for the user.
* **Capacity Tracking:** Real-time indicators show the remaining meal count for each kitchen to prevent overcrowding.
* **Filtering:** Locate kitchens by region (North, Gaza, Middle, Khan Younis, Rafah).
* **Family Nutrition Guide:** Tailored advice for maximizing nutrition in emergency settings.
<img width="1502" height="821" alt="image" src="https://github.com/user-attachments/assets/009f823c-3a31-434d-a94b-bb398efe6d7d" />

---

## Features

* **Nutrition Knowledge:** Essential nutrients and balanced diet education.
* **Interactive Interface:** Responsive design optimized for both mobile and desktop.
* **Content Management:** Easily updatable articles, tips, and kitchen listings.
* **Bilingual Support:** Full Arabic and English integration for local and international accessibility.

---

## Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
* **Backend Logic:** Server Actions and Route Handlers
* **Database and ORM:** PostgreSQL with **Prisma 7**
* **Auth:** Supabase Auth (session cookies), roles `USER` / `ORG` / `ADMIN`
* **State and validation:** Zustand, Zod
* **Other:** Recharts, Lucide React, PWA (next-pwa)

---

## Installation and Setup

Requirements: Node.js 22.18+ (the unit tests import TypeScript files directly), a PostgreSQL database and a Supabase project.

```bash
git clone https://github.com/Ayaalmadhon2004/Healthy-Food.git
cd Healthy-Food
cp .env.example .env        # then fill in the values
npm install                 # also runs prisma generate
npx prisma db push          # create the tables
npx prisma db seed          # sample recipes, tips, doctors and kitchens
npm run dev
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection strings |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only, used by sign-up |
| `CRON_SECRET` | Required in production for `/api/cron/keep-alive` (`Authorization: Bearer <secret>`) |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server (the build reads the seeded database) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`lib/` is TypeScript; pages and actions are still JavaScript) |
| `npm test` | Unit tests (Node test runner) for dates, capacity and rate limiting |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and a build against a temporary PostgreSQL.

---

## Design Notes

* **Identity comes from the session.** Server Actions and API routes read the signed-in user from the Supabase session (`lib/auth.js`); they never trust a user id sent by the client. Kitchen management and area reports are restricted to `ORG` / `ADMIN`.
* **Gaza time.** "Today", "tomorrow" and monthly statistics use the `Asia/Gaza` timezone (`lib/dates.js`), independent of the server timezone.
* **Reservations** run in a serializable transaction (with retry), so a kitchen cannot be overbooked by concurrent requests.
* **Kitchen capacity** is stored as a number; older `{ en, ar }` values are still read correctly (`lib/capacity.js`).
* **Rate limiting** on login and sign-up is in-memory (`lib/rateLimit.js`); on serverless hosting use a shared store for strict limits.

---

## Project Structure

```text
Healthy-Food/
├─ app/                 # Pages, layouts, API routes and Server Actions (app/actions)
├─ components/          # Reusable UI, dashboard, kitchen and tracker components
├─ context/, hooks/, store/   # Language, user and favorites state
├─ lib/                 # Prisma, Supabase, auth, dates, capacity, rate limiting, validation
├─ locales/             # Arabic and English dictionaries
├─ prisma/              # Schema and seed
├─ tests/               # Unit tests
├─ public/              # Images, icons, manifest
└─ proxy.js             # Session refresh and route protection
```

---

## Future Improvements

* Personalized nutrition plans based on user health data.
* Advanced community forums for sharing local health tips.
* Enhanced reporting tools for aid organizations to track distribution efficiency.

---
