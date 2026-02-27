// ==========================================
// 1. IMPORTS & FIREBASE CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { initRoutines } from "./routines.js";
import { initGamification } from "./gamification.js";
import * as dietService from "./dietService.js"; // New Diet Service

const firebaseConfig = {
    apiKey: "AIzaSyD0hdb9-NZ3Et3owriYW5d6iEl6JIdqvV4",
    authDomain: "fittrack-app-f45d8.firebaseapp.com",
    projectId: "fittrack-app-f45d8",
    storageBucket: "fittrack-app-f45d8.firebasestorage.app",
    messagingSenderId: "152146874329",
    appId: "1:152146874329:web:1a036664f4f63d064a93c8",
    measurementId: "G-2NT6KDBYBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
// auth.useDeviceLanguage(); // Optional: Localize language

// Expose Diet Service for console testing during development
window.dietService = dietService;
window.db = db;
window.auth = auth;
window.storage = storage;
window.ref = ref;
window.uploadBytes = uploadBytes;
window.getDownloadURL = getDownloadURL;

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 2. DOM ELEMENTS
    // ==========================================
    const elements = {
        navOverlay: document.getElementById('nav-overlay'),
        sidebar: document.getElementById('sidebar'), // Container
        sidebarExercise: document.getElementById('sidebar-exercise'),
        sidebarDiet: document.getElementById('sidebar-diet'),
        navExercise: document.getElementById('nav-exercise'),
        navDiet: document.getElementById('nav-diet'),
        hamburgerBtn: document.getElementById('hamburger-btn'),
        closeNavBtn: document.getElementById('close-nav-btn'),
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view-section'),

        // Forms & Inputs
        form: document.getElementById('workout-form'),
        exerciseSelect: document.getElementById('exercise-select'),
        exerciseText: document.getElementById('exercise-text'),
        toggleInputBtn: document.getElementById('toggle-input-btn'),
        rmDisplay: document.getElementById('rm-display'),
        exercisePreview: document.getElementById('exercise-preview'),
        previewLabel: document.getElementById('preview-label'),

        // Diet Forms
        dietForm: document.getElementById('diet-log-form'),
        dietMealType: document.getElementById('diet-meal-type'),
        dietFoodName: document.getElementById('diet-food-name'),
        dietCalories: document.getElementById('diet-calories'),
        dietProtein: document.getElementById('diet-protein'),
        dietCarbs: document.getElementById('diet-carbs'),
        dietFat: document.getElementById('diet-fat'),
        btnSubmitMeal: document.getElementById('btn-submit-meal'),

        // Diet Dashboard
        dietCaloriesConsumed: document.getElementById('diet-calories-consumed'),
        dietCaloriesGoal: document.getElementById('diet-calories-goal'),
        dietCaloriesRemaining: document.getElementById('diet-calories-remaining'),
        calorieProgressRing: document.getElementById('calorie-progress-ring'),
        dietProteinVal: document.getElementById('diet-protein-val'),
        dietProteinBar: document.getElementById('diet-protein-bar'),
        dietCarbsVal: document.getElementById('diet-carbs-val'),
        dietCarbsBar: document.getElementById('diet-carbs-bar'),
        dietFatVal: document.getElementById('diet-fat-val'),
        dietFatBar: document.getElementById('diet-fat-bar'),
        dietWaterVal: document.getElementById('diet-water-val'),
        dietWaterBar: document.getElementById('diet-water-bar'),
        btnAddWater: document.getElementById('btn-add-water'),

        // AI Food Scan
        scanUploadZone: document.getElementById('ai-scan-upload-zone'),
        scanFileInput: document.getElementById('ai-scan-file-input'),
        scanPreviewImg: document.getElementById('ai-scan-preview-img'),
        btnAnalyzeFood: document.getElementById('btn-analyze-food'),
        scanLoader: document.getElementById('ai-scan-loader'),
        scanResults: document.getElementById('ai-scan-results'),

        // AI Scan Modals 
        scanFoodName: document.getElementById('scan-food-name'),
        scanFoodQty: document.getElementById('scan-food-qty'),
        scanCalories: document.getElementById('scan-calories'),
        scanProtein: document.getElementById('scan-protein'),
        scanCarbs: document.getElementById('scan-carbs'),
        scanFat: document.getElementById('scan-fat'),
        btnCancelScan: document.getElementById('btn-cancel-scan'),
        btnConfirmScan: document.getElementById('btn-confirm-scan'),

        // 1RM Calculator
        calcWeight: document.getElementById('calc-weight'),
        calcReps: document.getElementById('calc-reps'),
        btnCalculate: document.getElementById('btn-calculate-1rm'),
        calcResultsArea: document.getElementById('calc-results-area'),
        calcMaxDisplay: document.getElementById('calc-max-display'),
        percentageList: document.getElementById('percentage-list'),

        // Body Weight
        bwForm: document.getElementById('bw-form'),
        bwInput: document.getElementById('bw-input'),
        bwDate: document.getElementById('bw-date'),
        bwCurrent: document.getElementById('bw-current'),
        bwStart: document.getElementById('bw-start'),
        bwChange: document.getElementById('bw-change'),

        // History & Data
        historyControls: document.getElementById('history-controls'),
        historyList: document.getElementById('history-list'),
        prList: document.getElementById('pr-list'),
        dataStatusWorkouts: document.getElementById('data-status-workouts'),
        dataStatusUser: document.getElementById('data-status-user'),
        exportBtn: document.getElementById('export-btn'),
        importBtn: document.getElementById('import-btn'),
        importInput: document.getElementById('import-input'),
        clearBtn: document.getElementById('clear-btn'),
        logoutBtn: document.getElementById('logout-btn'), // New Logout Button
        themeToggle: document.getElementById('theme-toggle'),
        loader: document.getElementById('loader'),
        notification: document.getElementById('notification'),

        // Analytics
        ctx: document.getElementById('analyticsChart').getContext('2d'),
        chartTabs: document.querySelectorAll('.chart-tab'),
        analyticsExerciseSelect: document.getElementById('analytics-exercise-select'),
        totalWorkouts: document.getElementById('total-workouts'),
        totalVolume: document.getElementById('total-volume'),
        totalTime: document.getElementById('total-time'),
        avgSession: document.getElementById('avg-session'),
        caloriesBurned: document.getElementById('calories-burned'),

        // Timer
        timerWidget: document.getElementById('timer-widget'),
        timerDisplay: document.getElementById('timer-display'),
        timerToggleIcon: document.getElementById('timer-toggle-icon'),
        timerBtns: document.querySelectorAll('.timer-btn[data-time]'),
        timerCancel: document.getElementById('timer-cancel'),

        // Achievements
        achievementsGrid: document.getElementById('achievements-grid-container'),
        achievementsProgress: document.getElementById('achievements-progress'),
        achievementsProgressBar: document.getElementById('achievements-progress-bar'),

        // BMI & Body Fat
        bmiHeight: document.getElementById('bmi-height'),
        bmiHeightFt: document.getElementById('bmi-height-ft'),
        bmiHeightIn: document.getElementById('bmi-height-in'),
        bmiHeightCmWrapper: document.getElementById('bmi-height-cm-wrapper'),
        bmiHeightFtWrapper: document.getElementById('bmi-height-ft-wrapper'),
        bmiUnitRadios: document.querySelectorAll('input[name="bmi-height-unit"]'),
        bmiRefreshBtn: document.getElementById('btn-bmi-refresh'),

        bmiWeight: document.getElementById('bmi-weight'),
        btnCalculateBMI: document.getElementById('btn-calculate-bmi'),
        bmiResultsArea: document.getElementById('bmi-results-area'),
        bmiValue: document.getElementById('bmi-value'),
        bmiCategory: document.getElementById('bmi-category'),

        bfGender: document.getElementById('bf-gender'),
        bfHeight: document.getElementById('bf-height'),
        bfHeightFt: document.getElementById('bf-height-ft'),
        bfHeightIn: document.getElementById('bf-height-in'),
        bfHeightCmWrapper: document.getElementById('bf-height-cm-wrapper'),
        bfHeightFtWrapper: document.getElementById('bf-height-ft-wrapper'),
        bfUnitRadios: document.querySelectorAll('input[name="bf-height-unit"]'),

        bfWaist: document.getElementById('bf-waist'),
        bfNeck: document.getElementById('bf-neck'),
        bfHip: document.getElementById('bf-hip'),
        bfFemaleInputs: document.getElementById('bf-female-inputs'),
        btnCalculateBF: document.getElementById('btn-calculate-bf'),
        bfResultsArea: document.getElementById('bf-results-area'),
        bfValue: document.getElementById('bf-value'),
        bfCategory: document.getElementById('bf-category'),

        // Body Fat Info Modal
        btnBfInfo: document.getElementById('btn-bf-info'),
        modalBfInfo: document.getElementById('modal-bf-info'),
        closeBfInfo: document.getElementById('close-bf-info'),
        btnCloseBfInfoModal: document.getElementById('btn-close-bf-info-modal'),
    };

    // State
    let data = [];
    let bwData = [];
    let prMap = {};
    let prDates = {};
    let currentChartType = 'weight';
    let analyticsChart = null;
    let isCustomInput = false;
    let timerInterval = null;
    let audioContext = null;

    // Global App Mode
    let appMode = 'exercise'; // 'exercise' or 'diet'

    // Preferences State
    let userPreferences = {
        font: 'modern',
        compactMode: false,
        darkMode: false,
        units: 'kg', // 'kg' or 'lbs'
        avatar: null, // DataURL or null
        avatarType: 'image' // 'image' or 'emoji'
    };

    // Helper: Convert Weight
    const formatWeight = (kg) => {
        if (!kg) return 0;
        if (userPreferences.units === 'lbs') {
            return (kg * 2.20462).toFixed(1);
        }
        return parseFloat(kg).toFixed(1); // Ensure consistent decimal
    };

    const getUnitLabel = () => userPreferences.units.toUpperCase();

    const EXERCISE_INTENSITY_FACTORS = {
        // CHEST
        'Bench Press (Barbell)': 4.5, 'Bench Press (Dumbbell)': 4.5, 'Bench Press (Smith Machine)': 4.0,
        'Incline Bench Press (Barbell)': 4.5, 'Incline Bench Press (Dumbbell)': 4.5, 'Incline Bench Press (Smith Machine)': 4.0,
        'Decline Bench Press': 4.0, 'Chest Press (Machine)': 3.5,
        'Push Up': 4.5, 'Weighted Push Up': 5.5,
        'Chest Fly (Dumbbell)': 3.0, 'Chest Fly (Cable)': 3.0, 'Pec Deck / Machine Fly': 3.0,
        'Dips (Chest Focus)': 5.0, 'Pullover (Dumbbell)': 3.5, 'Svend Press': 3.0,
        'Landmine Press': 4.0, 'Floor Press': 4.5,

        // BACK
        'Deadlift (Conventional)': 8.0, 'Deadlift (Sumo)': 8.0, 'Deadlift (Romania)': 6.0,
        'Rack Pull': 7.0,
        'Pull Up': 6.0, 'Weighted Pull Up': 7.5, 'Chin Up': 6.0, 'Weighted Chin Up': 7.5,
        'Lat Pulldown (Wide Grip)': 3.5, 'Lat Pulldown (Close Grip)': 3.5, 'Lat Pulldown (Reverse Grip)': 3.5,
        'Barbell Row': 5.0, 'Pendlay Row': 5.5, 'Dumbbell Row (Single Arm)': 4.0,
        'Seated Cable Row': 3.5, 'T-Bar Row': 5.0, 'Chest Supported Row': 4.0,
        'Face Pull': 3.0, 'Shrugs (Barbell)': 4.0, 'Shrugs (Dumbbell)': 3.5,
        'Back Extension / Hyperextension': 3.0, 'Good Morning': 4.5,

        // SHOULDERS
        'Overhead Press (Barbell)': 5.5, 'Overhead Press (Dumbbell)': 5.0,
        'Seated Shoulder Press (Dumbbell)': 4.5, 'Seated Shoulder Press (Machine)': 4.0,
        'Arnold Press': 5.0, 'Push Press': 6.0,
        'Lateral Raise (Dumbbell)': 2.5, 'Lateral Raise (Cable)': 2.5, 'Lateral Raise (Machine)': 2.5,
        'Front Raise (Dumbbell)': 2.5, 'Front Raise (Cable)': 2.5, 'Front Raise (Plate)': 2.5,
        'Rear Delt Fly (Dumbbell)': 2.5, 'Rear Delt Fly (Machine)': 2.5, 'Rear Delt Fly (Cable)': 2.5,
        'Upright Row': 4.0, 'Egyptian Lateral Raise': 2.5,

        // LEGS (QUADS)
        'Squat (Barbell Back)': 7.5, 'Squat (Barbell Front)': 7.0, 'Squat (Goblet)': 5.5,
        'Leg Press': 5.5, 'Hack Squat': 6.0, 'Leg Extension': 3.5,
        'Lunge (Walking)': 5.0, 'Lunge (Reverse)': 5.0,
        'Split Squat (Bulgarian)': 6.0, 'Split Squat (Static)': 5.0,
        'Step Up': 4.5, 'Sissy Squat': 4.5, 'Pistol Squat': 7.0,

        // LEGS (HAMS & GLUTES)
        'Romanian Deadlift (Barbell)': 6.0, 'Romanian Deadlift (Dumbbell)': 5.5,
        'Leg Curl (Seated)': 3.0, 'Leg Curl (Lying)': 3.0, 'Nordic Hamstring Curl': 5.5,
        'Hip Thrust (Barbell)': 6.0, 'Hip Thrust (Machine)': 5.0, 'Glute Bridge': 4.0,
        'Cable Kickback': 3.0, 'Glute Ham Raise': 5.0,
        'Hip Abduction (Machine)': 3.0, 'Hip Adduction (Machine)': 3.0,

        // CALVES
        'Calf Raise (Standing)': 3.0, 'Calf Raise (Seated)': 2.5,
        'Calf Raise (Leg Press)': 3.0, 'Donkey Calf Raise': 3.0,

        // BICEPS
        'Bicep Curl (Barbell)': 3.0, 'Bicep Curl (Dumbbell)': 3.0, 'Hammer Curl': 3.0,
        'Preacher Curl (Barbell)': 3.0, 'Preacher Curl (Machine)': 3.0,
        'Concentration Curl': 2.5, 'Cable Curl': 3.0, 'Bayesian Curl': 3.0,
        'Spider Curl': 3.0, 'Reverse Curl': 3.0,
        'Zottman Curl': 3.0, 'Incline Dumbbell Curl': 3.0, 'Strict Curl': 3.0,

        // TRICEPS
        'Tricep Pushdown (Rope)': 3.0, 'Tricep Pushdown (Bar)': 3.0,
        'Skull Crushers (Barbell)': 3.5, 'Skull Crushers (Dumbbell)': 3.5,
        'Overhead Tricep Extension (Dumbbell)': 3.5, 'Overhead Tricep Extension (Cable)': 3.5,
        'Close Grip Bench Press': 4.5, 'Dips (Tricep Focus)': 5.0,
        'Kickback (Dumbbell)': 2.5, 'Kickback (Cable)': 2.5, 'JM Press': 4.0,

        // ABS / CORE
        'Plank': 4.0, 'Side Plank': 4.0, 'Crunch': 2.5, 'Sit Up': 3.0,
        'Leg Raise (Hanging)': 4.5, 'Leg Raise (Lying)': 3.5,
        'Captain\'s Chair Leg Raise': 4.0, 'Russian Twist': 3.5,
        'Cable Crunch': 3.5, 'Ab Wheel Rollout': 5.0,
        'Woodchopper': 4.0, 'Vacuum': 2.0, 'L-Sit': 6.0,

        // CARDIO & PLYO
        'Running (Treadmill)': 7.0, 'Running (Outdoor)': 7.5, 'Cycling': 6.0,
        'Rowing Machine': 7.5, 'Jump Rope': 8.0,
        'Box Jump': 7.0, 'Burpees': 9.0, 'Mountain Climbers': 7.0,
        'Jumping Jacks': 6.0, 'Battle Ropes': 8.0,

        // OLYMPIC & FULL BODY
        'Clean and Jerk': 9.0, 'Snatch': 9.5, 'Power Clean': 8.5, 'Hang Clean': 8.0,
        'Thruster': 8.0, 'Kettlebell Swing': 6.0, 'Turkish Get Up': 7.0, 'Farmers Walk': 6.5,

        // OTHER
        'Neck Curl': 2.0, 'Neck Extension': 2.0, 'Wrist Curl': 1.5, 'Wrist Extension': 1.5,
        'default': 3.5
    };

    const MUSCLE_IMAGES = {
        'Chest': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
        'Back': 'https://images.unsplash.com/photo-1603287681836-e566914d0957?auto=format&fit=crop&w=800&q=80',
        'Legs': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
        'Legs - Quads': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
        'Legs - Hams & Glutes': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
        'Calves': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
        'Shoulder': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
        'Bicep': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
        'Tricep': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=800&q=80',
        'Fullbody': 'https://images.unsplash.com/photo-1517963879466-e925ac69aa18?auto=format&fit=crop&w=800&q=80',
        'Olympic & Full Body': 'https://images.unsplash.com/photo-1517963879466-e925ac69aa18?auto=format&fit=crop&w=800&q=80',
        'Cardio & Plyo': 'https://images.unsplash.com/photo-1517963879466-e925ac69aa18?auto=format&fit=crop&w=800&q=80',
        'Abs & Core': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
        'Other': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    };

    const EXERCISE_MUSCLE_MAP = {
        // CHEST
        'Bench Press (Barbell)': ['Chest', 'Tricep', 'Shoulder'],
        'Bench Press (Dumbbell)': ['Chest', 'Tricep', 'Shoulder'],
        'Bench Press (Smith Machine)': ['Chest', 'Tricep', 'Shoulder'],
        'Incline Bench Press (Barbell)': ['Chest', 'Tricep', 'Shoulder'],
        'Incline Bench Press (Dumbbell)': ['Chest', 'Tricep', 'Shoulder'],
        'Incline Bench Press (Smith Machine)': ['Chest', 'Tricep', 'Shoulder'],
        'Decline Bench Press': ['Chest', 'Tricep'],
        'Chest Press (Machine)': ['Chest', 'Tricep'],
        'Push Up': ['Chest', 'Tricep', 'Shoulder'],
        'Weighted Push Up': ['Chest', 'Tricep', 'Shoulder'],
        'Chest Fly (Dumbbell)': ['Chest'],
        'Chest Fly (Cable)': ['Chest'],
        'Pec Deck / Machine Fly': ['Chest'],
        'Dips (Chest Focus)': ['Chest', 'Tricep'],
        'Pullover (Dumbbell)': ['Chest', 'Lats'],
        'Svend Press': ['Chest'],
        'Landmine Press': ['Chest', 'Shoulder'],
        'Floor Press': ['Tricep', 'Chest'],

        // BACK
        'Deadlift (Conventional)': ['LowerBack', 'Hamstrings', 'Glutes', 'Traps', 'Forearms'],
        'Deadlift (Sumo)': ['Glutes', 'Quads', 'LowerBack', 'Forearms'],
        'Deadlift (Romania)': ['Hamstrings', 'Glutes', 'LowerBack'],
        'Rack Pull': ['Traps', 'LowerBack', 'Forearms'],
        'Pull Up': ['Lats', 'Bicep', 'Forearms', 'Traps'],
        'Weighted Pull Up': ['Lats', 'Bicep', 'Forearms'],
        'Chin Up': ['Lats', 'Bicep'],
        'Weighted Chin Up': ['Lats', 'Bicep'],
        'Lat Pulldown (Wide Grip)': ['Lats', 'Bicep'],
        'Lat Pulldown (Close Grip)': ['Lats', 'Bicep'],
        'Lat Pulldown (Reverse Grip)': ['Lats', 'Bicep'],
        'Barbell Row': ['Lats', 'Back', 'Bicep'],
        'Pendlay Row': ['Lats', 'Back', 'Bicep'],
        'Dumbbell Row (Single Arm)': ['Lats', 'Bicep', 'Back'],
        'Seated Cable Row': ['Back', 'Lats', 'Bicep'],
        'T-Bar Row': ['Back', 'Bicep'],
        'Chest Supported Row': ['Back', 'Bicep'],
        'Face Pull': ['Shoulder', 'Traps'],
        'Shrugs (Barbell)': ['Traps', 'Forearms'],
        'Shrugs (Dumbbell)': ['Traps'],
        'Back Extension / Hyperextension': ['LowerBack', 'Glutes'],
        'Good Morning': ['Hamstrings', 'LowerBack'],

        // SHOULDERS
        'Overhead Press (Barbell)': ['Shoulder', 'Tricep', 'Traps'],
        'Overhead Press (Dumbbell)': ['Shoulder', 'Tricep'],
        'Seated Shoulder Press (Dumbbell)': ['Shoulder', 'Tricep'],
        'Seated Shoulder Press (Machine)': ['Shoulder', 'Tricep'],
        'Arnold Press': ['Shoulder', 'Tricep'],
        'Push Press': ['Shoulder', 'Tricep', 'Quads'],
        'Lateral Raise (Dumbbell)': ['Shoulder', 'Traps'],
        'Lateral Raise (Cable)': ['Shoulder'],
        'Lateral Raise (Machine)': ['Shoulder'],
        'Front Raise (Dumbbell)': ['Shoulder'],
        'Front Raise (Cable)': ['Shoulder'],
        'Front Raise (Plate)': ['Shoulder'],
        'Rear Delt Fly (Dumbbell)': ['Shoulder', 'Traps'],
        'Rear Delt Fly (Machine)': ['Shoulder'],
        'Rear Delt Fly (Cable)': ['Shoulder'],
        'Upright Row': ['Shoulder', 'Traps', 'Bicep'],
        'Egyptian Lateral Raise': ['Shoulder'],

        // LEGS (QUADS)
        'Squat (Barbell Back)': ['Quads', 'Glutes', 'LowerBack'],
        'Squat (Barbell Front)': ['Quads', 'Glutes', 'Abs'],
        'Squat (Goblet)': ['Quads', 'Glutes'],
        'Leg Press': ['Quads', 'Glutes'],
        'Hack Squat': ['Quads', 'Glutes'],
        'Leg Extension': ['Quads'],
        'Lunge (Walking)': ['Quads', 'Glutes', 'Hamstrings'],
        'Lunge (Reverse)': ['Quads', 'Glutes'],
        'Split Squat (Bulgarian)': ['Quads', 'Glutes'],
        'Split Squat (Static)': ['Quads', 'Glutes'],
        'Step Up': ['Quads', 'Glutes'],
        'Sissy Squat': ['Quads'],
        'Pistol Squat': ['Quads', 'Glutes'],

        // LEGS (HAMS & GLUTES)
        'Romanian Deadlift (Barbell)': ['Hamstrings', 'Glutes', 'LowerBack'],
        'Romanian Deadlift (Dumbbell)': ['Hamstrings', 'Glutes'],
        'Leg Curl (Seated)': ['Hamstrings'],
        'Leg Curl (Lying)': ['Hamstrings'],
        'Nordic Hamstring Curl': ['Hamstrings'],
        'Hip Thrust (Barbell)': ['Glutes', 'Hamstrings'],
        'Hip Thrust (Machine)': ['Glutes'],
        'Glute Bridge': ['Glutes'],
        'Cable Kickback': ['Glutes'],
        'Glute Ham Raise': ['Hamstrings', 'Glutes'],
        'Hip Abduction (Machine)': ['Glutes'],
        'Hip Adduction (Machine)': ['Groin'], // Groin not in heatmap, probably fine, will ignore

        // CALVES
        'Calf Raise (Standing)': ['Calves'],
        'Calf Raise (Seated)': ['Calves'],
        'Calf Raise (Leg Press)': ['Calves'],
        'Donkey Calf Raise': ['Calves'],

        // BICEPS
        'Bicep Curl (Barbell)': ['Bicep', 'Forearms'],
        'Bicep Curl (Dumbbell)': ['Bicep', 'Forearms'],
        'Hammer Curl': ['Bicep', 'Forearms'],
        'Preacher Curl (Barbell)': ['Bicep'],
        'Preacher Curl (Machine)': ['Bicep'],
        'Concentration Curl': ['Bicep'],
        'Cable Curl': ['Bicep'],
        'Bayesian Curl': ['Bicep'],
        'Spider Curl': ['Bicep'],
        'Reverse Curl': ['Bicep', 'Forearms'],
        'Zottman Curl': ['Bicep', 'Forearms'],
        'Incline Dumbbell Curl': ['Bicep'],
        'Strict Curl': ['Bicep'],

        // TRICEPS
        'Tricep Pushdown (Rope)': ['Tricep'],
        'Tricep Pushdown (Bar)': ['Tricep'],
        'Skull Crushers (Barbell)': ['Tricep'],
        'Skull Crushers (Dumbbell)': ['Tricep'],
        'Overhead Tricep Extension (Dumbbell)': ['Tricep'],
        'Overhead Tricep Extension (Cable)': ['Tricep'],
        'Close Grip Bench Press': ['Tricep', 'Chest'],
        'Dips (Tricep Focus)': ['Tricep', 'Chest'],
        'Kickback (Dumbbell)': ['Tricep'],
        'Kickback (Cable)': ['Tricep'],
        'JM Press': ['Tricep', 'Chest'],

        // ABS / CORE
        'Plank': ['Abs', 'Obliques'],
        'Side Plank': ['Obliques', 'Abs'],
        'Crunch': ['Abs'],
        'Sit Up': ['Abs'],
        'Leg Raise (Hanging)': ['Abs', 'Obliques'],
        'Leg Raise (Lying)': ['Abs'],
        'Captain\'s Chair Leg Raise': ['Abs'],
        'Russian Twist': ['Obliques'],
        'Cable Crunch': ['Abs'],
        'Ab Wheel Rollout': ['Abs', 'Lats'],
        'Woodchopper': ['Obliques', 'Abs'],
        'Vacuum': ['Abs'],
        'L-Sit': ['Abs', 'Quads'],

        // CARDIO & PLYO
        'Running (Treadmill)': ['Quads', 'Calves', 'Glutes'],
        'Running (Outdoor)': ['Quads', 'Calves', 'Glutes'],
        'Cycling': ['Quads', 'Calves'],
        'Rowing Machine': ['Back', 'Quads', 'Bicep', 'Hamstrings'],
        'Jump Rope': ['Calves', 'Shoulder'],
        'Box Jump': ['Quads', 'Glutes', 'Calves'],
        'Burpees': ['Chest', 'Quads', 'Glutes', 'Shoulder'],
        'Mountain Climbers': ['Abs', 'Shoulder'],
        'Jumping Jacks': ['Calves', 'Shoulder'],
        'Battle Ropes': ['Shoulder', 'Bicep', 'Tricep'],

        // OLYMPIC & FULL BODY
        'Clean and Jerk': ['Quads', 'Glutes', 'Shoulder', 'Traps', 'Tricep'],
        'Snatch': ['Quads', 'Glutes', 'Shoulder', 'Traps', 'LowerBack'],
        'Power Clean': ['Quads', 'Glutes', 'Traps', 'LowerBack'],
        'Hang Clean': ['Quads', 'Glutes', 'Traps'],
        'Thruster': ['Quads', 'Glutes', 'Shoulder', 'Tricep'],
        'Kettlebell Swing': ['Hamstrings', 'Glutes', 'LowerBack'],
        'Turkish Get Up': ['Shoulder', 'Abs', 'Glutes', 'Quads'],
        'Farmers Walk': ['Traps', 'Forearms', 'Obliques'],

        // OTHER
        'Neck Curl': ['Traps'],
        'Neck Extension': ['Traps'],
        'Wrist Curl': ['Forearms'],
        'Wrist Extension': ['Forearms']
    };

    // Fallback for unknown exercises: return array
    const getMuscleGroup = (exerciseName) => {
        if (EXERCISE_MUSCLE_MAP[exerciseName]) return EXERCISE_MUSCLE_MAP[exerciseName];
        // Heuristics
        const lower = exerciseName.toLowerCase();
        if (lower.includes('press')) return ['Chest', 'Tricep'];
        if (lower.includes('squat')) return ['Quads', 'Glutes'];
        if (lower.includes('leg')) return ['Quads', 'Hamstrings'];
        if (lower.includes('curl')) return ['Bicep'];
        if (lower.includes('row') || lower.includes('pull')) return ['Lats', 'Back'];
        return [];
    };

    // ==========================================
    // 3. HELPER FUNCTIONS
    // ==========================================
    window.showConfirmDialog = (title, message, onOk) => {
        const overlay = document.getElementById('custom-confirm-overlay');
        if (!overlay) return;
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        const btnOk = document.getElementById('btn-confirm-ok');
        const btnCancel = document.getElementById('btn-confirm-cancel');
        const closeModal = () => overlay.classList.add('hidden');
        btnCancel.onclick = closeModal;
        btnOk.onclick = () => { closeModal(); if (onOk) onOk(); };
        overlay.classList.remove('hidden');
    };
    const showNotification = (msg, type = 'success') => {
        const notif = document.getElementById('notification');
        if (!notif) return;
        notif.textContent = msg;
        notif.className = `notification show ${type}`;
        setTimeout(() => notif.classList.remove('show'), 3000);
    };

    // Equipment Cycling Animation for Custom Loader
    const startLoaderAnimation = () => {
        const equipment = ['dumbbell', 'barbell', 'kettlebell'];
        let currentIndex = 0;

        const cycleEquipment = () => {
            // Remove active class from all equipment
            equipment.forEach(eq => {
                const el = document.querySelector(`.${eq}`);
                if (el) el.classList.remove('active');
            });

            // Add active class to current equipment
            const currentEl = document.querySelector(`.${equipment[currentIndex]}`);
            if (currentEl) currentEl.classList.add('active');

            // Move to next equipment
            currentIndex = (currentIndex + 1) % equipment.length;
        };

        // Start cycling (change every 1.2 seconds)
        cycleEquipment(); // Initial
        const cycleInterval = setInterval(cycleEquipment, 1200);

        return cycleInterval;
    };

    // Start the animation immediately
    let loaderInterval = startLoaderAnimation();

    const hideLoader = () => {
        if (loaderInterval) clearInterval(loaderInterval);
        elements.loader.style.opacity = '0';
        setTimeout(() => elements.loader.style.visibility = 'hidden', 600);
    };

    const playBeep = () => {
        try {
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.type = 'sine'; oscillator.frequency.value = 800; gainNode.gain.value = 0.1;
            oscillator.start(); setTimeout(() => oscillator.stop(), 200);
            setTimeout(() => { const osc2 = audioContext.createOscillator(); const gain2 = audioContext.createGain(); osc2.connect(gain2); gain2.connect(audioContext.destination); osc2.type = 'sine'; osc2.frequency.value = 800; gain2.gain.value = 0.1; osc2.start(); setTimeout(() => osc2.stop(), 200); }, 300);
        } catch (e) { console.warn("Audio blocked"); }
    };

    const triggerConfetti = () => {
        if (typeof confetti !== 'function') return;
        const count = 200; const defaults = { origin: { y: 0.7 } };
        function fire(particleRatio, opts) { confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) }); }
        fire(0.25, { spread: 26, startVelocity: 55 }); fire(0.2, { spread: 60 }); fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 }); fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 }); fire(0.1, { spread: 120, startVelocity: 45 });
    };

    // Helpers moved to end of file to fix scope

    // ==========================================
    // 4. DATABASE FUNCTIONS
    // ==========================================
    const addWorkoutToServer = async (workout) => { const user = auth.currentUser; if (!user) throw new Error("No user"); const docRef = await addDoc(collection(db, "workouts"), { ...workout, userId: user.uid }); return docRef.id; };
    const addBodyWeightToServer = async (entry) => { const user = auth.currentUser; if (!user) throw new Error("No user"); const docRef = await addDoc(collection(db, "bodyweight"), { ...entry, userId: user.uid }); return docRef.id; };
    const loadDataFromServer = async () => {
        const user = auth.currentUser; if (!user) return;
        try { const q = query(collection(db, "workouts"), where("userId", "==", user.uid), orderBy("date")); const s = await getDocs(q); data = []; s.forEach(doc => data.push({ id: doc.id, ...doc.data() })); } catch (e) { if (e.message.includes("indexes")) console.warn("Index Required for Workouts"); }
        try { const q2 = query(collection(db, "bodyweight"), where("userId", "==", user.uid), orderBy("date")); const s2 = await getDocs(q2); bwData = []; s2.forEach(doc => bwData.push({ id: doc.id, ...doc.data() })); } catch (e) { if (e.message.includes("indexes")) console.warn("Index Required for BodyWeight"); }
    };
    const deleteWorkoutFromServer = async (id) => { try { await deleteDoc(doc(db, "workouts", id)); return true; } catch (e) { return false; } };
    const clearAllDataOnServer = async () => { showNotification("Deleting...", "info"); for (const w of data) await deleteDoc(doc(db, "workouts", w.id)); for (const bw of bwData) await deleteDoc(doc(db, "bodyweight", bw.id)); };

    // ==========================================
    // 5. UI & CALCULATIONS
    // ==========================================
    const calculateCalories = (workout) => { const intensity = EXERCISE_INTENSITY_FACTORS[workout.exercise] || EXERCISE_INTENSITY_FACTORS['default']; let duration = (workout.durationMinutes || 0) + ((workout.durationSeconds || 0) / 60); if (duration === 0) duration = (workout.sets || 1) * 1.5; return duration * intensity; };
    const calculatePRs = () => { prMap = {}; prDates = {}; data.forEach(w => { if (w.weight && (!prMap[w.exercise] || w.weight > prMap[w.exercise])) { prMap[w.exercise] = w.weight; prDates[w.exercise] = w.date; } }); };

    const updateAllUI = () => { calculatePRs(); updateDataStatus(); updateStats(); updateBodyWeightStats(); updateHistory(); updatePRSection(); updateAnalyticsDropdown(); updateChart(); updateMuscleHeatmap(); updateWeeklySummary(); populatePRHistoryDropdown(); };


    // ─── Weekly Summary ──────────────────────────────────────────────────────
    const updateWeeklySummary = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        startOfWeek.setHours(0, 0, 0, 0);
        const weekData = data.filter(w => new Date(w.date) >= startOfWeek);
        const workoutCount = new Set(weekData.map(w => w.date?.substring(0, 10))).size;
        const totalVolume = weekData.reduce((sum, w) => sum + ((w.weight || 0) * (w.sets || 1) * (w.reps || 1)), 0);
        const totalTimeMins = weekData.reduce((sum, w) => sum + (w.durationMinutes || 0) + ((w.durationSeconds || 0) / 60), 0);
        const muscleCounts = {};
        weekData.forEach(w => {
            const ex = w.exercise || '';
            const entry = Object.entries(EXERCISE_MUSCLE_MAP || {}).find(([k]) => ex.toLowerCase().includes(k.toLowerCase()));
            const rawMuscle = entry ? entry[1] : null;
            // entry[1] may be a comma-joined string — take only the first muscle
            const muscle = rawMuscle ? String(rawMuscle).split(',')[0].trim() : null;
            if (muscle) muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
        });
        const topMuscle = (Object.entries(muscleCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '--').split(',')[0].trim();
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        el('week-workouts', workoutCount);
        el('week-volume', totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${Math.round(totalVolume)} kg`);
        el('week-time', `${Math.round(totalTimeMins)} min`);
        el('week-muscle', topMuscle);
    };

    // ─── PR History Chart ─────────────────────────────────────────────────────
    let prHistoryChart = null;
    const populatePRHistoryDropdown = () => {
        const sel = document.getElementById('pr-history-exercise');
        if (!sel) return;
        const exercises = [...new Set(data.filter(w => w.weight).map(w => w.exercise))].sort();
        const current = sel.value;
        sel.innerHTML = '<option value="">Select an exercise to see PR history…</option>';
        exercises.forEach(ex => { const opt = document.createElement('option'); opt.value = ex; opt.textContent = ex; sel.appendChild(opt); });

        // Re-apply custom dropdown styling
        if (typeof applyCustomDropdown === 'function') {
            applyCustomDropdown(sel);
        }

        if (current && exercises.includes(current)) { sel.value = current; renderPRHistoryChart(current); }
    };
    const renderPRHistoryChart = (exerciseName) => {
        const canvas = document.getElementById('prHistoryChart');
        const empty = document.getElementById('pr-chart-empty');
        if (!canvas || !exerciseName) return;
        const byDate = {};
        data.filter(w => w.exercise === exerciseName && w.weight)
            .forEach(w => { const d = (w.date || '').substring(0, 10); if (!byDate[d] || w.weight > byDate[d]) byDate[d] = w.weight; });
        const points = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
        if (points.length === 0) {
            canvas.style.display = 'none';
            if (empty) { empty.style.display = ''; empty.textContent = 'No data logged for this exercise yet.'; }
            return;
        }
        canvas.style.display = 'block';
        if (empty) empty.style.display = 'none';
        if (prHistoryChart) prHistoryChart.destroy();
        prHistoryChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: points.map(([d]) => d),
                datasets: [{ label: exerciseName, data: points.map(([, v]) => v), borderColor: '#f7797d', backgroundColor: 'rgba(247,121,125,0.1)', tension: 0.4, pointRadius: 5, pointHoverRadius: 7, fill: true, borderWidth: 2 }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} kg` } } },
                scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } }, y: { beginAtZero: false, ticks: { callback: v => `${v} kg` } } }
            }
        });
    };
    document.getElementById('pr-history-exercise')?.addEventListener('change', e => renderPRHistoryChart(e.target.value));

    const updateMuscleHeatmap = () => {
        // 1. Calculate Volume for Last 7 Days per Muscle Group
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const muscleVolume = {};

        data.forEach(workout => {
            const wDate = new Date(workout.date);
            if (wDate >= oneWeekAgo) {
                const targets = getMuscleGroup(workout.exercise);
                // Handle both single string and array (though we moved to array, legacy check doesn't hurt)
                const list = Array.isArray(targets) ? targets : [targets];

                list.forEach(m => {
                    if (m) muscleVolume[m] = (muscleVolume[m] || 0) + (workout.sets || 1);
                });
            }
        });

        // 2. Render Heatmap (Opacity based on volume)
        // Thresholds: 1-4 sets = Low, 5-9 sets = Med, 10+ sets = High

        document.querySelectorAll('.body-part[data-muscle]').forEach(part => {
            const muscle = part.dataset.muscle;
            const vol = muscleVolume[muscle] || 0;

            // Reset
            part.style.backgroundColor = 'var(--input-bg)';
            part.style.opacity = '1';
            part.style.boxShadow = 'none';

            if (vol > 0) {
                part.style.backgroundColor = 'var(--accent-start)';
                if (vol < 5) {
                    part.style.opacity = '0.5';
                } else if (vol < 10) {
                    part.style.opacity = '0.8';
                } else {
                    part.style.backgroundColor = 'var(--accent-end)';
                    part.style.opacity = '1';
                    part.style.boxShadow = '0 0 10px var(--accent-end)';
                }
            }
        });
    };

    const updateDataStatus = () => {
        const user = auth.currentUser;
        let userDisplay = 'Guest';
        if (user && user.email) {
            const emailParts = user.email.split('@');
            if (emailParts.length === 2) {
                const name = emailParts[0];
                const domain = emailParts[1];
                const maskedName = name.length > 4 ? name.substring(0, 4) + '*'.repeat(name.length - 4) : name;
                userDisplay = `${maskedName}@${domain}`;
            } else {
                userDisplay = user.email;
            }
        }
        if (elements.dataStatusWorkouts) elements.dataStatusWorkouts.textContent = data.length.toString();
        if (elements.dataStatusUser) elements.dataStatusUser.textContent = userDisplay;
    };
    const updateBodyWeightStats = () => {
        if (!bwData.length) {
            elements.bwCurrent.textContent = "--";
            elements.bwStart.textContent = "--";
            elements.bwChange.textContent = "--";
            return;
        }
        const current = bwData[bwData.length - 1].weight;
        const start = bwData[0].weight;
        const diff = (current - start);

        elements.bwCurrent.textContent = `${formatWeight(current)} ${getUnitLabel()}`;
        elements.bwStart.textContent = `${formatWeight(start)} ${getUnitLabel()}`;
        elements.bwChange.textContent = `${diff > 0 ? '+' : ''}${formatWeight(Math.abs(diff))} ${getUnitLabel()}`;
    };
    const updateStats = () => {
        elements.totalWorkouts.textContent = data.length;

        // Volume Calculation needs to account for units if we display it
        // We calculate raw KG volume first
        const rawVolume = data.reduce((s, w) => s + (w.reps * w.sets * w.weight), 0);
        elements.totalVolume.textContent = Math.round(userPreferences.units === 'lbs' ? rawVolume * 2.20462 : rawVolume).toLocaleString();

        const mins = Math.round(data.reduce((s, w) => s + (w.durationMinutes || 0) + (w.durationSeconds || 0) / 60, 0));
        elements.totalTime.textContent = `${mins}m`;
        elements.caloriesBurned.textContent = Math.round(data.reduce((s, w) => s + calculateCalories(w), 0));
    };

    const updateAchievementsUI = () => {
        if (!gamificationModule) return;
        gamificationModule.renderRewards(elements.achievementsGrid);

        const progress = gamificationModule.getProgress();
        if (progress) {
            elements.achievementsProgress.textContent = `${progress.current} / ${progress.total} Unlocked`;
            const pct = Math.round((progress.current / progress.total) * 100);
            elements.achievementsProgressBar.style.width = `${pct}%`;
        }
    };

    const updatePRSection = () => {
        if (Object.keys(prMap).length === 0) { elements.prList.innerHTML = `<div class="empty-state" style="padding:1rem; text-align:center;"><img src="https://cdn-icons-png.flaticon.com/512/7486/7486803.png" style="width:60px; display:block; margin:0 auto 0.5rem; opacity:0.6;"><p style="opacity:0.7;">Log a workout to earn your trophy! <i class="ri-trophy-line"></i></p></div>`; return; }
        elements.prList.innerHTML = Object.entries(prMap).sort(([exA], [exB]) => exA.localeCompare(exB)).map(([ex, wt]) => `<li class="pr-item"><span class="pr-name"><i class="ri-trophy-fill pr-icon"></i>${ex}</span><span class="pr-weight">${formatWeight(wt)} ${getUnitLabel()}</span></li>`).join('');
    };

    // --- HISTORY SECTION (WITH CUSTOM DROPDOWN FIX) ---
    const updateHistory = () => {
        const filter = document.getElementById('history-filter-exercise')?.value || '';
        const filtered = filter ? data.filter(d => d.exercise === filter) : data;

        // 1. Rebuild the Select HTML
        const exercises = [...new Set(data.map(d => d.exercise))].sort();
        elements.historyControls.innerHTML = ` <label for="history-filter-exercise">Filter by Exercise:</label> <select id="history-filter-exercise"> <option value="">All Exercises</option> ${exercises.map(ex => `<option value="${ex}" ${ex === filter ? 'selected' : ''}>${ex}</option>`).join('')} </select>`;

        // 2. APPLY CUSTOM DROPDOWN STYLE IMMEDIATELY
        const historySelect = document.getElementById('history-filter-exercise');
        applyCustomDropdown(historySelect);

        // 3. Re-attach listener to the NATIVE select (which the custom dropdown triggers)
        historySelect.addEventListener('change', updateFilteredHistory);

        if (!filtered.length) { elements.historyList.innerHTML = `<div class="empty-state" style="padding:2rem; text-align:center;"><img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" style="width:80px; display:block; margin:0 auto 1rem; opacity:0.6;"><p style="opacity:0.7;">No workouts yet. Go lift! 💪</p></div>`; return; }

        const grouped = filtered.reduce((acc, d) => { const date = d.date.split('T')[0]; (acc[date] = acc[date] || []).push(d); return acc; }, {});
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        elements.historyList.innerHTML = sortedDates.map(date => ` <div class="history-date"> <h3>${new Date(date).toLocaleDateString()}</h3> <table> <thead><tr><th>Exercise</th><th>Reps</th><th>Sets</th><th>Weight (${getUnitLabel()})</th><th>Time</th><th></th></tr></thead> <tbody> ${grouped[date].map(e => `<tr><td>${e.exercise}</td><td>${e.reps}</td><td>${e.sets}</td><td>${formatWeight(e.weight)} <span class="rm-tag">(1RM: ${formatWeight(calculate1RM(e.weight, e.reps))})</span></td><td>${e.durationMinutes}m</td><td><button class="delete-item-btn" data-id="${e.id}"><i class="ri-delete-bin-line"></i></button></td></tr>`).join('')} </tbody> </table> </div>`).join('');
    };

    const updateFilteredHistory = () => {
        // Just call updateHistory() - it will preserve the filter because it reads the value before rebuilding
        updateHistory();
    };

    // --- ANALYTICS DROPDOWN (WITH FIX) ---
    const updateAnalyticsDropdown = () => {
        const exercises = [...new Set(data.map(d => d.exercise))].sort();
        const sel = elements.analyticsExerciseSelect.value;
        elements.analyticsExerciseSelect.innerHTML = `<option value="All">All Exercises</option>${exercises.map(ex => `<option value="${ex}" ${ex === sel ? 'selected' : ''}>${ex}</option>`).join('')}`;

        // Apply Custom Style
        applyCustomDropdown(elements.analyticsExerciseSelect);
    };

    const updateChart = () => { if (analyticsChart) analyticsChart.destroy(); const sel = elements.analyticsExerciseSelect.value; let config = {}; if (currentChartType === 'bodyweight') { config = { type: 'line', data: { labels: bwData.map(d => d.date), datasets: [{ label: 'Body Weight', data: bwData.map(d => d.weight), borderColor: '#3498db', fill: true }] } }; } else if (currentChartType === 'weight' && sel !== 'All') { const sorted = data.filter(d => d.exercise === sel).sort((a, b) => new Date(a.date) - new Date(b.date)); config = { type: 'line', data: { labels: sorted.map(d => d.date), datasets: [{ label: 'Weight', data: sorted.map(d => d.weight), borderColor: '#10b981' }] } }; } else { config = { type: 'bar', data: { labels: ['No Data'], datasets: [{ label: 'Select Exercise for Progress', data: [] }] } }; } if (config.data && config.data.labels.length) analyticsChart = new Chart(elements.ctx, config); };

    // ==========================================
    // 6. REUSABLE CUSTOM DROPDOWN FUNCTION
    // ==========================================
    const applyCustomDropdown = (selectElement) => {
        if (!selectElement) return;

        // Hide native
        selectElement.classList.add('hidden-native');

        // Remove old wrapper
        let existingWrapper = selectElement.parentNode.querySelector('.custom-select-container');
        if (existingWrapper) existingWrapper.remove();

        // Build Container
        const container = document.createElement('div'); container.className = 'custom-select-container';
        const trigger = document.createElement('div'); trigger.className = 'custom-select-trigger';
        const selected = selectElement.options[selectElement.selectedIndex];
        trigger.textContent = selected ? selected.textContent : 'Select...';

        const optionsDiv = document.createElement('div'); optionsDiv.className = 'custom-options';

        // Search
        if (selectElement.options.length > 5) {
            const sBox = document.createElement('div'); sBox.className = 'dropdown-search-container';
            const sInp = document.createElement('input'); sInp.className = 'dropdown-search-input'; sInp.placeholder = '🔍 Search...';
            sInp.addEventListener('input', e => {
                const v = e.target.value.toLowerCase();
                optionsDiv.querySelectorAll('.custom-option').forEach(o => { if (o.textContent.toLowerCase().includes(v)) o.classList.remove('hidden-option'); else o.classList.add('hidden-option'); });
                optionsDiv.querySelectorAll('.custom-optgroup-wrapper').forEach(g => { let c = 0; g.querySelectorAll('.custom-option').forEach(o => { if (!o.classList.contains('hidden-option')) c++; }); g.querySelector('.custom-optgroup-label').classList.toggle('hidden-option', c === 0); });
            });
            sBox.addEventListener('click', e => e.stopPropagation()); sBox.appendChild(sInp); optionsDiv.appendChild(sBox);
        }

        // Build Items
        Array.from(selectElement.children).forEach(child => {
            if (child.tagName === 'OPTGROUP') {
                const grp = document.createElement('div'); grp.className = 'custom-optgroup-wrapper';
                const lbl = document.createElement('div'); lbl.className = 'custom-optgroup-label'; lbl.textContent = child.label; grp.appendChild(lbl);
                Array.from(child.children).forEach(opt => {
                    const div = document.createElement('div'); div.className = 'custom-option'; div.textContent = opt.textContent;
                    div.addEventListener('click', () => {
                        selectElement.value = opt.value; selectElement.dispatchEvent(new Event('change'));
                        trigger.textContent = opt.textContent; container.classList.remove('open');

                        // Specific Logic for Main Log Form
                        if (selectElement.id === 'exercise-select') {
                            handleAutoFill(opt.value);
                            // Update Image Preview
                            if (elements.exercisePreview && MUSCLE_IMAGES) {
                                const cat = child.label;
                                const img = MUSCLE_IMAGES[cat] || MUSCLE_IMAGES['default'];
                                elements.exercisePreview.style.backgroundImage = `url('${img}')`;
                                elements.previewLabel.textContent = `${cat} - ${opt.textContent}`;
                            }
                        }
                    });
                    grp.appendChild(div);
                });
                optionsDiv.appendChild(grp);
            } else if (child.tagName === 'OPTION') {
                const div = document.createElement('div'); div.className = 'custom-option'; div.textContent = child.textContent;
                div.addEventListener('click', () => {
                    selectElement.value = child.value; selectElement.dispatchEvent(new Event('change'));
                    trigger.textContent = child.textContent; container.classList.remove('open');
                    if (selectElement.id === 'exercise-select') handleAutoFill(child.value);
                });
                optionsDiv.appendChild(div);
            }
        });

        trigger.addEventListener('click', e => { e.stopPropagation(); document.querySelectorAll('.custom-select-container.open').forEach(c => c !== container && c.classList.remove('open')); container.classList.toggle('open'); if (container.classList.contains('open')) { const inp = container.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 100); } });
        document.addEventListener('click', e => { if (!container.contains(e.target)) container.classList.remove('open'); });

        container.appendChild(trigger); container.appendChild(optionsDiv);
        selectElement.parentNode.insertBefore(container, selectElement);
    };

    const handleAutoFill = (exerciseName) => {
        if (!exerciseName) return;
        const h = data.filter(item => item.exercise.toLowerCase() === exerciseName.toLowerCase());
        if (h.length > 0) {
            const l = h[h.length - 1];
            elements.form.reps.value = l.reps;
            elements.form.sets.value = l.sets;
            // Put raw KG in input, user sees KG. 
            // UX Decision: Always input in KG for now to avoid database mess, OR convert?
            // User requested: "switch the entire app to display lbs".
            // Ideally inputs should toggle too. 
            // COMPLEXITY: Converting input values on toggle.
            // SIMPLIFICATION: Input is always treated as raw value. Label changes.
            // If mode is LBS, we should autofill converted value?
            // Let's stick to raw for input to avoid double-conversion bugs for now, 
            // OR simply autofill raw. 
            // Better: Display converted value in placeholder/value if unit is LBS.
            let displayWeight = l.weight;
            if (userPreferences.units === 'lbs') displayWeight = (l.weight * 2.20462).toFixed(1);

            elements.form.weight.value = displayWeight;
            showNotification(`Values loaded.`, "info");
            update1RM();
        } else {
            elements.form.reps.value = '';
            elements.form.sets.value = '';
            elements.form.weight.value = '';
            update1RM();
        }
    };
    const update1RM = () => {
        let w = parseFloat(elements.form.weight.value);
        const r = parseInt(elements.form.reps.value);

        // If in LBS mode, we need to convert INPUT (lbs) back to KG for calculation?
        // Wait, 1RM formula works on any unit. The result will be in the same unit.
        // But if we want to store standard KG, we must convert input back.
        // Let's say we just calculate 1RM in CURRENT unit for display.

        if (w && r) {
            const rm = calculate1RM(w, r);
            elements.rmDisplay.querySelector('span').textContent = rm;
            elements.rmDisplay.classList.remove('hidden');
        } else elements.rmDisplay.classList.add('hidden');
    };
    const startTimer = (seconds) => { clearInterval(timerInterval); elements.timerDisplay.classList.remove('hidden'); elements.timerCancel.classList.remove('hidden'); elements.timerWidget.classList.add('timer-active'); let t = seconds; const tick = () => elements.timerDisplay.textContent = `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`; tick(); timerInterval = setInterval(() => { t--; if (t < 0) { clearInterval(timerInterval); playBeep(); elements.timerWidget.classList.remove('timer-active'); showNotification("Time's up!", "info"); } else tick(); }, 1000); };

    // ==========================================
    // 7. LISTENERS
    // ==========================================
    const setupEventListeners = () => {
        // REMOVED toggleMenu logic as per redesign (no hamburger)
        elements.navItems.forEach(item => item.addEventListener('click', () => {
            elements.views.forEach(v => v.classList.remove('active-view'));
            document.getElementById(item.dataset.target).classList.add('active-view');

            // Sync active state (Sidebar + Bottom Nav)
            const target = item.dataset.target;
            elements.navItems.forEach(n => n.classList.toggle('active', n.dataset.target === target));

            // Show timer only on Home tab
            elements.timerWidget.style.display = target === 'view-home' ? '' : 'none';

            if (item.dataset.target === 'view-settings') setTimeout(updateChart, 100);
            if (item.dataset.target === 'view-achievements') updateAchievementsUI();
        }));

        // Header Profile Click -> Open Settings
        const headerProfile = document.getElementById('header-profile');
        if (headerProfile) {
            headerProfile.addEventListener('click', () => {
                document.querySelector('.nav-item[data-target="view-settings"]').click();
            });
        }

        elements.themeToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('dark-mode', e.target.checked);
            userPreferences.darkMode = e.target.checked;
            savePreferences();
            updateChart();
        });
        elements.timerToggleIcon.addEventListener('click', () => elements.timerWidget.classList.toggle('open')); elements.timerBtns.forEach(btn => btn.addEventListener('click', () => startTimer(parseInt(btn.dataset.time)))); elements.timerCancel.addEventListener('click', () => { clearInterval(timerInterval); elements.timerDisplay.classList.add('hidden'); elements.timerCancel.classList.add('hidden'); elements.timerWidget.classList.remove('timer-active'); });

        // Custom Text Input Toggle
        elements.toggleInputBtn.addEventListener('click', () => {
            isCustomInput = !isCustomInput; elements.toggleInputBtn.classList.toggle('active');
            const customContainer = elements.exerciseSelect.parentNode.querySelector('.custom-select-container');
            if (isCustomInput) {
                if (customContainer) customContainer.style.display = 'none';
                elements.exerciseSelect.removeAttribute('required'); elements.exerciseText.classList.remove('hidden'); elements.exerciseText.setAttribute('required', 'true'); elements.exerciseText.focus();
            } else {
                elements.exerciseText.classList.add('hidden'); elements.exerciseText.removeAttribute('required');
                if (customContainer) customContainer.style.display = 'block';
                elements.exerciseSelect.setAttribute('required', 'true');
            }
        });

        elements.exerciseText.addEventListener('blur', () => handleAutoFill(elements.exerciseText.value));
        elements.exerciseText.addEventListener('blur', () => handleAutoFill(elements.exerciseText.value));
        elements.form.weight.addEventListener('input', update1RM); elements.form.reps.addEventListener('input', update1RM);

        elements.btnCalculate.addEventListener('click', () => {
            const w = parseFloat(elements.calcWeight.value);
            const r = parseInt(elements.calcReps.value);
            if (!w || !r) return showNotification("Enter values", "error");
            const max = calculate1RM(w, r);
            elements.calcMaxDisplay.textContent = `${max} ${getUnitLabel()}`;
            elements.calcResultsArea.classList.remove('hidden');
            elements.percentageList.innerHTML = [95, 90, 85, 80, 75, 70, 65, 60].map(p => `<tr><td>${p}%</td><td>${Math.round(max * (p / 100))} ${getUnitLabel()}</td><td>~${Math.max(1, Math.round(30 * ((max / (max * (p / 100))) - 1)))} reps</td></tr>`).join('');
        });

        // BMI Listener
        if (elements.btnCalculateBMI) {
            // Unit Toggle
            elements.bmiUnitRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'ft') {
                        elements.bmiHeightCmWrapper.classList.add('hidden');
                        elements.bmiHeightFtWrapper.classList.remove('hidden');
                        elements.bmiHeightFtWrapper.style.display = 'grid'; // Ensure grid layout
                    } else {
                        elements.bmiHeightFtWrapper.classList.add('hidden');
                        elements.bmiHeightFtWrapper.style.display = 'none';
                        elements.bmiHeightCmWrapper.classList.remove('hidden');
                    }
                });
            });

            // Refresh
            if (elements.bmiRefreshBtn) {
                elements.bmiRefreshBtn.addEventListener('click', () => {
                    elements.bmiHeight.value = '';
                    elements.bmiHeightFt.value = '';
                    elements.bmiHeightIn.value = '';
                    elements.bmiWeight.value = '';
                    elements.bmiResultsArea.classList.add('hidden');
                    showNotification("BMI Calculator Reset", "info");
                });
            }

            elements.btnCalculateBMI.addEventListener('click', () => {
                let h = 0;
                // Check unit
                const unit = document.querySelector('input[name="bmi-height-unit"]:checked').value;

                if (unit === 'ft') {
                    const ft = parseFloat(elements.bmiHeightFt.value) || 0;
                    const inc = parseFloat(elements.bmiHeightIn.value) || 0;
                    if (!ft && !inc) return showNotification("Enter height", "error");
                    // Convert to CM: (ft * 12 + in) * 2.54
                    h = ((ft * 12) + inc) * 2.54;
                } else {
                    h = parseFloat(elements.bmiHeight.value);
                }

                const w = parseFloat(elements.bmiWeight.value);

                if (!h || !w) return showNotification("Enter height & weight", "error");

                const bmi = calculateBMI(h, w);
                const cat = getBMICategory(bmi);
                elements.bmiValue.textContent = bmi;
                elements.bmiCategory.textContent = cat;
                elements.bmiResultsArea.classList.remove('hidden');
            });
        }

        // Body Fat Listener
        if (elements.bfGender) {
            elements.bfGender.addEventListener('change', (e) => {
                if (e.target.value === 'female') elements.bfFemaleInputs.classList.remove('hidden');
                else elements.bfFemaleInputs.classList.add('hidden');
            });
        }

        // Body Fat Unit Toggle
        if (elements.bfUnitRadios) {
            elements.bfUnitRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.value === 'ft') {
                        elements.bfHeightCmWrapper.classList.add('hidden');
                        elements.bfHeightFtWrapper.classList.remove('hidden');
                    } else {
                        elements.bfHeightFtWrapper.classList.add('hidden');
                        elements.bfHeightCmWrapper.classList.remove('hidden');
                    }
                });
            });
        }

        if (elements.btnCalculateBF) {
            elements.btnCalculateBF.addEventListener('click', () => {
                const gender = elements.bfGender.value;
                let h = 0;

                // Check unit
                const unit = document.querySelector('input[name="bf-height-unit"]:checked').value;

                if (unit === 'ft') {
                    const ft = parseFloat(elements.bfHeightFt.value) || 0;
                    const inc = parseFloat(elements.bfHeightIn.value) || 0;
                    h = ((ft * 12) + inc) * 2.54;
                } else {
                    h = parseFloat(elements.bfHeight.value);
                }

                const w = parseFloat(elements.bfWaist.value);
                const n = parseFloat(elements.bfNeck.value);
                const hip = elements.bfFemaleInputs.classList.contains('hidden') ? 0 : parseFloat(elements.bfHip.value);

                if (!h || !w || !n) return showNotification("Enter all fields", "error");
                if (gender === 'female' && !hip) return showNotification("Enter hip measurement", "error");

                const bf = calculateBodyFat(gender, h, w, n, hip);

                if (!bf || bf <= 0) return showNotification("Invalid inputs", "error");

                elements.bfValue.textContent = bf + "%";
                elements.bfValue.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-end'); // Use CSS variable color if possible, or js reference
                elements.bfCategory.textContent = getBFCategory(gender, bf);
                elements.bfResultsArea.classList.remove('hidden');
            });
        }

        // Body Fat Info Modal Listeners
        if (elements.btnBfInfo) {
            elements.btnBfInfo.addEventListener('click', () => {
                elements.modalBfInfo.classList.remove('hidden');
            });
        }

        if (elements.closeBfInfo) {
            elements.closeBfInfo.addEventListener('click', () => {
                elements.modalBfInfo.classList.add('hidden');
            });
        }

        if (elements.btnCloseBfInfoModal) {
            elements.btnCloseBfInfoModal.addEventListener('click', () => {
                elements.modalBfInfo.classList.add('hidden');
            });
        }

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === elements.modalBfInfo) {
                elements.modalBfInfo.classList.add('hidden');
            }
        });
        elements.historyList.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.delete-item-btn');
            if (deleteBtn) {
                const tempId = deleteBtn.dataset.id;
                window.showConfirmDialog("Delete Workout?", "Are you sure you want to delete this workout?", async () => {
                    if (await deleteWorkoutFromServer(tempId)) {
                        data = data.filter(i => i.id !== tempId);
                        updateAllUI();
                        showNotification("Deleted.");
                    }
                });
            }
        });
        elements.bwForm.addEventListener('submit', async (e) => { e.preventDefault(); const w = parseFloat(elements.bwInput.value); if (w) { const id = await addBodyWeightToServer({ weight: w, date: elements.bwDate.value }); bwData.push({ id, weight: w, date: elements.bwDate.value }); bwData.sort((a, b) => new Date(a.date) - new Date(b.date)); updateAllUI(); showNotification("Logged."); } });
        elements.exportBtn.addEventListener('click', () => {
            if (!data.length) return showNotification("No data to export.", "error");
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const accent = [247, 121, 125];

            // ── Header ──
            doc.setFillColor(...accent);
            doc.rect(0, 0, 210, 28, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18); doc.setTextColor(255, 255, 255);
            doc.text('FitTrack Workout Report', 14, 12);
            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 21);

            let y = 38;

            // ── Quick Stats ──
            doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(72, 75, 106);
            doc.text('Summary', 14, y); y += 6;
            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 120);
            const totalVol = data.reduce((s, w) => s + ((w.weight || 0) * (w.sets || 1) * (w.reps || 1)), 0);
            doc.text(`Total Workouts: ${data.length}`, 14, y);
            doc.text(`Total Volume: ${totalVol >= 1000 ? (totalVol / 1000).toFixed(1) + 't' : Math.round(totalVol) + ' kg'}`, 90, y);
            y += 10;

            // ── Workout History Table ──
            doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(72, 75, 106);
            doc.text('Workout History', 14, y); y += 4;
            doc.autoTable({
                startY: y,
                head: [['Date', 'Exercise', 'Reps', 'Sets', 'Weight']],
                body: [...data].reverse().map(w => [
                    w.date ? new Date(w.date).toLocaleDateString('en-GB') : '--',
                    w.exercise || '--',
                    w.reps || '--',
                    w.sets || '--',
                    w.weight ? `${w.weight} kg` : '--'
                ]),
                headStyles: { fillColor: accent, textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [250, 248, 255] },
                styles: { fontSize: 8, cellPadding: 3 },
                margin: { left: 14, right: 14 },
            });

            // ── PR List ──
            y = doc.lastAutoTable.finalY + 10;
            if (Object.keys(prMap).length > 0) {
                doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(72, 75, 106);
                doc.text('Personal Records', 14, y); y += 4;
                doc.autoTable({
                    startY: y,
                    head: [['Exercise', 'Best Weight']],
                    body: Object.entries(prMap).sort(([a], [b]) => a.localeCompare(b)).map(([ex, wt]) => [ex, `${wt} kg`]),
                    headStyles: { fillColor: accent, textColor: 255, fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [250, 248, 255] },
                    styles: { fontSize: 8, cellPadding: 3 },
                    margin: { left: 14, right: 14 },
                });
            }

            doc.save('fittrack-report.pdf');
            showNotification('PDF exported! 📄');
        });
        elements.importInput.addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = async (ev) => { try { const i = JSON.parse(ev.target.result); if (i.workouts) for (const w of i.workouts) await addWorkoutToServer(w); if (i.bodyweight) for (const b of i.bodyweight) await addBodyWeightToServer(b); await loadDataFromServer(); updateAllUI(); showNotification("Imported!"); } catch (err) { showNotification("Import failed", "error"); } }; r.readAsText(f); });
        elements.importBtn.addEventListener('click', () => elements.importInput.click());
        elements.clearBtn.addEventListener('click', async () => {
            window.showConfirmDialog("Clear All Data?", "This will permanently delete all your workouts and body weight data.", async () => {
                await clearAllDataOnServer();
                data = [];
                bwData = [];
                updateAllUI();
            });
        });

        // ==========================================
        // DIET: LOG MEAL SUBMIT
        // ==========================================
        if (elements.dietForm) {
            elements.dietForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const user = auth.currentUser;
                if (!user) {
                    return showNotification("Please log in to log a meal.", "error");
                }

                const mealData = {
                    mealType: elements.dietMealType.value,
                    foodName: elements.dietFoodName.value.trim(),
                    calories: parseFloat(elements.dietCalories.value) || 0,
                    protein: parseFloat(elements.dietProtein.value) || 0,
                    carbs: parseFloat(elements.dietCarbs.value) || 0,
                    fat: parseFloat(elements.dietFat.value) || 0
                };

                const originalBtnText = elements.btnSubmitMeal.innerHTML;
                elements.btnSubmitMeal.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Logging...';
                elements.btnSubmitMeal.disabled = true;

                try {
                    // Force strictly YYYY-MM-DD
                    const today = new Date().toISOString().split('T')[0];
                    const result = await dietService.addMeal(db, user.uid, today, mealData);

                    if (result.success) {
                        showNotification(`Logged ${mealData.calories} kcal for ${mealData.mealType}! 🍎`);
                        elements.dietForm.reset();
                        elements.dietMealType.value = "Breakfast"; // Reset selected opt
                        if (typeof applyCustomDropdown === 'function') applyCustomDropdown(elements.dietMealType);
                    } else {
                        throw new Error(result.error);
                    }
                } catch (err) {
                    console.error("Meal Log Error:", err);
                    showNotification("Failed to log meal.", "error");
                } finally {
                    elements.btnSubmitMeal.innerHTML = originalBtnText;
                    elements.btnSubmitMeal.disabled = false;
                }
            });
        }

        // ==========================================
        // DIET: DASHBOARD OBSERVERS & RENDER
        // ==========================================
        let unsubscribeMeals = null;
        let unsubscribeWater = null;

        window.updateDietDashboard = () => {
            const user = auth.currentUser;
            if (!user || appMode !== 'diet') return;

            if (unsubscribeMeals) unsubscribeMeals();
            if (unsubscribeWater) unsubscribeWater();

            const today = new Date().toISOString().split('T')[0];

            unsubscribeMeals = dietService.observeMealsByDate(db, user.uid, today, (result) => {
                if (result.success) {
                    renderDietMacros(result.meals);
                }
            });

            unsubscribeWater = dietService.observeWaterByDate(db, user.uid, today, (result) => {
                if (result.success) {
                    renderDietWater(result.totalMl);
                }
            });
        };

        const renderDietMacros = (meals) => {
            let totalCals = 0; let totalProtein = 0; let totalCarbs = 0; let totalFat = 0;
            meals.forEach(m => {
                totalCals += (m.calories || 0); totalProtein += (m.protein || 0);
                totalCarbs += (m.carbs || 0); totalFat += (m.fat || 0);
            });

            const goal = 2000;
            const remaining = Math.max(0, goal - totalCals);

            if (elements.dietCaloriesConsumed) elements.dietCaloriesConsumed.textContent = Math.round(totalCals);
            if (elements.dietCaloriesGoal) elements.dietCaloriesGoal.textContent = goal;
            if (elements.dietCaloriesRemaining) elements.dietCaloriesRemaining.textContent = Math.round(remaining);

            // Circular Ring (circumference = 283)
            const circleLength = 283;
            const pctCals = Math.min(100, (totalCals / goal) * 100);
            if (elements.calorieProgressRing) {
                elements.calorieProgressRing.style.strokeDashoffset = circleLength - (circleLength * pctCals / 100);
            }

            // Approximate macro goals for 2000 cal: 150g Protein, 200g Carbs, 65g Fat
            const pGoal = 150; const cGoal = 200; const fGoal = 67;

            if (elements.dietProteinVal) elements.dietProteinVal.textContent = Math.round(totalProtein) + 'g';
            if (elements.dietProteinBar) elements.dietProteinBar.style.width = Math.min(100, (totalProtein / pGoal) * 100) + '%';
            if (elements.dietCarbsVal) elements.dietCarbsVal.textContent = Math.round(totalCarbs) + 'g';
            if (elements.dietCarbsBar) elements.dietCarbsBar.style.width = Math.min(100, (totalCarbs / cGoal) * 100) + '%';
            if (elements.dietFatVal) elements.dietFatVal.textContent = Math.round(totalFat) + 'g';
            if (elements.dietFatBar) elements.dietFatBar.style.width = Math.min(100, (totalFat / fGoal) * 100) + '%';
        };

        const renderDietWater = (totalMl) => {
            const waterGoal = 2500;
            if (elements.dietWaterVal) elements.dietWaterVal.textContent = `${totalMl} / ${waterGoal} ml`;
            const pct = Math.min(100, (totalMl / waterGoal) * 100);
            if (elements.dietWaterBar) elements.dietWaterBar.style.width = `${pct}%`;
        };

        if (elements.btnAddWater) {
            elements.btnAddWater.addEventListener('click', async () => {
                const user = auth.currentUser;
                if (!user) return showNotification("Please log in.", "error");

                elements.btnAddWater.disabled = true;
                elements.btnAddWater.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';

                const today = new Date().toISOString().split('T')[0];
                const result = await dietService.addWater(db, user.uid, today, 250);

                if (result.success) {
                    showNotification("Added 250ml water! 💧");
                } else {
                    showNotification("Failed to add water.", "error");
                }
                elements.btnAddWater.innerHTML = '<i class="ri-drop-fill"></i> +250 ml';
                elements.btnAddWater.disabled = false;
            });
        }

        // MAIN SUBMIT
        elements.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let ex = isCustomInput ? elements.exerciseText.value.trim() : elements.exerciseSelect.value;
            if (isCustomInput && ex) ex = ex.charAt(0).toUpperCase() + ex.slice(1);
            if (!ex) return showNotification("Select exercise.", "error");

            // CONVERT INPUT WEIGHT TO KG IF IN LBS MODE
            let inputWeight = parseFloat(elements.form.weight.value);
            if (userPreferences.units === 'lbs') {
                inputWeight = inputWeight / 2.20462;
            }

            const nw = {
                exercise: ex,
                reps: parseInt(elements.form.reps.value),
                sets: parseInt(elements.form.sets.value),
                weight: parseFloat(inputWeight.toFixed(2)), // Store in KG
                durationMinutes: parseInt(elements.form['duration-minutes'].value) || 0,
                durationSeconds: parseInt(elements.form['duration-seconds'].value) || 0,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            const curMax = data.filter(d => d.exercise === ex).reduce((m, c) => Math.max(m, c.weight), 0);
            const isPR = nw.weight > curMax;
            try {
                const id = await addWorkoutToServer(nw); data.push({ ...nw, id }); updateAllUI();

                // Check Routine Progress
                if (routinesModule && routinesModule.checkProgress(ex)) {
                    triggerConfetti();
                    showNotification("Routine Complete!", "success");
                    if (gamificationModule) gamificationModule.unlock('routine_complete');
                }

                // Check Milestones
                if (gamificationModule) {
                    gamificationModule.checkMilestones(data, nw);
                }

                if (isPR) {
                    triggerConfetti();
                    playBeep();
                    showNotification(`🏆 NEW PR: ${formatWeight(nw.weight)} ${getUnitLabel()}!`, "success");
                } else {
                    showNotification("Added!", "info");
                }

                elements.form.reps.value = '';
                elements.form.sets.value = '';
                elements.form.weight.value = '';
                update1RM();
                if (!isCustomInput) { const trigger = document.querySelector('.custom-select-trigger'); if (trigger) trigger.textContent = 'Select an exercise'; }
            } catch (e) { }
        });

        elements.chartTabs.forEach(t => t.addEventListener('click', () => {
            document.querySelector('.chart-tab.active')?.classList.remove('active');
            t.classList.add('active');

            const type = t.dataset.chart;
            const medalsDiv = document.getElementById('medals-display');
            const chartsDiv = document.querySelector('.chart-container');

            if (type === 'awards') {
                chartsDiv.classList.add('hidden');
                medalsDiv.classList.remove('hidden');
                if (gamificationModule) gamificationModule.renderRewards(medalsDiv);
            } else {
                medalsDiv.classList.add('hidden');
                chartsDiv.classList.remove('hidden');
                currentChartType = type;
                updateChart();
            }
        }));
        elements.analyticsExerciseSelect.addEventListener('change', updateChart);
        elements.bwDate.value = new Date().toISOString().split('T')[0];
    };

    // ==========================================
    // THEME CUSTOMIZATION
    // ==========================================
    const THEMES = [
        { name: 'Megatron', start: '#c6ffdd', middle: '#fbd786', end: '#f7797d', text: '#1e293b' },
        { name: 'Moonlit Astroid', start: '#0f2027', middle: '#203a43', end: '#2c5364', text: '#ffffff' },
        { name: 'Cool Sky', start: '#2980b9', end: '#6dd5fa', text: '#ffffff' },
        { name: 'Ultra Violet', start: '#654ea3', end: '#eaafc8', text: '#ffffff' },
        { name: 'Burning Orange', start: '#ff416c', end: '#ff4b2b', text: '#ffffff' },
        { name: 'Coal', start: '#eb5757', end: '#000000', text: '#ffffff' },
        { name: 'Pidget', start: '#ee9ca7', end: '#ffdde1', text: '#1e293b' },
        { name: 'Snowflake', start: '#b5c6e0', end: '#ebf4f5', text: '#1e293b' }
    ];

    const initThemes = () => {
        const grid = document.getElementById('theme-grid');
        if (!grid) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            const theme = JSON.parse(savedTheme);
            applyTheme(theme, false); // Don't save again, just apply
        }

        grid.innerHTML = THEMES.map((theme, index) => {
            const gradient = theme.middle
                ? `linear-gradient(135deg, ${theme.start}, ${theme.middle}, ${theme.end})`
                : `linear-gradient(135deg, ${theme.start}, ${theme.end})`;

            return `
                <div class="theme-option" data-index="${index}">
                    <div class="theme-preview" style="background: ${gradient};"></div>
                    <div class="theme-name">${theme.name}</div>
                </div>
            `;
        }).join('');

        // Listeners
        grid.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const idx = opt.dataset.index;
                const theme = THEMES[idx];
                applyTheme(theme, true);

                // Update active state
                grid.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
    };

    const applyTheme = (theme, save = true) => {
        const root = document.documentElement;

        // Construct gradient string
        const gradient = theme.middle
            ? `linear-gradient(135deg, ${theme.start}, ${theme.middle}, ${theme.end})`
            : `linear-gradient(135deg, ${theme.start}, ${theme.end})`;

        // Set Variables
        root.style.setProperty('--accent-start', theme.start);
        root.style.setProperty('--accent-end', theme.end);
        root.style.setProperty('--accent-gradient', gradient);
        root.style.setProperty('--accent-text', theme.text || '#ffffff');

        // Update Ambient Background (Opacity variations)
        document.body.style.backgroundImage = `
            radial-gradient(circle at 0% 0%, ${hexToRgba(theme.start, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, ${hexToRgba(theme.end, 0.15)} 0%, transparent 50%)
        `;

        // Update Mobile Status Bar (meta theme-color)
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", theme.start);
        }

        if (save) {
            localStorage.setItem('appTheme', JSON.stringify(theme));
            showNotification(`Theme set to ${theme.name}`, 'success');
        }
        // LOGOUT BTN LISTENER
        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', handleLogout);
        }
    };

    // Preferences Logic ==============================
    const initPreferences = () => {
        const saved = localStorage.getItem('appPreferences');
        if (saved) userPreferences = { ...userPreferences, ...JSON.parse(saved) };

        // Apply Font
        applyFont(userPreferences.font || 'modern');
        // Apply Compact Mode
        applyCompactMode(userPreferences.compactMode || false);
        // Apply Dark Mode
        if (userPreferences.darkMode) {
            document.body.classList.add('dark-mode');
            if (elements.themeToggle) elements.themeToggle.checked = true;
        }
        // Apply Units
        applyUnits(userPreferences.units || 'kg');
        // Apply Avatar
        applyAvatar(userPreferences.avatar, userPreferences.avatarType);

        setupPreferenceListeners();
    };

    const setupPreferenceListeners = () => {
        // Font
        document.querySelectorAll('.segment-btn[data-font]').forEach(btn => {
            btn.addEventListener('click', () => {
                const font = btn.dataset.font;
                userPreferences.font = font;
                applyFont(font);
                savePreferences();
            });
        });

        // Compact Mode
        const compactToggle = document.getElementById('compact-toggle');
        if (compactToggle) {
            compactToggle.checked = userPreferences.compactMode;
            compactToggle.addEventListener('change', (e) => {
                userPreferences.compactMode = e.target.checked;
                applyCompactMode(e.target.checked);
                savePreferences();
            });
        }

        // Units
        const unitToggle = document.getElementById('unit-toggle');
        if (unitToggle) {
            unitToggle.checked = userPreferences.units === 'lbs';
            unitToggle.addEventListener('change', (e) => {
                userPreferences.units = e.target.checked ? 'lbs' : 'kg';
                applyUnits(userPreferences.units);
                savePreferences();
            });
        }

        // Avatar Upload
        const fileInput = document.getElementById('avatar-upload');
        const uploadBtn = document.getElementById('btn-upload-avatar');
        const emojiBtn = document.getElementById('btn-emoji-avatar');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        userPreferences.avatar = ev.target.result;
                        userPreferences.avatarType = 'image';
                        applyAvatar(userPreferences.avatar, 'image');
                        savePreferences();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                const emoji = prompt("Enter an emoji for your avatar:", "🦁");
                if (emoji) {
                    userPreferences.avatar = emoji;
                    userPreferences.avatarType = 'emoji';
                    applyAvatar(emoji, 'emoji');
                    savePreferences();
                }
            });
        }
    };

    const applyFont = (font) => {
        document.body.classList.remove('font-modern', 'font-tech', 'font-classic');
        document.body.classList.add(`font-${font}`);

        // Update UI state
        document.querySelectorAll('.segment-btn[data-font]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === font);
        });
    };

    const applyCompactMode = (isCompact) => {
        document.body.classList.toggle('mode-compact', isCompact);
    };

    const applyUnits = (unit) => {
        const isLbs = unit === 'lbs';
        document.getElementById('unit-label-kg')?.classList.toggle('active', !isLbs);
        document.getElementById('unit-label-lbs')?.classList.toggle('active', isLbs);

        // Update labels throughout app
        const inputs = document.querySelectorAll('label[for="weight"]');
        inputs.forEach(l => l.innerHTML = `Weight (${unit}):`);
        const inputs2 = document.querySelectorAll('input[id*="weight"]');
        inputs2.forEach(i => i.placeholder = unit === 'lbs' ? 'Weight (lbs)' : 'Weight (kg)');

        // Refresh UI
        updateAllUI();
    };

    const applyAvatar = (content, type) => {
        if (!content) return;

        const headerAvatar = document.querySelector('.header-right .header-avatar');
        const headerProfileDiv = document.querySelector('.header-right .profile-pic');
        const preview = document.getElementById('avatar-preview-settings');

        if (type === 'image') {
            if (headerAvatar) {
                headerAvatar.src = content;
                headerAvatar.style.display = 'block';
            }
            if (headerProfileDiv) {
                headerProfileDiv.innerHTML = `<img class="header-avatar" src="${content}" style="width:100%; height:100%; object-fit:cover;">`;
            }

            if (preview) preview.src = content;
        } else {
            const emojiHTML = `<div style="font-size: 1.5rem; display:flex; justify-content:center; align-items:center; height:100%;">${content}</div>`;
            if (headerProfileDiv) {
                headerProfileDiv.innerHTML = emojiHTML;
            }
            if (preview) { preview.style.display = 'none'; preview.parentNode.insertAdjacentHTML('afterbegin', `<div id="emoji-preview" style="font-size: 2.5rem;">${content}</div>`); }
        }
    };

    const savePreferences = () => {
        localStorage.setItem('appPreferences', JSON.stringify(userPreferences));
    };


    // Helper to convert hex to rgba for the background glow
    const hexToRgba = (hex, alpha) => {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex; // Fallback
    };

    let routinesModule = null;
    let gamificationModule = null;

    // ==========================================
    // DIET MODE: AI FOOD SCANNER LOGIC
    // ==========================================
    const initAIFoodScanner = () => {
        let selectedFile = null;

        // Trigger file input click when zone clicked
        elements.scanUploadZone.addEventListener('click', (e) => {
            if (e.target !== elements.scanFileInput) {
                elements.scanFileInput.click();
            }
        });

        // Handle File Selection & Render Preview
        elements.scanFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate Size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size must be under 5MB.', 'error');
                return;
            }

            selectedFile = file;

            // Hide the upload text + icon, show the preview image
            const contentDiv = elements.scanUploadZone.querySelector('.upload-content');
            contentDiv.style.display = 'none';
            elements.scanPreviewImg.src = URL.createObjectURL(file);
            elements.scanPreviewImg.classList.remove('hidden');

            // Reset States
            elements.scanResults.classList.add('hidden');
            elements.btnAnalyzeFood.style.display = 'block';
            elements.btnAnalyzeFood.disabled = false;
        });

        // Handle Form Submission -> Firebase Storage -> Express API
        elements.btnAnalyzeFood.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                showNotification('Please sign in to analyze food.', 'error');
                return;
            }
            if (!selectedFile) return;

            try {
                // UI Toggle
                elements.btnAnalyzeFood.disabled = true;
                elements.btnAnalyzeFood.style.display = 'none';
                elements.scanLoader.classList.remove('hidden');

                // 1. Compress + Encode Image Client-Side (keeps payload under Vercel's 4.5MB body limit)
                const compressImage = (file) => new Promise((resolve, reject) => {
                    const img = new Image();
                    const objectUrl = URL.createObjectURL(file);
                    img.onload = () => {
                        const MAX_DIM = 800;
                        let { width, height } = img;
                        if (width > MAX_DIM || height > MAX_DIM) {
                            if (width > height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
                            else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                        URL.revokeObjectURL(objectUrl);
                        // Export as JPEG at 70% quality (~300–600KB for typical food photos)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
                    };
                    img.onerror = reject;
                    img.src = objectUrl;
                });

                const { base64: base64Data, mimeType: compressedMimeType } = await compressImage(selectedFile);

                // 2. Transmit compressed base64 to Vercel serverless endpoint
                const aiResponse = await fetch('/api/analyze-food', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageBase64: base64Data,
                        mimeType: compressedMimeType,
                        uid: user.uid
                    })
                });


                if (!aiResponse.ok) {
                    throw new Error('AI Engine failed to parse image. Please try another clearer image.');
                }

                const payload = await aiResponse.json();
                if (!payload.success || !payload.data) throw new Error('Invalid JSON Payload Returned.');

                const aiData = payload.data; // { food, estimatedQuantity, calories, protein, carbs, fat }

                // 3. Map Data to Editable Macro Fields
                elements.scanFoodName.value = aiData.food || '';
                elements.scanFoodQty.value = aiData.estimatedQuantity || '';
                elements.scanCalories.value = aiData.calories || 0;
                elements.scanProtein.value = aiData.protein || 0;
                elements.scanCarbs.value = aiData.carbs || 0;
                elements.scanFat.value = aiData.fat || 0;

                // Toggle Views
                elements.scanLoader.classList.add('hidden');
                elements.scanResults.classList.remove('hidden');

            } catch (e) {
                console.error(e);
                showNotification(e.message || 'Error communicating with AI engine.', 'error');

                // Reset View
                elements.scanLoader.classList.add('hidden');
                elements.btnAnalyzeFood.disabled = false;
                elements.btnAnalyzeFood.style.display = 'block';
            }
        });

        // Confirmation Actions
        elements.btnCancelScan.addEventListener('click', () => {
            // Reset state
            selectedFile = null;
            elements.scanFileInput.value = '';
            elements.scanResults.classList.add('hidden');
            elements.scanPreviewImg.classList.add('hidden');
            elements.scanPreviewImg.src = '';

            elements.scanUploadZone.querySelector('.upload-content').style.display = 'block';
            elements.btnAnalyzeFood.style.display = 'none';
        });

        elements.btnConfirmScan.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) return;

            // Validate Numerics
            const cals = parseInt(elements.scanCalories.value);
            const pro = parseFloat(elements.scanProtein.value);
            const carb = parseFloat(elements.scanCarbs.value);
            const fat = parseFloat(elements.scanFat.value);
            const fName = elements.scanFoodName.value.trim();

            if (!fName || isNaN(cals)) {
                showNotification('Food name and valid calories are required.', 'error');
                return;
            }

            try {
                // Formatting Date
                const dateObj = new Date();
                const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                const safeFoodName = elements.scanFoodQty.value.trim()
                    ? `${fName} (${elements.scanFoodQty.value.trim()})`
                    : fName;

                const payloadObj = {
                    foodName: safeFoodName,
                    calories: cals,
                    protein: isNaN(pro) ? 0 : pro,
                    carbs: isNaN(carb) ? 0 : carb,
                    fat: isNaN(fat) ? 0 : fat,
                    mealType: 'Snack' // Defaulting to Snack for AI scans since you can't infer intent directly
                };

                await dietService.addMeal(db, user.uid, today, payloadObj);
                showNotification(`Added ${safeFoodName} via AI successfully!`, 'success');

                // Clean Up Form
                elements.btnCancelScan.click();

                // Auto-redirect user to Diet Dashboard
                document.querySelector('.nav-item[data-target="view-diet-dashboard"]').click();

            } catch (err) {
                console.error('Save AI Meal error:', err);
                showNotification('Failed to save AI meal reading.', 'error');
            }
        });
    };

    // ==========================================
    // 8. DIET HISTORY & ANALYTICS INIT
    // ==========================================
    let historyWeeklyCalsChart = null;
    let historyWeeklyProteinChart = null;

    const renderDietDailyHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const date = document.getElementById('diet-history-date').value;
        const result = await dietService.getMealsByDate(db, user.uid, date);
        const waterResult = await dietService.getWaterByDate(db, user.uid, date);

        if (result.success) {
            let tCals = 0, tPro = 0, tCarb = 0, tFat = 0;
            const mealList = document.getElementById('history-meal-list');
            mealList.innerHTML = '';

            result.meals.forEach(m => {
                tCals += (m.calories || 0); tPro += (m.protein || 0); tCarb += (m.carbs || 0); tFat += (m.fat || 0);
                const li = document.createElement('div');
                li.className = 'history-meal-item';
                li.innerHTML = `
                    <div class="meal-info">
                        <strong>${m.foodName}</strong>
                        <span class="meal-type-badge">${m.mealType}</span>
                    </div>
                    <div class="meal-macros">
                        <span>${m.calories || 0} kcal</span>
                        <button class="btn-delete-meal" data-id="${m.id}" title="Delete Meal"><i class="ri-delete-bin-line"></i></button>
                    </div>
                `;
                mealList.appendChild(li);
            });

            document.getElementById('history-daily-cals').textContent = Math.round(tCals);
            document.getElementById('history-daily-protein').textContent = Math.round(tPro) + 'g';
            document.getElementById('history-daily-carbs').textContent = Math.round(tCarb) + 'g';
            document.getElementById('history-daily-fat').textContent = Math.round(tFat) + 'g';

            const wGoal = 2500; // Assuming a default water goal for display
            const tWater = waterResult.success ? waterResult.totalMl : 0;
            document.getElementById('history-daily-water').textContent = `${tWater}/${wGoal}ml`;

            // Bind Delete events
            mealList.querySelectorAll('.btn-delete-meal').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm("Delete this meal?")) {
                        await dietService.deleteMeal(db, user.uid, date, id);
                        renderDietDailyHistory(); // re-render
                        showNotification("Meal deleted.", "info");
                    }
                });
            });

        } else {
            console.error("Error loading daily history", result.error);
            document.getElementById('history-meal-list').innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No meals logged on this date.</div>`;
            document.getElementById('history-daily-cals').textContent = 0;
            document.getElementById('history-daily-protein').textContent = '0g';
            document.getElementById('history-daily-carbs').textContent = '0g';
            document.getElementById('history-daily-fat').textContent = '0g';
            document.getElementById('history-daily-water').textContent = '0ml';
        }
    };

    const renderDietWeeklyHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const insightsBanner = document.getElementById('diet-weekly-insights');
        insightsBanner.innerHTML = `<i class="ri-loader-4-line spin" style="margin-right:0.5rem;"></i> Loading analytics...`;

        try {
            const res = await dietService.getWeeklyDietData(db, user.uid);
            if (!res.success) throw new Error(res.error);

            const dataArr = res.data; // Array of 7 days, older to newer

            let sumCals = 0, sumPro = 0;
            let highestPro = -1, highestProDay = "-";
            let lowestCal = 99999, lowestCalDay = "-";

            const labels = [];
            const calsData = [];
            const proData = [];

            dataArr.forEach(d => {
                const dayStr = d.date.substring(5); // MM-DD
                labels.push(dayStr);
                calsData.push(d.calories);
                proData.push(d.protein);

                sumCals += d.calories;
                sumPro += d.protein;

                if (d.protein > highestPro) { highestPro = d.protein; highestProDay = dayStr; }
                if (d.calories > 0 && d.calories < lowestCal) { lowestCal = d.calories; lowestCalDay = dayStr; }
            });

            if (lowestCal === 99999) lowestCalDay = "N/A"; // No data

            const avgCals = Math.round(sumCals / 7);
            const avgPro = Math.round(sumPro / 7);

            document.getElementById('history-weekly-avg-cals').textContent = avgCals;
            document.getElementById('history-weekly-avg-protein').textContent = avgPro + 'g';
            document.getElementById('history-weekly-best-protein').textContent = highestProDay !== "-" ? `${highestPro}g (${highestProDay})` : '-';
            document.getElementById('history-weekly-lowest-cals').textContent = lowestCalDay !== "N/A" ? `${lowestCal} (${lowestCalDay})` : '-';

            const calsCtx = document.getElementById('chart-weekly-calories').getContext('2d');
            const proCtx = document.getElementById('chart-weekly-protein').getContext('2d');

            if (historyWeeklyCalsChart) historyWeeklyCalsChart.destroy();
            historyWeeklyCalsChart = new Chart(calsCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Calories',
                        data: calsData,
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
                }
            });

            if (historyWeeklyProteinChart) historyWeeklyProteinChart.destroy();
            historyWeeklyProteinChart = new Chart(proCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Protein (g)',
                        data: proData,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true,
                        pointBackgroundColor: '#f43f5e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
                }
            });

            // Generate Insights
            let insightText = "You logged data consistently this week.";
            const todayCals = calsData[6];
            const todayPro = proData[6];

            if (avgCals === 0) {
                insightText = "Start logging your meals to see weekly insights here!";
                insightsBanner.style.background = "rgba(255,255,255,0.1)";
                insightsBanner.style.borderColor = "rgba(255,255,255,0.2)";
            } else if (todayCals > 0 && todayCals > avgCals * 1.2) {
                insightText = `You consumed ${(todayCals - avgCals)} more calories today than your weekly average.`;
                insightsBanner.style.background = "rgba(244, 63, 94, 0.1)"; // Red tint
                insightsBanner.style.borderColor = "rgba(244, 63, 94, 0.2)";
            } else if (todayPro > avgPro && avgPro > 0) {
                insightText = `Great job! Your protein intake today is higher than your weekly average.`;
                insightsBanner.style.background = "rgba(16, 185, 129, 0.1)"; // Green tint
                insightsBanner.style.borderColor = "rgba(16, 185, 129, 0.2)";
            } else {
                insightsBanner.style.background = "rgba(99, 102, 241, 0.1)"; // Default tint
                insightsBanner.style.borderColor = "rgba(99, 102, 241, 0.2)";
            }

            insightsBanner.innerHTML = `<i class="ri-lightbulb-flash-line" style="margin-right:0.5rem;"></i> <span>${insightText}</span>`;

        } catch (error) {
            console.error("Render weekly history error:", error);
            insightsBanner.innerHTML = `<i class="ri-error-warning-line" style="color: #f43f5e; margin-right:0.5rem;"></i> <span>Failed to load weekly analytics.</span>`;
        }
    };

    const initDietHistory = () => {
        const btnDaily = document.getElementById('btn-diet-daily');
        const btnWeekly = document.getElementById('btn-diet-weekly');
        const containerDaily = document.getElementById('diet-daily-container');
        const containerWeekly = document.getElementById('diet-weekly-container');
        const dateInput = document.getElementById('diet-history-date');
        const mealList = document.getElementById('history-meal-list');
        const insightsBanner = document.getElementById('diet-weekly-insights');

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) dateInput.value = today;

        // Toggle Handlers
        if (btnDaily && btnWeekly) {
            btnDaily.addEventListener('click', () => {
                btnDaily.classList.add('active');
                btnWeekly.classList.remove('active');
                containerDaily.style.display = 'block';
                containerWeekly.style.display = 'none';
                renderDietDailyHistory();
            });

            btnWeekly.addEventListener('click', () => {
                btnWeekly.classList.add('active');
                btnDaily.classList.remove('active');
                containerWeekly.style.display = 'block';
                containerDaily.style.display = 'none';
                renderDietWeeklyHistory();
            });
        }

        // Date Picker Handler
        if (dateInput) {
            dateInput.addEventListener('change', renderDietDailyHistory);
        }

        // History Route Trigger
        document.querySelector('.nav-item[data-target="view-diet-history"]')?.addEventListener('click', () => {
            // Render active view
            if (btnDaily.classList.contains('active')) {
                renderDietDailyHistory();
            } else {
                renderDietWeeklyHistory();
            }
        });
    };

    // ==========================================
    // 9. INIT
    // ==========================================
    const init = async () => {
        applyCustomDropdown(elements.exerciseSelect);
        if (elements.dietMealType) applyCustomDropdown(elements.dietMealType);

        initAIFoodScanner(); // Initialize diet analyzer listeners
        initDietHistory();   // Initialize Diet History view and charts

        setupEventListeners();
        initAuth(); // New Auth Flow
        initThemes();
        initPreferences();

        // Init Modules
        routinesModule = initRoutines(app, db, auth, elements);
        gamificationModule = initGamification();

        // Hide loader initially, but UI might be locked until auth
        hideLoader();
    };

    // ==========================================
    // 9. AUTHENTICATION LOGIC
    // ==========================================
    const initAuth = () => {
        const authModal = document.getElementById('auth-modal');
        const googleBtn = document.getElementById('btn-google-login');
        const authForm = document.getElementById('auth-form');
        const validEmailInput = document.getElementById('auth-email');
        const validPassInput = document.getElementById('auth-password');
        const switchBtn = document.getElementById('auth-switch-btn');
        const switchText = document.getElementById('auth-switch-text');
        const authTitle = document.getElementById('auth-title');
        let isSignUp = false;

        // AUTH STATE LISTENER
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                authModal.style.display = 'none';
                showNotification(`Welcome back, ${user.displayName || user.email}!`);
                updateDataStatus();
                // Load Data
                await loadDataFromServer();
                updateAllUI();
                if (window.appMode === 'diet' && window.updateDietDashboard) window.updateDietDashboard();
            } else {
                // User is signed out
                authModal.style.display = 'flex';
                data = [];
                bwData = [];
                updateAllUI();
            }
        });

        // GOOGLE LOGIN
        if (googleBtn) {
            googleBtn.addEventListener('click', async () => {
                const provider = new GoogleAuthProvider();
                try {
                    await signInWithPopup(auth, provider);
                } catch (error) {
                    console.error(error);
                    showNotification(error.message, 'error');
                }
            });
        }

        // EMAIL LOGIN / SIGN UP
        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = validEmailInput.value;
                const password = validPassInput.value;

                try {
                    if (isSignUp) {
                        await createUserWithEmailAndPassword(auth, email, password);
                        showNotification("Account created successfully!");
                    } else {
                        await signInWithEmailAndPassword(auth, email, password);
                    }
                } catch (error) {
                    console.error(error);
                    let msg = error.message;
                    if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
                    if (error.code === 'auth/user-not-found') msg = "No user found with this email.";
                    if (error.code === 'auth/email-already-in-use') msg = "Email already in use.";
                    showNotification(msg, 'error');
                }
            });
        }

        // TOGGLE SIGN UP MODE
        if (switchBtn) {
            switchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isSignUp = !isSignUp;
                if (isSignUp) {
                    authTitle.textContent = "Create Account";
                    document.getElementById('btn-auth-submit').textContent = "Sign Up";
                    switchText.textContent = "Already have an account?";
                    switchBtn.textContent = "Sign In";
                } else {
                    authTitle.textContent = "Welcome to FitTrack";
                    document.getElementById('btn-auth-submit').textContent = "Sign In";
                    switchText.textContent = "Don't have an account?";
                    switchBtn.textContent = "Sign Up";
                }
            });
        }
    };

    // LOGOUT FUNCTION
    const handleLogout = async () => {
        window.showConfirmDialog("Log Out?", "Do you want to log out from this account?", async () => {
            try {
                await signOut(auth);
                showNotification("Logged out successfully.");
                // Optional: Reload page to clear any in-memory state artifacts
                window.location.reload();
            } catch (error) {
                console.error(error);
                showNotification("Failed to log out.", "error");
            }
        });
    };

    // ==========================================
    // HELPER FUNCTIONS (Moved inside scope)
    // ==========================================
    const calculateBMI = (h, w) => {
        const m = h / 100;
        return (w / (m * m)).toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal weight";
        if (bmi < 30) return "Overweight";
        return "Obese";
    };

    const calculateBodyFat = (gender, h, w, n, hip) => {
        let bf = 0;
        try {
            if (gender === 'male') {
                if (w - n <= 0) return 0;
                bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
            } else {
                if (w + hip - n <= 0) return 0;
                bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.22100 * Math.log10(h)) - 450;
            }
            return Math.max(0, bf).toFixed(1);
        } catch (e) {
            return 0;
        }
    };

    const getBFCategory = (gender, bf) => {
        bf = parseFloat(bf);
        if (gender === 'male') {
            if (bf < 6) return "Essential Fat";
            if (bf < 14) return "Athletes";
            if (bf < 18) return "Fitness";
            if (bf < 25) return "Average";
            return "Obese";
        } else {
            if (bf < 14) return "Essential Fat";
            if (bf < 21) return "Athletes";
            if (bf < 25) return "Fitness";
            if (bf < 32) return "Average";
            return "Obese";
        }
    };

    const calculate1RM = (w, r) => { if (!weight || !reps) return 0; if (reps === 1) return weight; return Math.round(weight * (1 + reps / 30)); };

    // ─────────────────────────────────────────────────────────────
    // NEW: GLOBAL MODE FEATURE
    // ─────────────────────────────────────────────────────────────
    const initGlobalModeToggle = () => {
        const toggleBtns = document.querySelectorAll('#global-mode-toggle .toggle-btn');
        const slider = document.getElementById('mode-slider');
        const appContainerExercise = document.getElementById('app-container-exercise');
        const appContainerDiet = document.getElementById('app-container-diet');

        // Note: elements.navExercise and elements.navDiet are used below instead of a single bottomNav

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedMode = btn.dataset.mode;
                if (appMode === selectedMode) return;

                // Update state
                appMode = selectedMode;

                // Update UI Buttons
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update Slider
                slider.className = `slider ${selectedMode}`;

                // Swap Containers cleanly
                if (appMode === 'exercise') {
                    appContainerDiet.classList.add('hidden-mode');
                    appContainerExercise.classList.remove('hidden-mode');

                    // Show Exercise Navigation
                    elements.sidebarDiet.style.display = '';
                    elements.sidebarDiet.classList.add('hidden-mode');
                    elements.sidebarExercise.style.display = '';
                    elements.sidebarExercise.classList.remove('hidden-mode');
                    elements.navDiet.classList.add('hidden-mode');
                    elements.navExercise.classList.remove('hidden-mode');

                    // Auto-route to home if no active tab in exercise
                    const hasActiveExercise = elements.sidebarExercise.querySelector('.active');
                    if (!hasActiveExercise) document.querySelector('.nav-item[data-target="view-home"]').click();

                } else if (appMode === 'diet') {
                    appContainerExercise.classList.add('hidden-mode');
                    appContainerDiet.classList.remove('hidden-mode');

                    // Show Diet Navigation
                    elements.sidebarExercise.style.display = '';
                    elements.sidebarExercise.classList.add('hidden-mode');
                    elements.sidebarDiet.style.display = '';
                    elements.sidebarDiet.classList.remove('hidden-mode');
                    elements.navExercise.classList.add('hidden-mode');
                    elements.navDiet.classList.remove('hidden-mode');

                    // Auto-route specifically to dashboard
                    const hasActiveDiet = elements.sidebarDiet.querySelector('.active');
                    if (!hasActiveDiet) document.querySelector('.nav-item[data-target="view-diet-dashboard"]').click();

                    if (window.updateDietDashboard) window.updateDietDashboard();
                }
            });
        });
    };

    initGlobalModeToggle(); // INITIALIZE GLOBAL MODE

    init();

    // ==========================================
    // 9. AI ASSISTANT LOGIC
    // ==========================================
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatSend = document.getElementById('ai-chat-send');
    const aiChatMessages = document.getElementById('ai-chat-messages');

    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender}`;
        msgDiv.style.alignSelf = sender === 'user' ? 'flex-end' : 'flex-start';
        msgDiv.style.background = sender === 'user' ? 'var(--accent-gradient)' : 'var(--input-bg)';
        msgDiv.style.color = sender === 'user' ? '#fff' : 'var(--text)';
        msgDiv.style.padding = '1rem';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.maxWidth = '80%';
        msgDiv.style.lineHeight = '1.5';
        msgDiv.innerHTML = text;
        aiChatMessages.appendChild(msgDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    };

    const handleSendAI = async () => {
        const query = aiChatInput.value.trim();
        if (!query) return;

        appendMessage(query, 'user');
        aiChatInput.value = '';

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'ai-message bot typing-indicator';
        typingDiv.style.alignSelf = 'flex-start';
        typingDiv.style.background = 'transparent';
        typingDiv.style.padding = '1rem';
        typingDiv.innerHTML = '<span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--text-light);margin-right:4px;"></span><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--text-light);margin-right:4px;"></span><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--text-light);"></span>';
        aiChatMessages.appendChild(typingDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        try {
            // Include a compressed version of recent workout history (last 30 entries) to avoid API token limits!
            const recentData = data.slice(-30);
            const historyContext = JSON.stringify(recentData.map(d => ({
                date: d.date,
                exercise: d.exercise,
                reps: d.reps,
                sets: d.sets,
                weight: d.weight
            })));

            const fullPrompt = `User Query: ${query}\n\nUser Workout History Context (Last 30 workouts): ${historyContext}`;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt })
            });

            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            if (!response.ok) {
                appendMessage("Sorry, I'm having trouble connecting to the server.", 'bot');
                return;
            }

            const result = await response.json();

            let formattedText = result.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            formattedText = formattedText.replace(/\n/g, '<br/>');

            appendMessage(formattedText, 'bot');

        } catch (err) {
            console.error(err);
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();
            appendMessage("An error occurred while communicating with the AI. Ensure you are running on a server that supports vercel functions, or using Vercel locally.", 'bot');
        }
    };

    if (aiChatSend && aiChatInput) {
        aiChatSend.addEventListener('click', handleSendAI);
        aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendAI();
        });
    }

});