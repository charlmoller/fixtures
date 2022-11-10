const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    team1: {
        type: String,
        default: null
    },
    team2: {
        type: String,
        default: null
    },
    score1: {
        type: Number,
    },
    score2: {
        type: Number
    },
});

module.exports = mongoose.model("match", matchSchema);