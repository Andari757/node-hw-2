const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config()
const { MONGO_URL } = process.env;

const init = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Database connection successful');
        app.listen(3000, () => {
            console.log('Server running. Use our API on port: 3000.');
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

init();

