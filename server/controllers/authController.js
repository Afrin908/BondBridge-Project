const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
// };
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// // @route POST /api/auth/register
// const registerUser = async (req, res) => {
//   const { name, email, password, age, gender } = req.body;
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });

//     const user = await User.create({ name, email, password, age, gender });
//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       isAdmin: user.isAdmin,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// ─── REGISTER USER ────────────────────────────────────────────────────
// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, age, gender } = req.body;

    console.log('Register request body received:', req.body);

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user (plain password → pre-save hook will hash it)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,                    // plain text
      age: age ? Number(age) : undefined,
      gender,
    });

    console.log('User created successfully! ID:', user._id);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error('❌ Register error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ 
      message: 'Registration failed. Please try again.' 
    });
  }
};
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  photo: user.photo,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
  verificationStatus: user.verificationStatus,
  token: generateToken(user),
});
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };

// ─── REGISTER ────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, name, email, gender, age, password, confirmPassword } = req.body;

    // Use whichever name field the frontend actually sends
    const userFullName = fullName || name || "Unknown User";

    console.log('📥 Register request body received:', req.body);

    // Basic validation
    if (!userFullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password here (more reliable than relying only on pre-save)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with defaults for required fields that form doesn't provide
    const user = await User.create({
      fullName: userFullName,
      email: email.toLowerCase(),
      department: "General",        // ← Temporary default (you can change later)
      jobTitle: "Employee",         // ← Temporary default
      password: hashedPassword,     // Send already hashed password
      gender,
      age: age ? Number(age) : undefined,
      role: 'employee'
    });

    console.log('✅ User created successfully:', user._id);

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        gender: user.gender,
        age: user.age,
      },
    });
  } catch (error) {
    console.error('❌ Register error details:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      error: error.message 
    });
  }
};