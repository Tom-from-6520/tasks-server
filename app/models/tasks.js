const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
    {
        name: {type: String, required: true},
        content: {type: String, required: true},
        projectId: {type: String, required: true},
        dayStart: {type: Date, default: Date.now},
        deadline: {type: Date},
        completed: {type: Boolean, default: false},
        score: {type: Number, default: 0},
        userIds: [String]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('task', TaskSchema);