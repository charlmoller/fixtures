const mongoose = require("mongoose");

const {
    MONGO_URI
} = process.env;

exports.connect = () => {
    mongoose
        .connect("mongodb://root:example@mongo:27017/admin", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((error) => {
            console.log("Connection failed. exiting now...");
            console.error(error);
            process.exit(1);
        });
};