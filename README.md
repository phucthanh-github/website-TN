# 🎓 Graduation Invitation & RSVP Website

A stunning, interactive, and fully responsive graduation invitation website featuring real-time RSVP submission, custom background animations, interactive elements, and a secret admin dashboard. Powered by React, Vite, and Supabase.

---

## ✨ Features

- **📸 Interactive Polaroid Frame**: Click on the Polaroid photo to toggle between different photos with an interactive sparkle effect.
- **⏳ Real-time Countdown Timer**: Shows a beautiful, glassmorphic countdown ticking down to the graduation ceremony (June 9, 2026).
- **🎵 Floating Music Player**: A sweet background audio track playing with an interactive rotating vinyl record toggle button.
- **🎈 Floating Background Particles**: Gentle floating elements (graduation caps, balloons, stars, and blossoms) drifting down the screen.
- **📝 Real-time RSVP Form**: Direct connection to Supabase database for collecting guest names, attendance status, and customized messages.
- **🎉 Confetti Celebrations**: Exploding confetti effects on successful form submission.
- **🗺️ Integrated Maps**: Embedded Google Maps and a detailed Campus Map of UIT (University of Information Technology) for easy navigation.
- **🚗 Parking Guide**: Clear steps and instructions on parking locations and costs.
- **👥 Secret Admin View**: Access the full real-time guest list by simply appending `?admin=true` to the URL.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Vanilla CSS3, `@supabase/supabase-js`
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

---

## 🚀 Setup & Local Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Set up the Database (Supabase)
Create a new project on [Supabase](https://supabase.com) and run the following script in the **SQL Editor** to create the `rsvps` table and configure access permissions (RLS):

```sql
-- Create rsvps table
create table rsvps (
  id bigint primary key generated always as identity,
  name text not null,
  attending boolean not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table rsvps enable row level security;

-- Create policies for public access
create policy "Allow public read access" on rsvps for select using (true);
create policy "Allow public insert access" on rsvps for insert with check (true);
```

### 3. Clone & Local Development
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `frontend` folder (or copy `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Admin Dashboard

To view all the RSVPs submitted by your guests:
- Locally: [http://localhost:5173/?admin=true](http://localhost:5173/?admin=true)
- In production: `https://your-domain.vercel.app/?admin=true`

You can also manage, delete, or export this data as a CSV spreadsheet directly inside your Supabase project dashboard's **Table Editor**.

---

## 📦 Deployment to Vercel

1. Push your code to your GitHub repository.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
3. Select your repository.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Click **Deploy**. Vercel will build and launch your site in a few seconds!

---

*Made with ❤️ for Phuc Thanh's Graduation Day.*
