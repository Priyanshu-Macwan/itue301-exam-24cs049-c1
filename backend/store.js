const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const memberPass = bcrypt.hashSync('password123', salt);
const adminPass = bcrypt.hashSync('admin123', salt);

const members = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Alex Johnson',
    email: 'member@fitness.com',
    password: memberPass,
    role: 'member',
    membershipType: 'VIP',
    createdAt: new Date()
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d2',
    name: 'Sarah Connor (Admin)',
    email: 'admin@fitness.com',
    password: adminPass,
    role: 'admin',
    membershipType: 'VIP',
    createdAt: new Date()
  }
];

const trainers = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0t1',
    name: 'Marcus Vance',
    specialization: 'HIIT & Cardio',
    bio: 'Elite strength & conditioning coach with 8+ years experience turning goals into raw power.',
    experienceYears: 8,
    rating: 4.95,
    hourlyRate: 75,
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    availableSlots: [
      { day: 'Mon & Wed', time: '08:00 AM - 10:00 AM' },
      { day: 'Tue & Thu', time: '05:00 PM - 07:00 PM' }
    ],
    status: 'Active'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0t2',
    name: 'Elena Rostova',
    specialization: 'Yoga & Mindfulness',
    bio: 'Certified Vinyasa & Ashtanga master focused on mobility, core stability, and holistic mind-body harmony.',
    experienceYears: 6,
    rating: 4.98,
    hourlyRate: 65,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    availableSlots: [
      { day: 'Daily', time: '07:00 AM - 09:00 AM' },
      { day: 'Sat & Sun', time: '10:00 AM - 12:00 PM' }
    ],
    status: 'Active'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0t3',
    name: 'Darius Thorne',
    specialization: 'Strength & Bodybuilding',
    bio: 'Former powerlifting competitor specializing in progressive overload, hypertrophy, and posture alignment.',
    experienceYears: 10,
    rating: 4.91,
    hourlyRate: 85,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    availableSlots: [
      { day: 'Mon, Wed, Fri', time: '06:00 AM - 09:00 AM' },
      { day: 'Tue & Thu', time: '04:00 PM - 08:00 PM' }
    ],
    status: 'Active'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0t4',
    name: 'Maya Lin',
    specialization: 'Pilates & Core',
    bio: 'Precision Pilates specialist obsessed with postural mechanics, movement control, and lean muscular tone.',
    experienceYears: 7,
    rating: 4.94,
    hourlyRate: 70,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    availableSlots: [
      { day: 'Mon to Fri', time: '09:00 AM - 11:00 AM' }
    ],
    status: 'Active'
  }
];

const classBookings = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0c1',
    title: 'Extreme HIIT Burnout',
    category: 'HIIT',
    trainer: trainers[0],
    date: '2026-08-25',
    timeSlot: '08:00 AM - 09:00 AM',
    location: 'Studio A - High Tech Zone',
    capacity: 15,
    bookedMembers: [{ memberId: members[0]._id, bookedAt: new Date() }],
    status: 'Scheduled'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0c2',
    title: 'Morning Vinyasa Flow & Zen',
    category: 'Yoga',
    trainer: trainers[1],
    date: '2026-08-25',
    timeSlot: '07:00 AM - 08:15 AM',
    location: 'Zen Sanctuary Studio',
    capacity: 20,
    bookedMembers: [],
    status: 'Scheduled'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0c3',
    title: 'Hyper-Strength Hypertrophy',
    category: 'Strength',
    trainer: trainers[2],
    date: '2026-08-26',
    timeSlot: '05:00 PM - 06:30 PM',
    location: 'Iron Pit Gym Floor',
    capacity: 12,
    bookedMembers: [{ memberId: members[0]._id, bookedAt: new Date() }],
    status: 'Scheduled'
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0c4',
    title: 'Core Sculpt & Reformer Pilates',
    category: 'Pilates',
    trainer: trainers[3],
    date: '2026-08-26',
    timeSlot: '10:00 AM - 11:00 AM',
    location: 'Studio B - Reformer Room',
    capacity: 10,
    bookedMembers: [],
    status: 'Scheduled'
  }
];

module.exports = {
  members,
  trainers,
  classBookings
};
