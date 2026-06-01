const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const demoDocs = (seed) => ({
  nidFront: `https://placehold.co/640x400/F5F5F3/111111?text=NID+Front+${seed}`,
  nidBack: `https://placehold.co/640x400/F5F5F3/111111?text=NID+Back+${seed}`,
  selfieWithNid: `https://placehold.co/640x400/F5F5F3/111111?text=Selfie+With+NID+${seed}`,
});

const now = new Date();
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const users = [
  {
    name: 'Trust Safety Admin',
    email: 'admin@gmail.com',
    password: '123456',
    employeeId: 'BB-ADMIN-001',
    userType: 'employee',
    organization: 'BondBridge HQ',
    department: 'Trust & Safety',
    roleTitle: 'Platform Administrator',
    profession: 'Trust & Safety Manager',
    occupation: 'Administrator',
    location: 'Dhaka',
    workMode: 'hybrid',
    bio: 'Responsible for identity verification reviews, secure community governance, and platform safety operations.',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    skills: ['Identity Review', 'Platform Governance', 'Risk Operations'],
    expertiseAreas: ['Verification workflow', 'User safety', 'Admin review'],
    interests: ['Technology', 'Policy', 'Operations'],
    collaborationGoals: ['Keep BondBridge safe', 'Review verification submissions'],
    communicationPreferences: ['Secure messages', 'Email'],
    availabilityStatus: 'available',
    privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' },
    verificationStatus: 'verified',
    verificationDocuments: demoDocs('Admin'),
    verificationNote: 'Seed admin verified by system.',
    verificationSubmittedAt: daysAgo(20),
    verifiedAt: daysAgo(20),
    profileCompletion: 100,
    lastActive: now,
    isAdmin: true,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Samanta Rahman', email: 'samanta@demo.com', password: '123456', employeeId: 'BB-EMP-101', userType: 'employee', organization: 'NexaSoft Ltd.', department: 'Engineering', roleTitle: 'Frontend Engineer', profession: 'Software Engineer', occupation: 'Engineer', location: 'Dhaka', workMode: 'hybrid', bio: 'Frontend engineer focused on accessible dashboards and polished user experience.', photo: 'https://randomuser.me/api/portraits/women/11.jpg', skills: ['Frontend Development', 'UI/UX Design'], expertiseAreas: ['React', 'Design systems'], interests: ['Technology', 'Reading'], collaborationGoals: ['Build better internal tools'], communicationPreferences: ['Secure messages', 'Async updates'], availabilityStatus: 'available', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'verified', verificationDocuments: demoDocs('Samanta'), verificationNote: 'Verified from seed data.', verificationSubmittedAt: daysAgo(18), verifiedAt: daysAgo(17), profileCompletion: 96, lastActive: daysAgo(1), isVerified: true, isActive: true,
  },
  {
    name: 'Fahim Rahman', email: 'fahim@demo.com', password: '123456', employeeId: 'BB-EMP-102', userType: 'employee', organization: 'BuildGrid', department: 'Operations', roleTitle: 'Project Coordinator', profession: 'Civil Engineer', occupation: 'Coordinator', location: 'Dhaka', workMode: 'onsite', bio: 'Coordinates field operations, client updates, and project handover documentation.', photo: 'https://randomuser.me/api/portraits/men/15.jpg', skills: ['Project Management', 'Operations'], expertiseAreas: ['Site coordination', 'Client reporting'], interests: ['Cricket', 'Documentation'], collaborationGoals: ['Improve project communication'], communicationPreferences: ['Email', 'Quick sync'], availabilityStatus: 'focused', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'pending', verificationDocuments: demoDocs('Fahim'), verificationNote: 'Identity verification requested by user.', verificationSubmittedAt: daysAgo(2), profileCompletion: 88, lastActive: now, isVerified: false, isActive: true,
  },
  {
    name: 'Meherunnesa Islam', email: 'meherunnesa@demo.com', password: '123456', employeeId: 'BB-CLI-201', userType: 'client', organization: 'MediCore Clinic', department: 'Healthcare', roleTitle: 'Medical Consultant', profession: 'Doctor', occupation: 'Consultant', location: 'Chittagong', workMode: 'onsite', bio: 'Healthcare consultant supporting partner communication and service delivery review.', photo: 'https://randomuser.me/api/portraits/women/32.jpg', skills: ['Customer Success', 'Operations'], expertiseAreas: ['Healthcare workflow', 'Patient communication'], interests: ['Travel', 'Cooking'], collaborationGoals: ['Coordinate service improvements'], communicationPreferences: ['Video call', 'Email'], availabilityStatus: 'busy', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'pending', verificationDocuments: demoDocs('Meherunnesa'), verificationNote: 'Please review professional identity documents.', verificationSubmittedAt: daysAgo(1), profileCompletion: 92, lastActive: daysAgo(1), isVerified: false, isActive: true,
  },
  {
    name: 'Mubasshir Islam', email: 'mubasshir@demo.com', password: '123456', employeeId: 'BB-EMP-103', userType: 'employee', organization: 'FinEdge Analytics', department: 'Finance', roleTitle: 'Business Analyst', profession: 'Business Analyst', occupation: 'Analyst', location: 'Sylhet', workMode: 'remote', bio: 'Business analyst working with financial reporting, KPI review, and stakeholder communication.', photo: 'https://randomuser.me/api/portraits/men/22.jpg', skills: ['Finance', 'Data Analysis'], expertiseAreas: ['KPI dashboards', 'Financial models'], interests: ['Travel', 'Finance'], collaborationGoals: ['Improve executive reporting'], communicationPreferences: ['Async updates', 'Email'], availabilityStatus: 'available', privacy: { showPhoto: 'verified', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'verified', verificationDocuments: demoDocs('Mubasshir'), verificationNote: 'Verified from seed data.', verificationSubmittedAt: daysAgo(14), verifiedAt: daysAgo(13), profileCompletion: 94, lastActive: daysAgo(3), isVerified: true, isActive: true,
  },
  {
    name: 'Priya Das', email: 'priya@demo.com', password: '123456', employeeId: 'BB-VEN-301', userType: 'vendor', organization: 'PixelForge Studio', department: 'Design', roleTitle: 'Brand Designer', profession: 'Graphic Designer', occupation: 'Designer', location: 'Dhaka', workMode: 'hybrid', bio: 'Vendor-side brand designer helping teams create professional communication materials.', photo: 'https://randomuser.me/api/portraits/women/45.jpg', skills: ['UI/UX Design', 'Marketing'], expertiseAreas: ['Brand systems', 'Presentation design'], interests: ['Art', 'Culture'], collaborationGoals: ['Support campaign visuals'], communicationPreferences: ['Project channel', 'Email'], availabilityStatus: 'available', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'unverified', verificationDocuments: { nidFront: '', nidBack: '', selfieWithNid: '' }, verificationNote: '', profileCompletion: 78, lastActive: daysAgo(4), isVerified: false, isActive: true,
  },
  {
    name: 'Arijit Roy', email: 'arijit@demo.com', password: '123456', employeeId: 'BB-PAR-401', userType: 'partner', organization: 'CareLink Pharmacy', department: 'Partner Operations', roleTitle: 'Partner Success Lead', profession: 'Pharmacist', occupation: 'Lead', location: 'Khulna', workMode: 'onsite', bio: 'Partner lead managing supply updates and operational alignment.', photo: 'https://randomuser.me/api/portraits/men/44.jpg', skills: ['Operations', 'Customer Success'], expertiseAreas: ['Partner coordination', 'Inventory communication'], interests: ['Science', 'Documentaries'], collaborationGoals: ['Reduce support delays'], communicationPreferences: ['Secure messages', 'Quick sync'], availabilityStatus: 'focused', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'rejected', verificationDocuments: demoDocs('Arijit'), verificationNote: 'Submitted image was unclear. Please resubmit clearer documents.', verificationSubmittedAt: daysAgo(6), verifiedAt: null, profileCompletion: 84, lastActive: daysAgo(2), isVerified: false, isActive: true,
  },
  {
    name: 'Asha Akter', email: 'asha@demo.com', password: '123456', employeeId: 'BB-EXT-501', userType: 'external', organization: 'GreenField Research', department: 'Research', roleTitle: 'Research Assistant', profession: 'Student', occupation: 'Research Assistant', location: 'Mymensingh', workMode: 'hybrid', bio: 'External research collaborator focused on sustainability and agricultural impact data.', photo: 'https://randomuser.me/api/portraits/women/55.jpg', skills: ['Data Analysis', 'Operations'], expertiseAreas: ['Research data', 'Field coordination'], interests: ['Sustainability', 'Agriculture'], collaborationGoals: ['Support research collaboration'], communicationPreferences: ['Async updates', 'Email'], availabilityStatus: 'away', privacy: { showPhoto: 'connected', showContact: 'connected', showFullName: 'connected' }, verificationStatus: 'unverified', verificationDocuments: { nidFront: '', nidBack: '', selfieWithNid: '' }, verificationNote: '', profileCompletion: 80, lastActive: daysAgo(8), isVerified: false, isActive: true,
  },
  {
    name: 'Arif Hossain', email: 'arif@demo.com', password: '123456', employeeId: 'BB-EMP-104', userType: 'employee', organization: 'MarketPulse', department: 'Marketing', roleTitle: 'Marketing Manager', profession: 'Marketing Manager', occupation: 'Manager', location: 'Dhaka', workMode: 'hybrid', bio: 'Marketing manager coordinating campaign planning, partner communication, and content approvals.', photo: 'https://randomuser.me/api/portraits/men/61.jpg', skills: ['Marketing', 'Project Management'], expertiseAreas: ['Campaign planning', 'Stakeholder alignment'], interests: ['Communication', 'Strategy'], collaborationGoals: ['Launch integrated campaigns'], communicationPreferences: ['Project channel', 'Quick sync'], availabilityStatus: 'busy', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'verified', verificationDocuments: demoDocs('Arif'), verificationNote: 'Verified from seed data.', verificationSubmittedAt: daysAgo(12), verifiedAt: daysAgo(11), profileCompletion: 98, lastActive: daysAgo(1), isVerified: true, isActive: true,
  },
  {
    name: 'Nadia Chowdhury', email: 'nadia@demo.com', password: '123456', employeeId: 'BB-EMP-105', userType: 'employee', organization: 'MediCore Clinic', department: 'Operations', roleTitle: 'Medical Operations Officer', profession: 'Medical Officer', occupation: 'Officer', location: 'Dhaka', workMode: 'onsite', bio: 'Operations officer managing clinic workflows and verified partner coordination.', photo: 'https://randomuser.me/api/portraits/women/68.jpg', skills: ['Operations', 'Customer Success'], expertiseAreas: ['Service operations', 'Workflow improvement'], interests: ['Baking', 'Healthcare'], collaborationGoals: ['Improve patient support process'], communicationPreferences: ['Email', 'Video call'], availabilityStatus: 'available', privacy: { showPhoto: 'public', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'pending', verificationDocuments: demoDocs('Nadia'), verificationNote: 'Identity verification requested by user.', verificationSubmittedAt: now, profileCompletion: 90, lastActive: now, isVerified: false, isActive: true,
  },
  {
    name: 'Daniel Thomas', email: 'daniel@demo.com', password: '123456', employeeId: 'BB-EMP-106', userType: 'employee', organization: 'CloudAxis', department: 'IT', roleTitle: 'IT Consultant', profession: 'IT Consultant', occupation: 'Consultant', location: 'Dhaka', workMode: 'remote', bio: 'IT consultant supporting secure system rollout and technical onboarding.', photo: 'https://randomuser.me/api/portraits/men/77.jpg', skills: ['Backend Development', 'Cybersecurity'], expertiseAreas: ['System integration', 'Security review'], interests: ['Football', 'Technology'], collaborationGoals: ['Improve onboarding security'], communicationPreferences: ['Secure messages', 'Async updates'], availabilityStatus: 'focused', privacy: { showPhoto: 'verified', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'verified', verificationDocuments: demoDocs('Daniel'), verificationNote: 'Verified from seed data.', verificationSubmittedAt: daysAgo(9), verifiedAt: daysAgo(8), profileCompletion: 95, lastActive: daysAgo(2), isVerified: true, isActive: true,
  },
  {
    name: 'Shilpa Begum', email: 'shilpa@demo.com', password: '123456', employeeId: 'BB-EMP-107', userType: 'employee', organization: 'LegalBridge Associates', department: 'Legal', roleTitle: 'Junior Legal Associate', profession: 'Legal Associate', occupation: 'Associate', location: 'Barisal', workMode: 'hybrid', bio: 'Junior legal associate supporting document review and internal policy research.', photo: 'https://randomuser.me/api/portraits/women/79.jpg', skills: ['Legal', 'Operations'], expertiseAreas: ['Policy review', 'Contract notes'], interests: ['Law', 'Reading'], collaborationGoals: ['Support compliance documentation'], communicationPreferences: ['Email', 'Async updates'], availabilityStatus: 'away', privacy: { showPhoto: 'connected', showContact: 'hidden', showFullName: 'connected' }, verificationStatus: 'unverified', verificationDocuments: { nidFront: '', nidBack: '', selfieWithNid: '' }, verificationNote: '', profileCompletion: 76, lastActive: daysAgo(7), isVerified: false, isActive: false,
  },
    {
    name: 'Daniel De souza', email: 'souza@demo.com', password: '123456', employeeId: 'BB-EMP-106', userType: 'employee', organization: 'CloudAxis', department: 'IT', roleTitle: 'IT Consultant', profession: 'IT Consultant', occupation: 'Consultant', location: 'Dhaka', workMode: 'remote', bio: 'IT consultant supporting secure system rollout and technical onboarding.', photo: 'https://randomuser.me/api/portraits/men/77.jpg', skills: ['Backend Development', 'Cybersecurity'], expertiseAreas: ['System integration', 'Security review'], interests: ['Football', 'Technology'], collaborationGoals: ['Improve onboarding security'], communicationPreferences: ['Secure messages', 'Async updates'], availabilityStatus: 'focused', privacy: { showPhoto: 'verified', showContact: 'connected', showFullName: 'public' }, verificationStatus: 'verified', verificationDocuments: demoDocs('Daniel'), verificationNote: 'Verified from seed data.', verificationSubmittedAt: daysAgo(9), verifiedAt: daysAgo(8), profileCompletion: 95, lastActive: daysAgo(2), isVerified: true, isActive: true,
  },
  {
    name: 'Shizuka Costa', email: 'shizuka@demo.com', password: '123456', employeeId: 'BB-EMP-107', userType: 'employee', organization: 'LegalBridge Associates', department: 'Legal', roleTitle: 'Medical Operations Officer', profession: 'Medical Officer', occupation: 'Officer', location: 'Khulna', workMode: 'hybrid', bio: 'Junior legal associate supporting document review and internal policy research.', photo: 'https://randomuser.me/api/portraits/women/79.jpg', skills: ['Legal', 'Operations'], expertiseAreas: ['Policy review', 'Contract notes'], interests: ['Law', 'Reading'], collaborationGoals: ['Support compliance documentation'], communicationPreferences: ['Email', 'Async updates'], availabilityStatus: 'away', privacy: { showPhoto: 'connected', showContact: 'hidden', showFullName: 'connected' }, verificationStatus: 'unverified', verificationDocuments: { nidFront: '', nidBack: '', selfieWithNid: '' }, verificationNote: '', profileCompletion: 76, lastActive: daysAgo(7), isVerified: false, isActive: false,
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await User.deleteMany();
    await User.create(users);

    console.log('Seed data inserted successfully');
    console.log('Admin login: admin@gmail.com / 123456');
    console.log('Demo user login: Samanta@demo.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
