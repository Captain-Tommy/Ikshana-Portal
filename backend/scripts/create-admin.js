const { db } = require('../src/config/firebase');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        const adminData = {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            full_name: 'Admin User',
            email: 'admin@ikshana.org',
            created_at: new Date().toISOString()
        };

        const usersRef = db.collection('users');
        await usersRef.add(adminData);
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdminUser();
