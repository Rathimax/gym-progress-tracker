/**
 * FitTrack Built-In Food Database & Calorie Book
 * Standardized nutritional values based on Indian Food Composition Tables (IFCT/NIN) & USDA FoodData Central.
 * Values are strictly calibrated per 100g base for precise scaling.
 */

export const FOOD_CATEGORIES = [
    { id: "all", name: "All Foods", icon: "ri-apps-2-line" },
    { id: "global", name: "Global Database (Millions)", icon: "ri-global-line" },
    { id: "staples", name: "Indian Staples & Breads", icon: "ri-bread-line" },
    { id: "grains", name: "Rice & Grains", icon: "ri-bowl-line" },
    { id: "dals", name: "Dals & Legumes", icon: "ri-restaurant-line" },
    { id: "proteins", name: "Meat, Fish & Eggs", icon: "ri-goblet-line" },
    { id: "dairy", name: "Dairy & Paneer", icon: "ri-cup-line" },
    { id: "veggies", name: "Vegetables & Sabzi", icon: "ri-leaf-line" },
    { id: "fruits", name: "Fruits", icon: "ri-apple-line" },
    { id: "fats", name: "Nuts, Seeds & Oils", icon: "ri-drop-line" },
    { id: "fitness", name: "Fitness & Supplements", icon: "ri-flashlight-line" }
];

