const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5001/get-announcements?role=Student&subRole=CSE');
        if (res.data.announcements && res.data.announcements.length > 0) {
            const first = res.data.announcements[0];
            console.log("First Announcement uploadedBy:", JSON.stringify(first.uploadedBy, null, 2));
            if (typeof first.uploadedBy === 'object' && first.uploadedBy.username) {
                console.log("SUCCESS: uploadedBy is populated.");
            } else {
                console.log("FAILURE: uploadedBy is NOT populated (likely server needs restart).");
            }
        } else {
            console.log("No announcements found to check.");
        }
    } catch (e) {
        console.error("Error calling API:", e.message);
    }
}

test();
