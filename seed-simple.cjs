const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  score: { type: Number, default: 0 },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seedUsers() {
  try {
    await mongoose.connect('mongodb+srv://vismayasinghbhati:9Cn4Zrgiyp6A176G@codecrack.estl2qq.mongodb.net/?retryWrites=true&w=majority&appName=CodeCrack');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test users with different scores
    const users = [
      { name: 'Alice Johnson', email: 'alice@test.com', score: 250 },
      { name: 'Bob Smith', email: 'bob@test.com', score: 180 },
      { name: 'Charlie Brown', email: 'charlie@test.com', score: 320 },
      { name: 'Diana Prince', email: 'diana@test.com', score: 150 },
      { name: 'Ethan Hunt', email: 'ethan@test.com', score: 400 }
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        role: 'user'
      });
      await user.save();
      console.log(`Created user: ${userData.name} with score ${userData.score}`);
    }

    console.log('Database seeded successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedUsers();
