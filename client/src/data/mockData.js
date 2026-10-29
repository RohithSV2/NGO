import allNgos from './allNgos.json';

export const INITIAL_NGOS = allNgos;

export const INITIAL_REQUESTS = [
  {
    _id: "req_101",
    title: "Flood Relief Kits & Clean Drinking Water",
    description: "Over 65 displaced families living in temporary shelters after monsoon overflow. Urgent requirement for dry ration packets and drinking water purification tablets.",
    category: "Disaster Relief",
    urgency: "High",
    city: "Chennai",
    state: "Tamil Nadu",
    requesterName: "Ramesh Kannan",
    requesterPhone: "+91-9840123456",
    status: "Matched",
    createdAt: "2026-10-18T14:30:00Z",
    matchedNGOs: [
      {
        ngoId: "8",
        name: "Rapid Response India",
        category: "Disaster Relief",
        city: "Chennai",
        matchScore: 92.4,
        contactPhone: "+91-44-24510000",
        breakdown: { text_similarity: 68, category_match: 100, location_match: 100 }
      },
      {
        ngoId: "1",
        name: "Goonj Disaster Relief",
        category: "Disaster Relief",
        city: "New Delhi",
        matchScore: 78.5,
        contactPhone: "+91-11-26972351",
        breakdown: { text_similarity: 54, category_match: 100, location_match: 50 }
      }
    ]
  },
  {
    _id: "req_102",
    title: "Emergency O-Negative Blood Units Needed",
    description: "Critical trauma patient in ICU at KEM Hospital following major road accident. Requires 3 units of O-negative blood urgently.",
    category: "Healthcare",
    urgency: "Critical",
    city: "Mumbai",
    state: "Maharashtra",
    requesterName: "Dr. Ananya Sharma",
    requesterPhone: "+91-9820543210",
    status: "In Progress",
    createdAt: "2026-10-18T18:15:00Z",
    matchedNGOs: [
      {
        ngoId: "5",
        name: "Red Cross Society Relief",
        category: "Healthcare",
        city: "Mumbai",
        matchScore: 94.8,
        contactPhone: "+91-22-22661524",
        breakdown: { text_similarity: 72, category_match: 100, location_match: 100 }
      },
      {
        ngoId: "10",
        name: "Doctors For You",
        category: "Healthcare",
        city: "Mumbai",
        matchScore: 86.2,
        contactPhone: "+91-22-25550000",
        breakdown: { text_similarity: 58, category_match: 100, location_match: 100 }
      }
    ]
  },
  {
    _id: "req_103",
    title: "School Study Materials & Warm Blankets for 45 Slum Children",
    description: "Community center in Dharavi slum teaching first-generation learners. Needs school notebooks, pencils, geometry boxes, and winter warm blankets.",
    category: "Education",
    urgency: "Medium",
    city: "Mumbai",
    state: "Maharashtra",
    requesterName: "Vikram Patil",
    requesterPhone: "+91-9769812345",
    status: "Resolved",
    resolvedAt: "2026-10-18T22:00:00Z",
    createdAt: "2026-10-17T09:20:00Z",
    matchedNGOs: [
      {
        ngoId: "6",
        name: "Teach For India",
        category: "Education",
        city: "Mumbai",
        matchScore: 89.3,
        contactPhone: "+91-22-65658600",
        breakdown: { text_similarity: 62, category_match: 100, location_match: 100 }
      }
    ]
  },
  {
    _id: "req_104",
    title: "120 Emergency Cooked Food Packets & Drinking Water in Mysuru",
    description: "Monsoon flooding has stranded 35 families in low-lying area near Chamundi Foothills, Mysuru. Urgent need for cooked food packets, bottled drinking water, and dry rations for children.",
    category: "Hunger & Food",
    urgency: "High",
    city: "Mysuru",
    state: "Karnataka",
    requesterName: "Siddaraju M",
    requesterPhone: "9845012345",
    requesterEmail: "siddaraju.m@gmail.com",
    status: "Matched",
    createdAt: "2026-10-27T10:30:00Z",
    matchedNGOs: [
      {
        ngoId: "25",
        name: "Mysuru Relief & Food Care",
        category: "Hunger & Food",
        city: "Mysuru",
        matchScore: 96.5,
        contactPhone: "+91-821-2495000",
        breakdown: { text_similarity: 88, category_match: 100, location_match: 100 }
      },
      {
        ngoId: "2",
        name: "Akshaya Patra Foundation",
        category: "Hunger & Food",
        city: "Bengaluru",
        matchScore: 88.0,
        contactPhone: "+91-80-30143400",
        breakdown: { text_similarity: 78, category_match: 100, location_match: 85 }
      }
    ]
  }
];

export const INITIAL_RATINGS = [];
