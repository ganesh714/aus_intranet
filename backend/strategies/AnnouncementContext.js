
const StudentStrategy = require('./StudentStrategy');
const FacultyStrategy = require('./FacultyStrategy');
const DefaultStrategy = require('./DefaultStrategy'); // For Admin/Deans etc..

class AnnouncementContext {
    constructor(role, subRole, batch, id) {
        this.role = role;
        this.subRole = subRole;
        this.batch = batch;
        this.id = id;
    }

    /* 
       Factory Method inside the Context to pick the right strategy.
       (combining Factory + Strategy is common!)
    */

    getStrategy() {
        if (this.role === 'Student') {
            return new StudentStrategy(this.subRole, this.batch);
        } else if (this.role === 'Faculty') {
            return new FacultyStrategy(this.subRole);
        } else {
            return new DefaultStrategy(this.role, this.subRole);
        }
    }

    async execute() {
        const strategy = this.getStrategy();
        return await strategy.fetchAnnouncements(this.id);
    }

}

module.exports = AnnouncementContext;