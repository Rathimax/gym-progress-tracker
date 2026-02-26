import { getFirestore, collection, addDoc, getDocs, doc, query, orderBy, serverTimestamp, setDoc, getDoc, increment } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

/**
 * Ensures date is strictly formatted as YYYY-MM-DD
 * @param {string|Date} rawDate 
 * @returns {string} Formatted date string
 */
const formatDate = (rawDate) => {
    if (rawDate instanceof Date) {
        return rawDate.toISOString().split('T')[0];
    }
    // Attempt standard cast
    const d = new Date(rawDate);
    if (!isNaN(d)) return d.toISOString().split('T')[0];

    // Fallback if already formatted
    return rawDate;
};

// ==========================================
// 1. MEAL TRACKING 
// Path: users/{uid}/meals/{date}/items/{mealId}
// ==========================================

export const addMeal = async (db, uid, date, mealData) => {
    if (!uid) throw new Error("Authentication required: uid is missing.");
    if (!date) throw new Error("Date is required.");

    try {
        const formattedDate = formatDate(date);
        // Correct nested path: users/{uid}/meals/{date}/items
        const itemsRef = collection(db, "users", uid, "meals", formattedDate, "items");

        // Ensure strictly structured input data
        const payload = {
            foodName: mealData.foodName || "Unknown Item",
            calories: Number(mealData.calories) || 0,
            protein: Number(mealData.protein) || 0,
            carbs: Number(mealData.carbs) || 0,
            fat: Number(mealData.fat) || 0,
            mealType: mealData.mealType || "Snack",
            timestamp: serverTimestamp() // Let Firebase handle exact server time
        };

        const docRef = await addDoc(itemsRef, payload);
        return { success: true, id: docRef.id, data: payload };
    } catch (error) {
        console.error("Error adding meal:", error);
        return { success: false, error: error.message };
    }
};

export const getMealsByDate = async (db, uid, date) => {
    if (!uid) throw new Error("Authentication required: uid is missing.");
    if (!date) throw new Error("Date is required.");

    try {
        const formattedDate = formatDate(date);
        const itemsRef = collection(db, "users", uid, "meals", formattedDate, "items");

        // Query ordered by timestamp
        const q = query(itemsRef, orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);

        const meals = [];
        snapshot.forEach((doc) => {
            meals.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, meals };
    } catch (error) {
        console.error("Error fetching meals:", error);
        return { success: false, error: error.message, meals: [] };
    }
};

// ==========================================
// 2. WATER TRACKING 
// Path: users/{uid}/waterLogs/{date}
// ==========================================

export const addWater = async (db, uid, date, amountMl) => {
    if (!uid) throw new Error("Authentication required: uid is missing.");
    if (!date) throw new Error("Date is required.");
    if (!amountMl || isNaN(amountMl)) throw new Error("Valid water amount (ml) is required.");

    try {
        const formattedDate = formatDate(date);
        const waterLogRef = doc(db, "users", uid, "waterLogs", formattedDate);

        // Use setDoc with merge to either create or incrementally update the document without wiping existing fields.
        await setDoc(waterLogRef, {
            totalMl: increment(Number(amountMl)),
            lastUpdated: serverTimestamp()
        }, { merge: true });

        // Fetch the newly updated data to return it
        const updatedDoc = await getDoc(waterLogRef);
        return { success: true, data: updatedDoc.data() };
    } catch (error) {
        console.error("Error adding water:", error);
        return { success: false, error: error.message };
    }
};

export const getWaterByDate = async (db, uid, date) => {
    if (!uid) throw new Error("Authentication required: uid is missing.");
    if (!date) throw new Error("Date is required.");

    try {
        const formattedDate = formatDate(date);
        const waterLogRef = doc(db, "users", uid, "waterLogs", formattedDate);
        const waterDoc = await getDoc(waterLogRef);

        if (waterDoc.exists()) {
            return { success: true, totalMl: waterDoc.data().totalMl || 0 };
        } else {
            // Handle day without water log gracefully
            return { success: true, totalMl: 0 };
        }
    } catch (error) {
        console.error("Error fetching water log:", error);
        return { success: false, error: error.message, totalMl: 0 };
    }
};
