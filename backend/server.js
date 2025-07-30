const express = require('express');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/patients', require('./routes/patients'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});