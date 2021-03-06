const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        name: {type: String, required: true},
        DOB: {type: Date, default: Date.now},
        pass: {type: String, required: true}, //TODO update later
        projectIds: [String],
        taskIds: [String]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('user', UserSchema);