export const FOOD_DATABASE = [
    // ==========================================
    // 1. INDIAN STAPLES & BREADS
    // ==========================================
    {
        id: "roti_chapati",
        name: "Roti / Chapati",
        category: "staples",
        state: "Cooked",
        searchTerms: "roti chapati phulka wheat flatbread fulka atta",
        description: "Whole wheat handmade flatbread cooked without oil/ghee",
        base100g: { calories: 233, protein: 8.7, carbs: 50.0, fat: 1.3 },
        servingUnits: [
            { id: "piece", name: "1 Roti (~30g)", grams: 30, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 5, defaultQty: 30, isDefault: false }
        ]
    },
    {
        id: "phulka_no_oil",
        name: "Phulka (Puffed Roti)",
        category: "staples",
        state: "Cooked",
        searchTerms: "phulka puffed roti light wheat flatbread chapatti",
        description: "Light puffed whole wheat roti without oil",
        base100g: { calories: 230, protein: 8.5, carbs: 49.5, fat: 1.2 },
        servingUnits: [
            { id: "piece", name: "1 Phulka (~25g)", grams: 25, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 5, defaultQty: 25, isDefault: false }
        ]
    },
    {
        id: "paratha_plain",
        name: "Paratha — Plain (With Oil/Ghee)",
        category: "staples",
        state: "Cooked",
        searchTerms: "paratha plain shallow fried tawa wheat flatbread",
        description: "Layered wheat paratha prepared with ~1 tsp oil/ghee",
        base100g: { calories: 305, protein: 6.8, carbs: 44.2, fat: 11.5 },
        servingUnits: [
            { id: "piece", name: "1 Paratha (~60g)", grams: 60, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 60, isDefault: false }
        ]
    },
    {
        id: "aloo_paratha",
        name: "Aloo Paratha",
        category: "staples",
        state: "Cooked",
        searchTerms: "aloo paratha potato stuffed flatbread tawa",
        description: "Spiced mashed potato stuffed wheat paratha with modest oil",
        base100g: { calories: 240, protein: 4.8, carbs: 36.5, fat: 8.5 },
        servingUnits: [
            { id: "piece", name: "1 Paratha (~100g)", grams: 100, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 20, min: 20, defaultQty: 100, isDefault: false }
        ]
    },
    {
        id: "paneer_paratha",
        name: "Paneer Paratha",
        category: "staples",
        state: "Cooked",
        searchTerms: "paneer paratha cottage cheese stuffed high protein flatbread",
        description: "Cottage cheese stuffed wheat flatbread with spices",
        base100g: { calories: 280, protein: 9.6, carbs: 31.0, fat: 13.0 },
        servingUnits: [
            { id: "piece", name: "1 Paratha (~100g)", grams: 100, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 20, min: 20, defaultQty: 100, isDefault: false }
        ]
    },
    {
        id: "puri_fried",
        name: "Puri (Deep Fried)",
        category: "staples",
        state: "Cooked",
        searchTerms: "puri poori fried wheat puffed bread",
        description: "Deep fried golden puffed whole wheat bread",
        base100g: { calories: 375, protein: 6.4, carbs: 46.0, fat: 18.5 },
        servingUnits: [
            { id: "piece", name: "1 Puri (~25g)", grams: 25, step: 1, min: 1, defaultQty: 2, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 50, isDefault: false }
        ]
    },
    {
        id: "naan_plain",
        name: "Naan — Plain",
        category: "staples",
        state: "Cooked",
        searchTerms: "naan plain tandoori flatbread tandoor",
        description: "Tandoor baked refined flour leavened flatbread",
        base100g: { calories: 285, protein: 8.5, carbs: 52.0, fat: 4.8 },
        servingUnits: [
            { id: "piece", name: "1 Naan (~80g)", grams: 80, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 20, min: 20, defaultQty: 80, isDefault: false }
        ]
    },
    {
        id: "naan_butter",
        name: "Naan — Butter",
        category: "staples",
        state: "Cooked",
        searchTerms: "butter naan tandoori flatbread rich",
        description: "Tandoor baked leavened bread brushed with melted butter",
        base100g: { calories: 330, protein: 8.0, carbs: 50.0, fat: 10.5 },
        servingUnits: [
            { id: "piece", name: "1 Naan (~90g)", grams: 90, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 20, min: 20, defaultQty: 90, isDefault: false }
        ]
    },
    {
        id: "idli_steamed",
        name: "Idli — Steamed",
        category: "staples",
        state: "Cooked",
        searchTerms: "idli steamed rice urad dal south indian fermented cake",
        description: "Steamed fermented rice and urad dal cake, naturally oil-free",
        base100g: { calories: 135, protein: 4.5, carbs: 28.0, fat: 0.4 },
        servingUnits: [
            { id: "piece", name: "1 Idli (~40g)", grams: 40, step: 1, min: 1, defaultQty: 2, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 20, min: 20, defaultQty: 80, isDefault: false }
        ]
    },
    {
        id: "dosa_plain",
        name: "Dosa — Plain (Cooked)",
        category: "staples",
        state: "Cooked",
        searchTerms: "plain dosa sada dosa south indian crepe fermented",
        description: "Crisp thin rice-lentil crepe cooked with minimal oil",
        base100g: { calories: 170, protein: 4.0, carbs: 29.5, fat: 4.2 },
        servingUnits: [
            { id: "piece", name: "1 Dosa (~75g)", grams: 75, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 75, isDefault: false }
        ]
    },
    {
        id: "dosa_masala",
        name: "Dosa — Masala (Cooked)",
        category: "staples",
        state: "Cooked",
        searchTerms: "masala dosa aloo filling potato crepe south indian",
        description: "Crispy rice crepe filled with seasoned spiced potato mash",
        base100g: { calories: 195, protein: 3.8, carbs: 32.0, fat: 5.8 },
        servingUnits: [
            { id: "piece", name: "1 Masala Dosa (~150g)", grams: 150, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 50, min: 50, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "poha_cooked",
        name: "Poha (Flattened Rice) — Cooked",
        category: "staples",
        state: "Cooked",
        searchTerms: "poha flattened rice beaten rice batata breakfast maharashtrian",
        description: "Cooked flattened rice tempered with mustard, turmeric, onions & peanuts",
        base100g: { calories: 155, protein: 3.0, carbs: 27.5, fat: 3.8 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (~150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "upma_cooked",
        name: "Upma (Sooji/Rava) — Cooked",
        category: "staples",
        state: "Cooked",
        searchTerms: "upma semolina rava sooji breakfast",
        description: "Cooked roasted semolina porridge tempered with ginger, spices and curry leaves",
        base100g: { calories: 140, protein: 3.2, carbs: 22.0, fat: 4.2 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (~150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "khichdi_cooked",
        name: "Khichdi (Moong Dal & Rice) — Cooked",
        category: "staples",
        state: "Cooked",
        searchTerms: "khichdi moong dal rice comfort food pongal",
        description: "Wholesome soft porridge of yellow moong dal, rice and mild spices",
        base100g: { calories: 125, protein: 4.2, carbs: 22.0, fat: 2.2 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl (~200g)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 50, min: 25, defaultQty: 200, isDefault: false }
        ]
    },

    // ==========================================
    // 2. RICE & GRAINS (COOKED vs RAW/DRY)
    // ==========================================
    {
        id: "rice_white_cooked",
        name: "Rice (White / Basmati) — Cooked",
        category: "grains",
        state: "Cooked",
        searchTerms: "rice cooked boiled white basmati steamed chawal",
        description: "Boiled white basmati rice, absorbs water during cooking (~3x weight increase)",
        base100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "plate", name: "1 Plate / Cup (200g)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "rice_white_raw",
        name: "Rice (White / Basmati) — Raw / Dry",
        category: "grains",
        state: "Raw / Dry",
        searchTerms: "rice raw dry uncooked white basmati grains",
        description: "Dry uncooked white rice kernels before boiling",
        base100g: { calories: 360, protein: 7.1, carbs: 79.2, fat: 0.7 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 50, isDefault: true },
            { id: "serving", name: "1 Dry Serving (50g raw)", grams: 50, step: 1, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "cup", name: "1 Raw Cup (~185g dry)", grams: 185, step: 0.25, min: 0.25, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "rice_brown_cooked",
        name: "Rice (Brown) — Cooked",
        category: "grains",
        state: "Cooked",
        searchTerms: "brown rice cooked whole grain boiled fiber",
        description: "Whole grain brown rice boiled in water with intact bran and germ",
        base100g: { calories: 123, protein: 2.7, carbs: 25.6, fat: 1.0 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "rice_brown_raw",
        name: "Rice (Brown) — Raw / Dry",
        category: "grains",
        state: "Raw / Dry",
        searchTerms: "brown rice raw dry uncooked whole grain",
        description: "Uncooked whole grain brown rice before boiling",
        base100g: { calories: 362, protein: 7.5, carbs: 76.2, fat: 2.7 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 50, isDefault: true },
            { id: "serving", name: "1 Dry Serving (50g raw)", grams: 50, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "oats_dry",
        name: "Oats (Rolled / Instant) — Raw / Dry",
        category: "grains",
        state: "Raw / Dry",
        searchTerms: "oats rolled instant dry uncooked oatmeal quaker",
        description: "Dry whole grain rolled or instant oats before cooking",
        base100g: { calories: 380, protein: 13.5, carbs: 67.0, fat: 6.5 },
        servingUnits: [
            { id: "serving", name: "1 Standard Serving (40g)", grams: 40, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 40, isDefault: false },
            { id: "cup", name: "1 Cup Rolled Oats (~80g)", grams: 80, step: 0.5, min: 0.25, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "oats_cooked_water",
        name: "Oats (Oatmeal in Water) — Cooked",
        category: "grains",
        state: "Cooked",
        searchTerms: "oats cooked oatmeal porridge in water boiled",
        description: "Oatmeal porridge cooked in water without sugar or milk",
        base100g: { calories: 71, protein: 2.5, carbs: 12.0, fat: 1.4 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl (~200g cooked)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 200, isDefault: false }
        ]
    },
    {
        id: "pasta_cooked",
        name: "Pasta (Wheat) — Cooked",
        category: "grains",
        state: "Cooked",
        searchTerms: "pasta cooked boiled wheat macaroni penne spaghetti",
        description: "Boiled durum wheat pasta without sauce or added oil",
        base100g: { calories: 158, protein: 5.8, carbs: 31.0, fat: 0.9 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl (~150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "plate", name: "1 Plate (~200g)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "pasta_dry",
        name: "Pasta (Wheat) — Dry / Raw",
        category: "grains",
        state: "Raw / Dry",
        searchTerms: "pasta dry uncooked raw wheat macaroni penne",
        description: "Dry durum wheat pasta from box before boiling",
        base100g: { calories: 371, protein: 13.0, carbs: 75.0, fat: 1.5 },
        servingUnits: [
            { id: "serving", name: "1 Dry Serving (56g / 2 oz)", grams: 56, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 56, isDefault: false }
        ]
    },
    {
        id: "bread_white",
        name: "Bread — White",
        category: "grains",
        state: "Cooked",
        searchTerms: "white bread slice sandwich toast refined flour",
        description: "Standard white sandwich loaf bread",
        base100g: { calories: 265, protein: 8.9, carbs: 49.0, fat: 3.2 },
        servingUnits: [
            { id: "slice", name: "1 Slice (~28g)", grams: 28, step: 1, min: 1, defaultQty: 2, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 56, isDefault: false }
        ]
    },
    {
        id: "bread_whole_wheat",
        name: "Bread — Whole Wheat / Brown",
        category: "grains",
        state: "Cooked",
        searchTerms: "brown bread whole wheat atta slice toast",
        description: "Whole wheat sandwich bread higher in dietary fiber",
        base100g: { calories: 247, protein: 9.8, carbs: 43.5, fat: 3.4 },
        servingUnits: [
            { id: "slice", name: "1 Slice (~30g)", grams: 30, step: 1, min: 1, defaultQty: 2, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 60, isDefault: false }
        ]
    },
    {
        id: "quinoa_cooked",
        name: "Quinoa — Cooked",
        category: "grains",
        state: "Cooked",
        searchTerms: "quinoa cooked boiled complete protein grain gluten free",
        description: "Cooked whole grain quinoa boiled in water",
        base100g: { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl (~180g)", grams: 180, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 180, isDefault: false }
        ]
    },

    // ==========================================
    // 3. DALS, LEGUMES & BEANS (COOKED vs RAW/DRY)
    // ==========================================
    {
        id: "dal_toor_cooked",
        name: "Dal (Yellow / Toor / Arhar) — Cooked",
        category: "dals",
        state: "Cooked",
        searchTerms: "dal cooked toor arhar yellow dal tadka sambar lentils",
        description: "Prepared yellow toor dal with light cumin-turmeric tadka",
        base100g: { calories: 90, protein: 5.0, carbs: 13.5, fat: 2.0 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false },
            { id: "cup", name: "1 Large Cup (200g)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "dal_toor_raw",
        name: "Dal (Yellow / Toor / Arhar) — Raw / Dry",
        category: "dals",
        state: "Raw / Dry",
        searchTerms: "dal raw dry toor arhar yellow lentils uncooked pigeon pea",
        description: "Dry split pigeon peas (toor dal) before boiling",
        base100g: { calories: 343, protein: 22.3, carbs: 62.8, fat: 1.5 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 40, isDefault: true },
            { id: "serving", name: "1 Dry Serving (40g dry)", grams: 40, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "dal_moong_cooked",
        name: "Dal (Moong / Yellow Split) — Cooked",
        category: "dals",
        state: "Cooked",
        searchTerms: "moong dal cooked yellow green gram lentils easy digestion",
        description: "Light cooked yellow moong dal with mild tempering",
        base100g: { calories: 85, protein: 5.5, carbs: 13.0, fat: 1.5 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "dal_moong_raw",
        name: "Dal (Moong) — Raw / Dry",
        category: "dals",
        state: "Raw / Dry",
        searchTerms: "moong dal raw dry yellow lentils green gram uncooked",
        description: "Dry raw yellow moong dal split lentils before boiling",
        base100g: { calories: 347, protein: 24.0, carbs: 59.8, fat: 1.2 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 40, isDefault: true },
            { id: "serving", name: "1 Dry Serving (40g dry)", grams: 40, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "rajma_cooked",
        name: "Rajma (Red Kidney Beans) — Cooked",
        category: "dals",
        state: "Cooked",
        searchTerms: "rajma cooked kidney beans curry north indian gravy",
        description: "Boiled red kidney beans simmered in onion-tomato gravy",
        base100g: { calories: 127, protein: 7.5, carbs: 22.0, fat: 0.9 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false },
            { id: "cup", name: "1 Cup (200g)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "rajma_raw",
        name: "Rajma (Red Kidney Beans) — Raw / Dry",
        category: "dals",
        state: "Raw / Dry",
        searchTerms: "rajma raw dry kidney beans uncooked legumes",
        description: "Dry uncooked kidney beans before soaking & pressure cooking",
        base100g: { calories: 333, protein: 23.6, carbs: 60.0, fat: 1.0 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 40, isDefault: true },
            { id: "serving", name: "1 Dry Serving (40g dry)", grams: 40, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "chole_cooked",
        name: "Chole (Chickpeas / Kabuli Chana) — Cooked",
        category: "dals",
        state: "Cooked",
        searchTerms: "chole cooked chickpeas kabuli chana garbanzo curry gravy",
        description: "Tender chickpeas simmered in spiced onion-tomato masala",
        base100g: { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "chole_raw",
        name: "Chole (Chickpeas / Kabuli Chana) — Raw / Dry",
        category: "dals",
        state: "Raw / Dry",
        searchTerms: "chole raw dry chickpeas kabuli chana garbanzo beans uncooked",
        description: "Dry chickpeas before soaking and pressure boiling",
        base100g: { calories: 378, protein: 20.5, carbs: 63.0, fat: 6.0 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 40, isDefault: true },
            { id: "serving", name: "1 Dry Serving (40g dry)", grams: 40, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "soya_chunks_dry",
        name: "Soya Chunks — Dry / Raw",
        category: "dals",
        state: "Raw / Dry",
        searchTerms: "soya chunks dry nutri meal maker high protein vegetarian defatted",
        description: "De-fatted soya chunks rich in plant-based protein (~52% protein)",
        base100g: { calories: 345, protein: 52.0, carbs: 33.0, fat: 0.5 },
        servingUnits: [
            { id: "serving", name: "1 Serving (30g dry)", grams: 30, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "serving_50", name: "50g High-Protein Portion", grams: 50, step: 1, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 5, defaultQty: 30, isDefault: false }
        ]
    },
    {
        id: "soya_chunks_boiled",
        name: "Soya Chunks — Boiled / Cooked",
        category: "dals",
        state: "Cooked",
        searchTerms: "soya chunks boiled cooked hydrated water squeezed meal maker",
        description: "Hydrated, boiled & gently squeezed soya chunks ready to eat or curry",
        base100g: { calories: 115, protein: 17.5, carbs: 11.0, fat: 0.3 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl (~120g)", grams: 120, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 120, isDefault: false }
        ]
    },
    {
        id: "dal_makhani",
        name: "Dal Makhani — Cooked",
        category: "dals",
        state: "Cooked",
        searchTerms: "dal makhani black urad dal butter cream rich lentils",
        description: "Slow-cooked black lentils with butter and cream",
        base100g: { calories: 165, protein: 5.5, carbs: 15.0, fat: 9.5 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (180g)", grams: 180, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 180, isDefault: false }
        ]
    },

    // ==========================================
    // 4. MEAT, POULTRY, FISH & EGGS
    // ==========================================
    {
        id: "chicken_breast_cooked",
        name: "Chicken Breast — Cooked / Grilled",
        category: "proteins",
        state: "Cooked",
        searchTerms: "chicken breast cooked grilled roasted boiled lean protein poultry",
        description: "Skinless boneless chicken breast grilled or boiled with minimal oil",
        base100g: { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 100, isDefault: true },
            { id: "fillet", name: "1 Breast Fillet (~150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "portion_100", name: "100g Standard Portion", grams: 100, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "chicken_breast_raw",
        name: "Chicken Breast — Raw",
        category: "proteins",
        state: "Raw / Dry",
        searchTerms: "chicken breast raw uncooked fresh skinless poultry meat",
        description: "Raw uncooked boneless, skinless chicken breast before cooking",
        base100g: { calories: 120, protein: 22.5, carbs: 0.0, fat: 2.6 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 100, isDefault: true },
            { id: "fillet_raw", name: "1 Raw Fillet (~200g)", grams: 200, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "chicken_thigh_cooked",
        name: "Chicken Thigh (Skinless) — Cooked",
        category: "proteins",
        state: "Cooked",
        searchTerms: "chicken thigh cooked dark meat roasted juicy poultry",
        description: "Skinless bone-out chicken thigh cooked",
        base100g: { calories: 209, protein: 26.0, carbs: 0.0, fat: 10.9 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 100, isDefault: true },
            { id: "piece", name: "1 Thigh (~120g)", grams: 120, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "egg_whole_boiled",
        name: "Whole Egg — Boiled / Cooked",
        category: "proteins",
        state: "Cooked",
        searchTerms: "egg whole boiled hard boiled egg anda yolk protein",
        description: "Hard boiled large whole chicken egg with yolk",
        base100g: { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6 },
        servingUnits: [
            { id: "piece", name: "1 Whole Egg (~50g)", grams: 50, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 50, isDefault: false }
        ]
    },
    {
        id: "egg_whole_raw",
        name: "Whole Egg — Raw",
        category: "proteins",
        state: "Raw / Dry",
        searchTerms: "egg whole raw fresh chicken egg anda",
        description: "Raw whole large egg before cooking",
        base100g: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
        servingUnits: [
            { id: "piece", name: "1 Whole Egg (~50g)", grams: 50, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 50, isDefault: false }
        ]
    },
    {
        id: "egg_white_boiled",
        name: "Egg White — Boiled / Cooked",
        category: "proteins",
        state: "Cooked",
        searchTerms: "egg white boiled cooked pure protein zero fat anda",
        description: "Boiled egg white without yolk, virtually fat-free pure protein",
        base100g: { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2 },
        servingUnits: [
            { id: "piece", name: "1 Egg White (~33g)", grams: 33, step: 1, min: 1, defaultQty: 2, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 66, isDefault: false }
        ]
    },
    {
        id: "egg_omelette_1egg",
        name: "Omelette (1 Egg with Minimal Oil)",
        category: "proteins",
        state: "Cooked",
        searchTerms: "omelette fried egg pan fried anda breakfast",
        description: "Pan-fried whole egg with onion, green chilli, and 1 tsp oil",
        base100g: { calories: 195, protein: 11.5, carbs: 2.0, fat: 15.5 },
        servingUnits: [
            { id: "piece", name: "1 Omelette (~60g)", grams: 60, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 20, min: 20, defaultQty: 60, isDefault: false }
        ]
    },
    {
        id: "fish_salmon_cooked",
        name: "Salmon Fish — Grilled / Cooked",
        category: "proteins",
        state: "Cooked",
        searchTerms: "salmon fish grilled cooked omega 3 seafood healthy fats",
        description: "Pan-seared or grilled salmon fillet rich in omega-3 fatty acids",
        base100g: { calories: 206, protein: 22.0, carbs: 0.0, fat: 12.3 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 100, isDefault: true },
            { id: "fillet", name: "1 Fillet (~150g)", grams: 150, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "fish_rohu_curry",
        name: "Rohu / Katla Fish Curry — Cooked",
        category: "proteins",
        state: "Cooked",
        searchTerms: "fish curry rohu katla freshwater fish bengali indian",
        description: "Indian freshwater fish cooked in mustard or tomato curry",
        base100g: { calories: 135, protein: 16.5, carbs: 3.5, fat: 6.0 },
        servingUnits: [
            { id: "piece", name: "1 Piece with Gravy (~100g)", grams: 100, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 25, defaultQty: 100, isDefault: false }
        ]
    },
    {
        id: "tuna_canned_water",
        name: "Canned Tuna (In Water / Brine)",
        category: "proteins",
        state: "Cooked",
        searchTerms: "tuna canned drained in water lean protein seafood",
        description: "Drained canned chunk light tuna packed in water",
        base100g: { calories: 116, protein: 25.5, carbs: 0.0, fat: 0.8 },
        servingUnits: [
            { id: "can", name: "1 Can Drained (~120g)", grams: 120, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 120, isDefault: false }
        ]
    },

    // ==========================================
    // 5. DAIRY & PLANT ALTERNATIVES
    // ==========================================
    {
        id: "paneer_regular",
        name: "Paneer (Cottage Cheese) — Regular",
        category: "dairy",
        state: "Fresh",
        searchTerms: "paneer cottage cheese regular dairy vegetarian protein",
        description: "Full cream Indian cottage cheese, dense and nutrient rich",
        base100g: { calories: 265, protein: 18.3, carbs: 3.4, fat: 20.8 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 100, isDefault: true },
            { id: "slice", name: "1 Thick Slice / Cubes (~50g)", grams: 50, step: 1, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "block", name: "100g Slab", grams: 100, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "paneer_low_fat",
        name: "Paneer (Low-Fat / Cow Milk)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "paneer low fat skimmed cow milk diet cottage cheese",
        description: "Low-fat cottage cheese made from skimmed milk, higher protein-to-fat ratio",
        base100g: { calories: 170, protein: 24.0, carbs: 4.0, fat: 6.0 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 100, isDefault: true },
            { id: "slice", name: "1 Slice (~50g)", grams: 50, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "tofu_firm",
        name: "Tofu (Firm / Soya Paneer)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "tofu firm soy bean curd vegan plant protein",
        description: "Firm soybean curd, 100% plant-based and high in calcium",
        base100g: { calories: 144, protein: 15.5, carbs: 2.8, fat: 8.0 },
        servingUnits: [
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 100, isDefault: true },
            { id: "block", name: "1 Block (~100g)", grams: 100, step: 1, min: 0.5, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "milk_toned",
        name: "Milk — Toned (3% Fat)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "milk toned 3% amul dairy cow buffalo dudh",
        description: "Standard toned pasteurized milk with 3% fat",
        base100g: { calories: 58, protein: 3.1, carbs: 4.7, fat: 3.0 },
        servingUnits: [
            { id: "glass", name: "1 Glass / Cup (250ml / 258g)", grams: 258, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "ml", name: "Milliliters (ml / g)", grams: 1.03, step: 50, min: 25, defaultQty: 250, isDefault: false }
        ]
    },
    {
        id: "milk_skimmed",
        name: "Milk — Skimmed / Double Toned (0.5% Fat)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "milk skimmed double toned fat free slim amul",
        description: "Fat-free or double-toned milk with virtually no saturated fat",
        base100g: { calories: 35, protein: 3.4, carbs: 4.9, fat: 0.3 },
        servingUnits: [
            { id: "glass", name: "1 Glass / Cup (250ml / 258g)", grams: 258, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "ml", name: "Milliliters (ml / g)", grams: 1.03, step: 50, min: 25, defaultQty: 250, isDefault: false }
        ]
    },
    {
        id: "curd_dahi_plain",
        name: "Curd / Dahi (Plain)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "curd dahi yogurt plain homemade fermented probiotic",
        description: "Traditional fermented Indian curd rich in gut-friendly probiotics",
        base100g: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "greek_yogurt_plain",
        name: "Greek Yogurt (Plain / Low-Fat)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "greek yogurt plain strained high protein epigamia",
        description: "Strained yogurt with double the protein of regular curd",
        base100g: { calories: 73, protein: 10.0, carbs: 3.8, fat: 2.0 },
        servingUnits: [
            { id: "cup", name: "1 Cup / Tub (150g)", grams: 150, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "cheese_cheddar",
        name: "Cheese (Cheddar / Mozzarella Slice)",
        category: "dairy",
        state: "Fresh",
        searchTerms: "cheese slice cheddar mozzarella amul processed",
        description: "Single slice processed cheese or shredded cheddar",
        base100g: { calories: 320, protein: 20.0, carbs: 2.5, fat: 26.0 },
        servingUnits: [
            { id: "slice", name: "1 Slice (~25g)", grams: 25, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 10, min: 10, defaultQty: 25, isDefault: false }
        ]
    },

    // ==========================================
    // 6. VEGETABLES & SABZI
    // ==========================================
    {
        id: "potato_boiled",
        name: "Potato (Aloo) — Boiled",
        category: "veggies",
        state: "Cooked",
        searchTerms: "potato boiled aloo carbohydrate tubers",
        description: "Peeled and boiled whole potato with no oil",
        base100g: { calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },
        servingUnits: [
            { id: "piece", name: "1 Medium Potato (~150g)", grams: 150, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "sweet_potato_boiled",
        name: "Sweet Potato (Shakarkand) — Boiled",
        category: "veggies",
        state: "Cooked",
        searchTerms: "sweet potato boiled shakarkand complex carbs pre workout",
        description: "Naturally sweet nutrient-dense root vegetable boiled",
        base100g: { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
        servingUnits: [
            { id: "piece", name: "1 Medium Sweet Potato (~130g)", grams: 130, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 130, isDefault: false }
        ]
    },
    {
        id: "spinach_cooked",
        name: "Palak (Spinach) — Cooked Sabzi",
        category: "veggies",
        state: "Cooked",
        searchTerms: "spinach cooked palak greens iron leafy vegetable",
        description: "Cooked spinach greens with garlic and light oil",
        base100g: { calories: 45, protein: 3.0, carbs: 4.2, fat: 2.2 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "broccoli_steamed",
        name: "Broccoli — Steamed / Raw",
        category: "veggies",
        state: "Cooked",
        searchTerms: "broccoli steamed raw florets green vegetable micronutrients",
        description: "Steamed crisp green broccoli florets",
        base100g: { calories: 35, protein: 2.8, carbs: 7.0, fat: 0.4 },
        servingUnits: [
            { id: "cup", name: "1 Cup Florets (~90g)", grams: 90, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 100, isDefault: false }
        ]
    },
    {
        id: "bhindi_sabzi",
        name: "Bhindi (Okra) Sabzi — Cooked",
        category: "veggies",
        state: "Cooked",
        searchTerms: "bhindi okra ladies finger sabzi cooked tawa",
        description: "Sauteed sliced okra with onion and home spices",
        base100g: { calories: 85, protein: 2.0, carbs: 9.0, fat: 5.0 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (~130g)", grams: 130, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 130, isDefault: false }
        ]
    },
    {
        id: "mix_veg_sabzi",
        name: "Mixed Vegetable Sabzi — Cooked",
        category: "veggies",
        state: "Cooked",
        searchTerms: "mixed vegetable mix veg carrot beans peas cauliflower",
        description: "Assorted vegetables (beans, carrots, peas, cauliflower) cooked in spices",
        base100g: { calories: 92, protein: 2.5, carbs: 11.5, fat: 4.5 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl / Katori (150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "cucumber_raw",
        name: "Cucumber (Kheera) — Raw Salad",
        category: "veggies",
        state: "Fresh",
        searchTerms: "cucumber kheera salad raw hydration low calorie",
        description: "Fresh raw sliced cucumber, very high water content",
        base100g: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
        servingUnits: [
            { id: "piece", name: "1 Medium Cucumber (~120g)", grams: 120, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 120, isDefault: false }
        ]
    },

    // ==========================================
    // 7. FRUITS
    // ==========================================
    {
        id: "banana_raw",
        name: "Banana (Kela)",
        category: "fruits",
        state: "Fresh",
        searchTerms: "banana kela fruit potassium pre workout energy",
        description: "Fresh ripe banana, rich in fast-digesting carbs and potassium",
        base100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
        servingUnits: [
            { id: "piece", name: "1 Medium Banana (~118g)", grams: 118, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "large", name: "1 Large Banana (~135g)", grams: 135, step: 1, min: 1, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 118, isDefault: false }
        ]
    },
    {
        id: "apple_raw",
        name: "Apple (Seb)",
        category: "fruits",
        state: "Fresh",
        searchTerms: "apple seb fruit fiber antioxidants pectin",
        description: "Whole fresh crisp apple with skin",
        base100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 },
        servingUnits: [
            { id: "piece", name: "1 Medium Apple (~180g)", grams: 180, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 180, isDefault: false }
        ]
    },
    {
        id: "mango_ripe",
        name: "Mango (Aam) — Ripe",
        category: "fruits",
        state: "Fresh",
        searchTerms: "mango aam sweet fruit tropical sliced king of fruits",
        description: "Sweet sliced mango pulp without stone or peel",
        base100g: { calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl Sliced (~150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "piece", name: "1 Whole Mango Pulp (~200g)", grams: 200, step: 1, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "papaya_raw",
        name: "Papaya (Papita) — Ripe",
        category: "fruits",
        state: "Fresh",
        searchTerms: "papaya papita fruit digestive enzyme papain",
        description: "Diced ripe orange papaya cubes",
        base100g: { calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3 },
        servingUnits: [
            { id: "bowl", name: "1 Bowl Diced (~150g)", grams: 150, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 150, isDefault: false }
        ]
    },
    {
        id: "orange_fresh",
        name: "Orange (Santra)",
        category: "fruits",
        state: "Fresh",
        searchTerms: "orange santra citrus fruit vitamin c immune",
        description: "Fresh peeled whole orange segments",
        base100g: { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1 },
        servingUnits: [
            { id: "piece", name: "1 Medium Orange (~130g)", grams: 130, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 25, min: 10, defaultQty: 130, isDefault: false }
        ]
    },
    {
        id: "watermelon_fresh",
        name: "Watermelon (Tarbooz)",
        category: "fruits",
        state: "Fresh",
        searchTerms: "watermelon tarbooz fruit hydration citrulline summer",
        description: "Diced fresh red watermelon flesh without rind",
        base100g: { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
        servingUnits: [
            { id: "bowl", name: "1 Big Bowl (~250g)", grams: 250, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 50, min: 25, defaultQty: 250, isDefault: false }
        ]
    },

    // ==========================================
    // 8. NUTS, SEEDS & HEALTHY FATS
    // ==========================================
    {
        id: "almonds_raw",
        name: "Almonds (Badam) — Raw",
        category: "fats",
        state: "Fresh",
        searchTerms: "almonds badam nuts vitamin e healthy fats snack",
        description: "Whole raw almonds packed with monounsaturated fats and vitamin E",
        base100g: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9 },
        servingUnits: [
            { id: "handful", name: "10 Almonds (~12g)", grams: 12, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "ounce", name: "1 Ounce (~28g / ~23 nuts)", grams: 28, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 5, defaultQty: 12, isDefault: false }
        ]
    },
    {
        id: "walnuts_raw",
        name: "Walnuts (Akhrot)",
        category: "fats",
        state: "Fresh",
        searchTerms: "walnuts akhrot omega 3 brain food nuts",
        description: "Raw walnut halves rich in plant omega-3 (ALA)",
        base100g: { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2 },
        servingUnits: [
            { id: "halves", name: "7 Walnut Halves (~14g)", grams: 14, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "ounce", name: "1 Ounce (~28g)", grams: 28, step: 0.5, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 5, defaultQty: 14, isDefault: false }
        ]
    },
    {
        id: "peanut_butter_creamy",
        name: "Peanut Butter (100% Roasted Peanuts)",
        category: "fats",
        state: "Fresh",
        searchTerms: "peanut butter pintola myfitness spread nuts healthy fats",
        description: "Pure roasted peanut butter with no added sugar or hydrogenated oil",
        base100g: { calories: 588, protein: 25.1, carbs: 20.0, fat: 50.4 },
        servingUnits: [
            { id: "tbsp", name: "1 Tablespoon (16g)", grams: 16, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "tbsp2", name: "2 Tablespoons (32g)", grams: 32, step: 1, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 5, defaultQty: 16, isDefault: false }
        ]
    },
    {
        id: "desi_ghee",
        name: "Desi Ghee (Clarified Butter)",
        category: "fats",
        state: "Cooked",
        searchTerms: "ghee clarified butter desi fat cooking oil",
        description: "Traditional pure clarified butter fat",
        base100g: { calories: 900, protein: 0.0, carbs: 0.0, fat: 99.8 },
        servingUnits: [
            { id: "tsp", name: "1 Teaspoon (5g)", grams: 5, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "tbsp", name: "1 Tablespoon (14g)", grams: 14, step: 1, min: 0.5, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 1, defaultQty: 5, isDefault: false }
        ]
    },
    {
        id: "olive_oil",
        name: "Olive Oil (Extra Virgin)",
        category: "fats",
        state: "Fresh",
        searchTerms: "olive oil extra virgin cooking salad monounsaturated",
        description: "Heart-healthy cold pressed extra virgin olive oil",
        base100g: { calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0 },
        servingUnits: [
            { id: "tbsp", name: "1 Tablespoon (14g)", grams: 14, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "tsp", name: "1 Teaspoon (4.5g)", grams: 4.5, step: 1, min: 1, defaultQty: 1, isDefault: false },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 1, defaultQty: 14, isDefault: false }
        ]
    },

    // ==========================================
    // 9. FITNESS & SUPPLEMENTS
    // ==========================================
    {
        id: "whey_isolate",
        name: "Whey Protein Isolate",
        category: "fitness",
        state: "Fresh",
        searchTerms: "whey isolate protein powder post workout supplement fast digesting",
        description: "Ultra-filtered rapid absorption whey protein with ~90% protein purity",
        base100g: { calories: 370, protein: 87.0, carbs: 2.5, fat: 1.2 },
        servingUnits: [
            { id: "scoop", name: "1 Scoop (30g)", grams: 30, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 5, defaultQty: 30, isDefault: false }
        ]
    },
    {
        id: "whey_concentrate",
        name: "Whey Protein Concentrate (80%)",
        category: "fitness",
        state: "Fresh",
        searchTerms: "whey concentrate protein powder gold standard supplement",
        description: "Standard 80% whey protein with natural immunoglobulins and rich taste",
        base100g: { calories: 400, protein: 78.0, carbs: 8.0, fat: 6.0 },
        servingUnits: [
            { id: "scoop", name: "1 Scoop (32g)", grams: 32, step: 0.5, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "g", name: "Grams (g)", grams: 1, step: 5, min: 5, defaultQty: 32, isDefault: false }
        ]
    },
    {
        id: "coconut_water",
        name: "Coconut Water (Nariyal Pani)",
        category: "fitness",
        state: "Fresh",
        searchTerms: "coconut water nariyal pani hydration natural electrolytes potassium",
        description: "Natural isotonic tender coconut water packed with potassium",
        base100g: { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
        servingUnits: [
            { id: "glass", name: "1 Tender Coconut / Glass (~250ml)", grams: 250, step: 1, min: 1, defaultQty: 1, isDefault: true },
            { id: "ml", name: "Milliliters (ml / g)", grams: 1, step: 50, min: 50, defaultQty: 250, isDefault: false }
        ]
    },
    {
        id: "chai_tea_milk_sugar",
        name: "Indian Chai / Tea (With Milk & 1 tsp Sugar)",
        category: "fitness",
        state: "Cooked",
        searchTerms: "chai tea milk sugar morning beverage adrak elaichi",
        description: "Traditional boiled black tea with toned milk and 1 tsp white sugar",
        base100g: { calories: 55, protein: 1.8, carbs: 8.5, fat: 1.5 },
        servingUnits: [
            { id: "cup", name: "1 Regular Tea Cup (150ml)", grams: 150, step: 1, min: 0.5, defaultQty: 1, isDefault: true },
            { id: "small_cup", name: "1 Cutting Chai (80ml)", grams: 80, step: 1, min: 1, defaultQty: 1, isDefault: false }
        ]
    },
    {
        id: "black_coffee_no_sugar",
        name: "Black Coffee (No Sugar)",
        category: "fitness",
        state: "Cooked",
        searchTerms: "black coffee espresso americano caffeine pre workout zero calorie",
        description: "Fresh brewed black coffee or espresso with zero calories and zero fat",
        base100g: { calories: 2, protein: 0.1, carbs: 0.3, fat: 0.0 },
        servingUnits: [
            { id: "cup", name: "1 Mug / Cup (240ml)", grams: 240, step: 1, min: 1, defaultQty: 1, isDefault: true }
        ]
    }
];

/**
 * Calculates accurate scaled nutritional values for a given food, quantity, and serving unit.
 *
 * @param {object} food - Food object from FOOD_DATABASE
 * @param {number} quantity - Quantity number (e.g. 1, 2, 150)
 * @param {string} unitId - Selected unit ID (e.g. 'piece', 'bowl', 'g')
 * @returns {object} { calories, protein, carbs, fat, totalGrams, unitName, servingLabel }
 */
export function calculateFoodNutrients(food, quantity, unitId) {
    if (!food || !food.base100g) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0, totalGrams: 0, unitName: "", servingLabel: "" };
    }

    const qty = Math.max(0.01, parseFloat(quantity) || 1);
    const selectedUnit = food.servingUnits.find(u => u.id === unitId) || food.servingUnits[0];
    const totalGrams = Math.round(qty * selectedUnit.grams);
    const scale = totalGrams / 100;

    const calories = Math.round(food.base100g.calories * scale);
    const protein = Math.round(food.base100g.protein * scale * 10) / 10;
    const carbs = Math.round(food.base100g.carbs * scale * 10) / 10;
    const fat = Math.round(food.base100g.fat * scale * 10) / 10;

    let servingLabel = "";
    if (selectedUnit.id === "g" || selectedUnit.id === "ml") {
        servingLabel = `${totalGrams}${selectedUnit.id}`;
    } else {
        const countDisplay = Number.isInteger(qty) ? qty : qty.toFixed(1);
        let baseUnit = selectedUnit.name.replace(/^\d+\s*/, '').split(" (")[0].trim();
        if (qty > 1 && !baseUnit.toLowerCase().endsWith('s') && !baseUnit.includes('/')) {
            baseUnit += 's';
        }
        servingLabel = `${countDisplay} ${baseUnit} (~${totalGrams}g)`;
    }

    return {
        calories,
        protein,
        carbs,
        fat,
        totalGrams,
        unitId: selectedUnit.id,
        unitName: selectedUnit.name,
        servingLabel
    };
}
