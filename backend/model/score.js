const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
    team: {
        type: String,
        unique: true
    },
    score: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model("score", scoreSchema);