require('dotenv').config();
const db = require('../db/config');

async function checkUser() {
  try {
    const result = await db.query('SELECT id, username, role, full_name, email FROM users WHERE username = $1', ['admin']);
    if (result.rows.length > 0) {
      console.log('User details:', result.rows[0]);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

checkUser();
