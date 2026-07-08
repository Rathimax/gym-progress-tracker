# 🚀 FitTrack: The Intelligent Gym & Diet Ecosystem

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Rathimax/gym-progress-tracker)
[![License: ISC](https://img.shields.io/badge/License-ISC-brightgreen.svg)](https://opensource.org/licenses/ISC)
[![Framework: Express](https://img.shields.io/badge/Backend-Express-black.svg)](https://expressjs.com/)
[![AI: Gemini 2.5 Flash](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![PWA: Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)

**FitTrack** is a high-performance, AI-integrated Progressive Web Application (PWA) designed to bridge the gap between workout logging and nutritional management. Built for athletes who demand precision, FitTrack centralizes your fitness data and uses cutting-edge AI to provide actionable insights.

---

## 🧐 The Problem & Our Solution

### The Problem
Fitness enthusiasts often struggle with:
- **Fragmentation**: Using one app for the gym, another for food, and a third for progress tracking.
- **Data Blindness**: Logging hundreds of sets but never understanding the "why" or "what's next."
- **Manual Overhead**: Spending more time entering calories than eating the food.

### The Solution
**FitTrack** solves this by providing a unified, dual-mode ecosystem powered by **Gemini AI**. It doesn't just store your data—it understands it. Whether you're tracking a heavy leg day or scanning a masala dosa, FitTrack provides the intelligence to keep you on track.

---

## ✨ Core Features

### 🏋️ Exercise Mode
*   **Intelligent Logging**: Log reps, sets, weight, and duration with ease.
*   **Trophy Case**: A gamified achievement system that rewards consistency and milestones.
*   **Muscle Heatmap**: A dynamic visualization of your training intensity across muscle groups over the last 7 days.
*   **PR Analytics**: Track Personal Records and visualize your strength progression with interactive charts.
*   **Advanced Tools**:
    *   **1RM Calculator**: Estimate your strength potential.
    *   **BMI & Body Fat (Navy Method)**: Professional-grade body metric calculators.
*   **Active Routine Widget**: Keep your current workout front and center.

### 🥗 Diet Mode
*   **Macro Dashboard**: Real-time tracking of Calories, Protein, Carbs, and Fats.
*   **Water Tracker**: Monitor hydration levels throughout the day.
*   **Meal Management**: Categorize meals (Breakfast, Lunch, Dinner, Snack) with precise nutritional data.
*   **Weekly Analytics**: Understand your nutritional trends and consistency scores.
*   **AI Diet Plan**: Tailored daily menus, macro metrics, and guidelines generated directly by Gemini AI based on your physical metrics.

### 👥 Social & Strength League
*   **Friend Connection**: Share and connect with other users via custom friend codes.
*   **Strength League Leaderboard**: A real-time league ranking users by their exercise PRs (e.g., Deadlift, Bench Press) supporting tied ranks, tied indicator badges, and active user highlighting.
*   **Interactive 3D Podium**: A visual 3-pillar podium modal (Gold, Silver, Bronze) rendering the top 3 lifters for any exercise, complete with background scroll locking and automatic dismissals when changing views.

---

## 🤖 AI Integration: Meet Your Coaches

FitTrack leverages **Google Gemini 2.5 Flash** to provide a premium coaching experience.

### 🧠 FAIit (FitTrack AI Assistant)
Located in the Exercise Mode, FAIit analyzes your entire workout history.
- **Personalized Analysis**: "How has my bench press improved over the last 3 months?"
- **Routine Suggestions**: "Suggest a 4-day split based on my recent focus on back and shoulders."
- **Gym Knowledge**: Ask anything from form tips to physiological explanations.

### 🍎 AI Diet Coach
A dedicated nutrition expert that lives in Diet Mode.
- **Context-Aware Coaching**: It knows your current calories, protein intake, and even your "Protein Consistency Score."
- **Dynamic Tone**: Choose between *Motivational*, *Strict*, or *Balanced* coaching styles.
- **Actionable Advice**: "You're 30g short on protein today—try adding Greek yogurt to your next meal."

### 📸 AI Food Scanner & Refiner
- **Vision Integration**: Snap a photo of your meal, and Gemini identifies the dish and estimates its macros instantly.
- **Smart Refinement**: If the AI guesses wrong, simply tell it (e.g., "It's a masala dosa, not plain"), and it will recalculate all macros with pinpoint accuracy.

### 📋 AI Diet Plan Generator
- **Comprehensive Personalization**: Automatically reads your physical profile (Weight, Height, Age, Sex, and calculated BMI) to design a perfect calorie and macro target.
- **Custom Preferences**: Fine-tune the generator by choosing your fitness goal (Cut, Bulk, Maintain), strictness level, and diet preferences (Veg, Vegan, Non-Veg, Pescatarian).
- **Special Requirements Input**: A custom text area allows you to specify custom constraints (e.g., "I can eat eggs but no meat", "lactose intolerant", or "no peanuts") which Gemini seamlessly integrates into the recipe choices.
- **Premium UX Animation**: Custom select dropdowns tailored for dark and light modes, combined with a playful animated fork & knife loading micro-animation that dances while your plan generates.


---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES Modules), CSS3
- **Styling**: Tailwind CSS for rapid, responsive UI development.
- **Backend**: Node.js & Express.
- **Database**: Firebase Firestore for real-time sync and persistence.
- **Auth**: Firebase Google Sign-In.
- **AI Engine**: Google Gemini API (2.5 Flash & Vision).
- **Frontend Motion**: Framer Motion (for smooth interactions).
- **Icons**: Remix Icon.

---

## 📱 PWA Support
FitTrack is fully installable on **iOS** and **Android**.
- **Offline Capability**: View your history even without a connection.
- **App-like Experience**: No browser bars, smooth transitions, and a custom gym-themed loading screen.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Account
- Google AI (Gemini) API Key

### Installation
1.  **Clone the Repo**
    ```bash
    git clone https://github.com/Rathimax/gym-progress-tracker.git
    cd gym-tracker-app
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Environment Setup**
    Create a `.env` file in the root:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
This project is licensed under the **ISC License**.

---

Developed with 💪 by [Abhay Raj Rathi](https://github.com/Rathimax)