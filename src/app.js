const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const userLogin = require('./schema/login_user.js');
const router = require('./routes/ai.routes');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));  // Ensure static files are served from 'public' folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Multer setup (store in public/images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            cb(null, path.join(__dirname, 'public', 'images'));  // Full path to the images folder
        } catch (err) {
            console.error("Error during file storage setup:", err);
            cb(new Error("Error during file storage setup"));
        }
    },
    filename: (req, file, cb) => {
        try {
            cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
        } catch (err) {
            console.error("Error generating file name:", err);
            cb(new Error("Error generating file name"));
        }
    }
});
0
const upload = multer({ storage: storage });

// Auth middleware
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.render('login', { error: "Need to login" });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decode;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.render('login', { error: "Invalid or expired token" });
    }
};

// Routes
app.get('/', (req, res) => {
    try {
        res.render('signup');
    } catch (err) {
        console.error("Error rendering signup page:", err);
        res.status(500).send("Error rendering signup page.");
    }
});

app.get('/login', (req, res) => {
    try {
        res.render('login');
    } catch (err) {
        console.error("Error rendering login page:", err);
        res.status(500).send("Error rendering login page.");
    }
});

app.post('/signup_submit', upload.single('photo'), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // If no file is uploaded, use the default profile image
        const photoData = req.file ? `/images/${req.file.filename}` : '/images/profile.jpeg';

        // Check if user already exists
        const existingUser = await userLogin.findOne({ email } );
        if (existingUser) {
            return res.render('signup', { error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user data with profile photo path
        await userLogin.create({
            username,
            email,
            password: hashedPassword,
            profilePhoto: photoData  // Save photo path in the database
        });

        res.render('login', { error: "User created successfully" });
    } catch (err) {
        console.error("Error during signup:", err);
        res.render('signup', { error: "An error occurred. Please try again." });
    }
});

app.post('/login_submit', async (req, res) => {
    try {
        const { email, password } = req.body;

        const findUser = await userLogin.findOne({ email });
        if (findUser) {
            const valid = await bcrypt.compare(password, findUser.password);
            if (valid) {
                const token = jwt.sign(
                    { id: findUser._id, profilePhoto: findUser.profilePhoto, username:findUser.username },
                    process.env.SECRET_KEY
                );
                res.cookie('token', token);
                return res.redirect('/ai');
            }
        }

        res.render('login', { error: 'Invalid credentials' });
    } catch (err) {
        console.error("Error during login:", err);
        res.render('login', { error: 'An error occurred during login. Please try again.' });
    }
});

// Protected AI route
app.use('/ai', authMiddleware, router);

module.exports = app;
