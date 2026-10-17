// DEMO DATA ONLY: these seeded records reproduce the original HTML prototype.
// Replace data access with backend API calls once Flask/PostgreSQL are ready.
export const initialDemoState = {
      view: "landing",
      page: "dashboard",
      authMode: "login",
      user: { fullName: "Aarav Mehta", email: "aarav@example.test", mealsyncId: "aarav.m", phone: "+91 98765 43210", roles: ["volunteer", "donor", "organization", "kitchen"], city: "Mumbai", bio: "Helping local food initiatives run smoothly." },
      activeRole: "for-you",
      menuOpen: false,
      eventFilter: "all",
      kitchenFilter: "all",
      activeKitchenId: 1,
      nextEventId: 108,
      nextDonationId: 6,
      nextScheduleId: 6,
      registeredEventIds: [102],
      referrals: [],
      activity: [],
      events: [
        { id: 101, title: "Community Lunch Service", org: "Seva Neighbourhood Network", category: "Meal service", place: "Govandi, Mumbai", date: "Sat, 17 Oct", isoDate: "2026-10-17", start: "09:00 AM", end: "01:00 PM", start24: "09:00", end24: "13:00", volunteers: 6, needed: 10, meals: 420, icon: "🥘", tone: "orange", score: 98, skills: ["Food packing", "Distribution"], status: "Published", description: "Help portion fresh meals, pack takeaway boxes, and coordinate distribution with the local team." },
        { id: 102, title: "Evening Meal Prep", org: "Helping Hands Kitchen", category: "Meal preparation", place: "Andheri East, Mumbai", date: "Sun, 18 Oct", isoDate: "2026-10-18", start: "03:00 PM", end: "07:00 PM", start24: "15:00", end24: "19:00", volunteers: 4, needed: 6, meals: 300, icon: "🍲", tone: "green", score: 95, skills: ["Cooking", "Cleaning"], status: "Published", description: "Prepare dal, rice and seasonal sabzi for the evening meal service. Basic kitchen experience is helpful but not required." },
        { id: 103, title: "Weekend Grocery Sorting", org: "Annapurna Community Trust", category: "Food packing", place: "Dadar West, Mumbai", date: "Sun, 18 Oct", isoDate: "2026-10-18", start: "10:00 AM", end: "12:30 PM", start24: "10:00", end24: "12:30", volunteers: 8, needed: 12, meals: 0, icon: "🥬", tone: "blue", score: 89, skills: ["Food packing", "Cleaning"], status: "Published", description: "Sort donated grains and vegetables, inspect packaging, and prepare ingredient kits for partner kitchens." },
        { id: 104, title: "Sunday Langar Support", org: "Seva Langar Centre", category: "Community meal", place: "Bandra West, Mumbai", date: "Sun, 18 Oct", isoDate: "2026-10-18", start: "07:30 AM", end: "11:30 AM", start24: "07:30", end24: "11:30", volunteers: 14, needed: 18, meals: 700, icon: "🫓", tone: "purple", score: 84, skills: ["Cooking", "Distribution"], status: "Published", description: "Support ingredient preparation, chapati distribution and clean-up during a community meal." },
        { id: 105, title: "Meal Kit Delivery Route", org: "CareCircle Foundation", category: "Food distribution", place: "Kurla, Mumbai", date: "Tue, 20 Oct", isoDate: "2026-10-20", start: "11:00 AM", end: "02:00 PM", start24: "11:00", end24: "14:00", volunteers: 3, needed: 5, meals: 180, icon: "🚲", tone: "green", score: 82, skills: ["Driving", "Distribution"], status: "Published", description: "Help deliver sealed meal kits to registered residents. A two-wheeler or car is useful but not mandatory." },
        { id: 106, title: "Nutrition Drive: Family Packs", org: "Udaan Food Collective", category: "Food packing", place: "Thane West, Maharashtra", date: "Wed, 21 Oct", isoDate: "2026-10-21", start: "09:30 AM", end: "01:00 PM", start24: "09:30", end24: "13:00", volunteers: 9, needed: 12, meals: 260, icon: "🧺", tone: "orange", score: 77, skills: ["Food packing"], status: "Published", description: "Assemble dry-ration packs, label each box and help the coordinators prepare an orderly hand-off." }
      ],
      kitchens: [
        { id: 1, name: "Helping Hands Kitchen", org: "Helping Hands Kitchen Collective", place: "Andheri East, Mumbai", capacity: 650, mealsToday: 480, status: "Verified", tone: "green", icon: "🍲", hours: "06:00 AM – 08:00 PM" },
        { id: 2, name: "Seva Community Kitchen", org: "Seva Neighbourhood Network", place: "Govandi, Mumbai", capacity: 900, mealsToday: 720, status: "Verified", tone: "blue", icon: "🥘", hours: "05:30 AM – 07:00 PM" },
        { id: 3, name: "Annapurna Meal Centre", org: "Independent community kitchen", place: "Dadar West, Mumbai", capacity: 420, mealsToday: 310, status: "Pending verification", tone: "purple", icon: "🫓", hours: "07:00 AM – 06:00 PM" }
      ],
      inventory: [
        { id: 1, ingredient: "Rice", category: "Grains", unit: "kg", quantity: 82, threshold: 25, icon: "🌾" },
        { id: 2, ingredient: "Wheat flour", category: "Grains", unit: "kg", quantity: 18, threshold: 20, icon: "🌾" },
        { id: 3, ingredient: "Toor dal", category: "Pulses", unit: "kg", quantity: 24, threshold: 12, icon: "🫘" },
        { id: 4, ingredient: "Potatoes", category: "Vegetables", unit: "kg", quantity: 31, threshold: 15, icon: "🥔" },
        { id: 5, ingredient: "Cooking oil", category: "Essentials", unit: "L", quantity: 8, threshold: 10, icon: "🫙" },
        { id: 6, ingredient: "Tomatoes", category: "Vegetables", unit: "kg", quantity: 9, threshold: 8, icon: "🍅" },
        { id: 7, ingredient: "Onions", category: "Vegetables", unit: "kg", quantity: 27, threshold: 12, icon: "🧅" }
      ],
      recipes: [
        { id: 1, name: "Dal Rice", category: "Staple meal", servings: 100, time: "55 min", icon: "🍛", ingredients: [{ name: "Rice", amount: 0.1, unit: "kg" }, { name: "Toor dal", amount: 0.05, unit: "kg" }, { name: "Cooking oil", amount: 0.008, unit: "L" }] },
        { id: 2, name: "Roti Sabzi", category: "Staple meal", servings: 100, time: "65 min", icon: "🫓", ingredients: [{ name: "Wheat flour", amount: 0.09, unit: "kg" }, { name: "Potatoes", amount: 0.08, unit: "kg" }, { name: "Cooking oil", amount: 0.01, unit: "L" }] },
        { id: 3, name: "Vegetable Khichdi", category: "One-pot meal", servings: 80, time: "45 min", icon: "🥣", ingredients: [{ name: "Rice", amount: 0.075, unit: "kg" }, { name: "Toor dal", amount: 0.035, unit: "kg" }, { name: "Tomatoes", amount: 0.025, unit: "kg" }] }
      ],
      chefs: [
        { id: 1, name: "Meera Joshi", role: "Head chef", initials: "MJ" },
        { id: 2, name: "Rohan Patil", role: "Prep & grains", initials: "RP" },
        { id: 3, name: "Farah Khan", role: "Vegetables & sabzi", initials: "FK" },
        { id: 4, name: "Kiran Shah", role: "Packing lead", initials: "KS" }
      ],
      schedules: [
        { id: 1, date: "2026-10-17", start: "06:30", end: "08:00", recipeId: 1, servings: 300, actual: null, chefs: [1, 2], status: "Planned" },
        { id: 2, date: "2026-10-17", start: "08:00", end: "09:30", recipeId: 2, servings: 180, actual: null, chefs: [1, 3], status: "Planned" },
        { id: 3, date: "2026-10-17", start: "11:00", end: "12:00", recipeId: 3, servings: 120, actual: null, chefs: [2, 3, 4], status: "Planned" },
        { id: 4, date: "2026-10-16", start: "06:30", end: "07:30", recipeId: 1, servings: 450, actual: 438, chefs: [1, 2], status: "Completed" },
        { id: 5, date: "2026-10-16", start: "08:30", end: "09:30", recipeId: 2, servings: 200, actual: 207, chefs: [1, 3, 4], status: "Completed" }
      ],
      demands: [
        { date: "2026-10-12", estimated: 430, actual: 417 }, { date: "2026-10-13", estimated: 450, actual: 462 },
        { date: "2026-10-14", estimated: 470, actual: 455 }, { date: "2026-10-15", estimated: 460, actual: 481 },
        { date: "2026-10-16", estimated: 500, actual: 488 }
      ],
      donations: [
        { id: 1, request: "Rice & pulses for 500 meals", recipient: "Helping Hands Kitchen", type: "Ingredients", quantity: "25 kg rice", value: "—", status: "Received", date: "14 Oct 2026" },
        { id: 2, request: "Community lunch support", recipient: "Seva Neighbourhood Network", type: "Money", quantity: "—", value: "₹2,000", status: "Recorded", date: "10 Oct 2026" },
        { id: 3, request: "Cooking oil restock", recipient: "Helping Hands Kitchen", type: "Ingredients", quantity: "5 L oil", value: "—", status: "In transit", date: "09 Oct 2026" }
      ],
      donationRequests: [
        { id: 1, title: "Rice & pulses for 500 meals", recipient: "Helping Hands Kitchen", place: "Andheri East, Mumbai", type: "Ingredients", need: "40 kg rice · 15 kg dal", progress: 63, deadline: "20 Oct", icon: "🌾", tone: "green" },
        { id: 2, title: "Cooking oil restock", recipient: "Seva Neighbourhood Network", place: "Govandi, Mumbai", type: "Ingredients", need: "18 L cooking oil", progress: 42, deadline: "19 Oct", icon: "🫙", tone: "orange" },
        { id: 3, title: "Sponsor a community lunch", recipient: "Annapurna Community Trust", place: "Dadar West, Mumbai", type: "Money", need: "₹8,000 target", progress: 71, deadline: "22 Oct", icon: "💚", tone: "blue" }
      ],
      kitchenRequests: [
        { id: 1, eventId: 103, kitchenId: 1, requester: "Annapurna Community Trust", date: "18 Oct", status: "Pending", note: "Can your team support prep space for 2 hours?" },
        { id: 2, eventId: 104, kitchenId: 1, requester: "Seva Langar Centre", date: "18 Oct", status: "Pending", note: "Requesting 4 volunteers for packing and clean-up." },
        { id: 3, eventId: 101, kitchenId: 1, requester: "Seva Neighbourhood Network", date: "17 Oct", status: "Accepted", note: "Meal packing and distribution support." }
      ],
      surplus: [{ date: "15 Oct", recipe: "Dal Rice", servings: 24, action: "Shared with shelter" }, { date: "13 Oct", recipe: "Roti Sabzi", servings: 12, action: "Distributed to volunteers" }],
      wastage: [{ date: "15 Oct", item: "Tomatoes", quantity: "1.2 kg", reason: "Preparation waste" }, { date: "12 Oct", item: "Dal Rice", quantity: "8 servings", reason: "Overproduction" }]
    };

