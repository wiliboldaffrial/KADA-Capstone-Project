const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://wilibold:Duyuknowdaw@3@medilink.ffrtggx.mongodb.net/?retryWrites=true&w=majority&appName=MediLink', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error(err.message);
        process.exit(1); // Exit process with failure
    }
};

MediaSourceHandle.exports = connectDB;