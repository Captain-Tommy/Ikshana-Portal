require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');

async function createAdmin() {
  try {
    // Check if admin already exists
    const adminSnapshot = await db.collection('users')
      .where('username', '==', 'admin')
      .get();

    if (!adminSnapshot.empty) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminRef = await db.collection('users').add({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      full_name: 'System Admin',
      email: 'admin@organization.com',
      created_at: new Date()
    });

    console.log('Admin user created successfully with ID:', adminRef.id);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdmin();
