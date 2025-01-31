const { db } = require('../src/config/firebase');

async function initializeCollections() {
    try {
        // Add a sample event
        await db.collection('events').add({
            title: 'Welcome Meeting',
            description: 'Introduction meeting for all members',
            date: new Date('2025-02-15').toISOString(),
            created_by: 'admin',
            created_at: new Date().toISOString()
        });

        // Add a sample announcement
        await db.collection('announcements').add({
            title: 'Welcome to Ikshana Portal',
            content: 'We are excited to launch our new organization portal!',
            created_by: 'admin',
            created_at: new Date().toISOString()
        });

        console.log('Sample data created successfully');
    } catch (error) {
        console.error('Error creating sample data:', error);
    }
}

initializeCollections();
