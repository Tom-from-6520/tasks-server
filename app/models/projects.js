const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
    {
        name: {type: String, required: true},
        content: {type: String, required: true},
        dayStart: {type: Date, default: Date.now},
        deadline: {type: Date},
        completed: {type: Boolean, default: false},
        budget: {type: Number, min: 0, default: 0},
        users: [{
            userId: {type: String, required: true},
            roles: [String],
            taskIds:[String]
        }],
        taskIds:[String]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('project', ProjectSchema);