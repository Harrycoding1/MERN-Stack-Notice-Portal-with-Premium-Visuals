import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import noticeRoutes from './routes/notices.js';
import { User, Notice } from './models.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Database connection logic
const startServer = async () => {
  let mongoUri = process.env.MONGO_URI;

  // Fallback to In-Memory MongoDB if no MONGO_URI is specified
  if (!mongoUri) {
    console.log('No MONGO_URI specified. Spinning up an in-memory MongoDB Server...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB running at: ${mongoUri}`);
    } catch (err) {
      console.error('Failed to start in-memory MongoDB server.', err);
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.');

    // Seed default administrative credentials and sample notices
    await seedData();

    // Start Express listener
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Check if users exist
    const userCount = await User.countDocuments();
    let seededAdmin;

    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('admin12345', 10);
      seededAdmin = await User.create({
        email: 'admin@unistream.edu',
        password: hashedPassword
      });
      console.log('Database seeded: Default Administrator user created (admin@unistream.edu / admin12345).');
    } else {
      seededAdmin = await User.findOne({ email: 'admin@unistream.edu' });
    }

    // Check if notices exist
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0 && seededAdmin) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 10);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);

      await Notice.create([
        {
          title: 'Mid-Term Exam Schedule - BBA 4th Semester',
          content: 'Mid-term examinations for BBA 4th Semester will commence from June 10, 2026. Detailed schedules and seating plans can be downloaded from the administration vault or requested via email.',
          category: 'URGENT',
          department: 'BBA',
          expiryDate: tomorrow,
          author: seededAdmin._id
        },
        {
          title: 'Guest Lecture: Web Technologies & Industry Trends',
          content: 'The Information Technology department is organizing a workshop on Web Technologies & Next-Gen Frameworks this Thursday at 2:00 PM in Seminar Hall 3. Attendance is highly encouraged for all computer science students.',
          category: 'GENERAL',
          department: 'IT',
          expiryDate: nextWeek,
          author: seededAdmin._id
        },
        {
          title: 'Annual Coding Hackathon - UniHack 2026',
          content: 'Registration is now open for UniStream\'s annual 48-hour programming sprint. Form teams of 2 to 4 students. Massive cash prizes and internship opportunities with leading software houses are available. Last date to register is next Wednesday.',
          category: 'EVENT',
          department: 'All',
          expiryDate: nextMonth,
          author: seededAdmin._id
        },
        {
          title: 'Lab Maintenance & Upgrade Schedule',
          content: 'Engineering computer systems in Labs 4 and 5 will undergo routine hardware upgrades and software licensing updates. These labs will remain closed for student access on Saturday and Sunday.',
          category: 'GENERAL',
          department: 'Engineering',
          expiryDate: nextWeek,
          author: seededAdmin._id
        }
      ]);
      console.log('Database seeded: Default notice listings created.');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

startServer();
