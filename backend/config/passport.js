const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const User = require('../models/User');

const JWT_SECRET = 'your-jwt-secret'; // Move this to .env in production

// Local Strategy for username/password authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // Enables access to the full `req` object inside the callback by Qem
}, async (req, email, password, done) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        // Check if the selected role matches the user's role by Qem
        const selectedRole = req.body.selectedRole;
        if (selectedRole && selectedRole.toLowerCase() !== user.role.toLowerCase()) {
            return done(null, false, { message: 'Role mismatch. Please choose the correct role.' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// JWT Strategy for token authentication
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = { JWT_SECRET };