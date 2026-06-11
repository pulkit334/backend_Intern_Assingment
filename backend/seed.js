if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected to mongo');

  const existing = await User.findOne({ email: 'you@gmail.com' });
  if (existing) {
    console.log('test user already exists');
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash('john123', 12);
  await User.create({ name: 'johndoe', email: 'you@gmail.com', password: hashed });
  console.log('test user created:');
  console.log('  email: you@gmail.com');
  console.log('  pass:  john123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
