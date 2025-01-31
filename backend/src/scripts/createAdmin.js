require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/config');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  try {
    const result = await db.query(
      'INSERT INTO users (username, password, role, full_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['admin', hashedPassword, 'admin', 'System Admin', 'admin@organization.com']
    );
    
    if (result.rows.length > 0) {
      console.log('Admin user created successfully with ID:', result.rows[0].id);
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    process.exit();
  }
}

createAdmin();
