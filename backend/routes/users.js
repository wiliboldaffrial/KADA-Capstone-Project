const express = require('express');
const connectDB = require('./db');
const User = require('./models/User');

Router.post('/', async (req, res) => {
    const { username, password, role } = req.body;
    try{
        let user = await User.findOne({ username });
        if (user){
            return res.status(400).json({msh: 'User already exists'});
        }
        user = new User ({ username, password, role });
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

Router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});