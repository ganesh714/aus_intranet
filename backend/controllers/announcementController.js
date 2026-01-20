const AnnouncementContext = require('../strategies/AnnouncementContext');
const getAnnouncements = async (req, res) => {
    try {
        const { role, subRole, id, batch } = req.query;

        const context = new AnnouncementContext(role, subRole, batch, id);
        const announcements = await context.execute();

        res.json({ announcements });
    } catch (error) {
        console.error("Strategy Error:", error);
        res.status(500).json({ message: "Error fetching announcements" });
    }
};
module.exports = { getAnnouncements };