export const roleInfo = {
  volunteer: { label: "Volunteer", icon: "🤝", desc: "Find meaningful ways to help." },
  donor: { label: "Donor", icon: "💚", desc: "Support food initiatives with resources." },
  organization: { label: "Organization", icon: "🏢", desc: "Coordinate events and kitchen partners." },
  kitchen: { label: "Community Kitchen", icon: "🍲", desc: "Coordinate food service and kitchen resources." }
};

export const pageLabels = {
  dashboard: "For you", volunteer: "Volunteer workspace", donor: "Donor workspace", organizer: "Organization workspace",
  kitchens: "Kitchen workspace", events: "Events & registrations", opportunities: "Opportunity discovery",
  inventory: "Ingredient inventory", "meal-planner": "Meal planner", recipes: "Recipe library", analytics: "Kitchen analytics", profile: "Your profile"
};

// External opportunities are synthetic examples; production should import permitted public listings or organization-submitted events.
export const demoExternalOpportunities = [
  { id: "ext-1", title: "Pack dry-ration kits", org: "Mitr Community Network", category: "Food packing", place: "Mumbai", date: "Sat, 24 Oct", source: "Mitr (sample listing)", kind: "external", icon: "🧺", tone: "orange", skills: ["Food packing"] },
  { id: "ext-2", title: "Weekend meal distribution", org: "Seva Volunteer Circle", category: "Food distribution", place: "Pune", date: "Sun, 25 Oct", source: "Community listing (sample)", kind: "external", icon: "🥘", tone: "green", skills: ["Distribution"] },
  { id: "ext-3", title: "Kitchen cleanup support", org: "Neighbourhood Food Collective", category: "Cleaning", place: "Navi Mumbai", date: "Sun, 25 Oct", source: "Organization submission (sample)", kind: "external", icon: "🧽", tone: "blue", skills: ["Cleaning"] }
];
