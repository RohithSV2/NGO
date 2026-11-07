import allNgos from './allNgos.json';

export const INITIAL_NGOS = allNgos;

export const INITIAL_REQUESTS = [
  {
    _id: "req_101",
    title: "Emergency Flood Relief & Clean Drinking Water in Tunga River Basin",
    description: "Over 45 displaced families in low-lying riverside areas requiring dry ration kits, water purification tablets, and emergency shelters.",
    category: "Disaster Relief & Management",
    urgency: "High",
    city: "Shivamogga",
    state: "Karnataka",
    lat: 13.9312,
    lng: 75.5694,
    resolutionOtp: "4829",
    requesterName: "Manjunath Gowda",
    requesterPhone: "9845112233",
    status: "Matched",
    createdAt: "2026-10-28T14:30:00Z",
    matchedNGOs: [
      {
        ngoId: "213",
        name: "The Shimoga Multipurpose Social Service Society",
        category: "Disaster Management",
        city: "Shivamogga",
        matchScore: 94.6,
        contactPhone: "",
        breakdown: { text_similarity: 78, category_match: 100, location_match: 100 }
      },
      {
        ngoId: "212",
        name: "Vishwabharti Trust",
        category: "Disaster Management",
        city: "Shivamogga",
        matchScore: 88.2,
        contactPhone: "",
        breakdown: { text_similarity: 65, category_match: 100, location_match: 100 }
      }
    ]
  },
  {
    _id: "req_102",
    title: "Dry Ration Kits & Drinking Water for Drought-Affected Families",
    description: "Rural families facing severe water scarcity and nutritional shortages in rural taluk. Urgent need for grocery kits and drinking water tanks.",
    category: "Hunger & Food Relief",
    urgency: "Critical",
    city: "Chitradurga",
    state: "Karnataka",
    lat: 14.2250,
    lng: 76.4010,
    resolutionOtp: "3641",
    etaMinutes: 35,
    assignedVolunteer: {
      name: "Deepak Nayak",
      phone: "9880445566",
      domain: "Logistics, Transport & Driving"
    },
    requesterName: "Basavaraj Patil",
    requesterPhone: "9844223344",
    status: "In Progress",
    createdAt: "2026-10-28T18:15:00Z",
    matchedNGOs: [
      {
        ngoId: "1",
        name: "Vivekananda Rural Development Society",
        category: "Rural Development",
        city: "Chitradurga",
        matchScore: 95.8,
        contactPhone: "",
        breakdown: { text_similarity: 82, category_match: 100, location_match: 100 }
      },
      {
        ngoId: "2",
        name: "WEDS- WOMEN AND EDUCATION DEVELOPMENT SOCIETY",
        category: "Agriculture",
        city: "Chitradurga",
        matchScore: 87.4,
        contactPhone: "",
        breakdown: { text_similarity: 62, category_match: 100, location_match: 100 }
      }
    ]
  },
  {
    _id: "req_103",
    title: "School Study Materials & Warm Blankets for Rural Children",
    description: "Primary school students from underprivileged farming families need school notebooks, pencils, geometry kits, and warm sweaters for winter.",
    category: "Education & Literacy",
    urgency: "Medium",
    city: "Davanagere",
    state: "Karnataka",
    lat: 14.4670,
    lng: 75.9230,
    resolutionOtp: "7319",
    otpVerified: true,
    resolutionNotes: "Resolved by Yashaswini mahila educational & rural development trust",
    deliveryPhoto: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
    requesterName: "Suresh Kumar D",
    requesterPhone: "9741556677",
    status: "Resolved",
    resolvedAt: "2026-10-29T22:00:00Z",
    createdAt: "2026-10-27T09:20:00Z",
    matchedNGOs: [
      {
        ngoId: "107",
        name: "Yashaswini mahila educational & rural development trust",
        category: "Education & Literacy",
        city: "Davanagere",
        matchScore: 92.3,
        contactPhone: "",
        breakdown: { text_similarity: 74, category_match: 100, location_match: 100 }
      }
    ]
  },
  {
    _id: "req_104",
    title: "120 Emergency Cooked Food Packets & Drinking Water in Mysuru",
    description: "Monsoon overflow has affected low-lying settlements near Chamundi Foothills, Mysuru. Urgent need for cooked food packets, bottled drinking water, and dry rations for children.",
    category: "Hunger & Food Relief",
    urgency: "High",
    city: "Mysuru",
    state: "Karnataka",
    lat: 12.3051,
    lng: 76.6551,
    resolutionOtp: "9152",
    requesterName: "Siddaraju M",
    requesterPhone: "9845012345",
    requesterEmail: "siddaraju.m@gmail.com",
    status: "Matched",
    createdAt: "2026-10-27T10:30:00Z",
    matchedNGOs: [
      {
        ngoId: "330",
        name: "YOUTH EFFORTS FOR SOCIETY TRUST",
        category: "Aged/Elderly",
        city: "Mysuru",
        matchScore: 93.5,
        contactPhone: "+91 9128678910",
        breakdown: { text_similarity: 85, category_match: 100, location_match: 100 }
      },
      {
        ngoId: "331",
        name: "Vidyasinchana Educational Trust",
        category: "Education & Literacy",
        city: "Mysuru",
        matchScore: 86.0,
        contactPhone: "",
        breakdown: { text_similarity: 70, category_match: 100, location_match: 90 }
      }
    ]
  }
];

export const INITIAL_RATINGS = [];
