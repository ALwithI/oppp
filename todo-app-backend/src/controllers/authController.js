import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUserSchema, loginUserSchema } from '../schemas/userSchema.js'; // Adjust the path based on your structure
import database from '../../database/database.js';
import { z } from 'zod'; // Import Zod
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is in your .env file

// User Registration
export const registerUser = async (req, res) => {
    // Validate the request body against the Zod schema
    const validationResult = createUserSchema.safeParse(req.body);

    if (!validationResult.success) {
        // return error 400 if failed + the error detail
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.errors,
        });
    }

    const { fullName, username, email, password } = validationResult.data;

    try {
        const [existingUsers] = await database.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email or username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await database.execute('INSERT INTO users (fullName, username, email, password) VALUES (?, ?, ?, ?)', 
            [fullName, username, email, hashedPassword]);
              // Create the default categories
        const userId = result.insertId; 

        const defaultCategories = ['All','Work', 'Personal' ];
        const categoryPromises = defaultCategories.map(category => {
            return database.execute('INSERT INTO categories (idclient, nameCategories) VALUES (?, ?)', [userId, category]);
        });

        // Wait for all category inserts to complete
        await Promise.all(categoryPromises);

        return res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Error registering user" });
    }
};

// User Login
export const loginUser = async (req, res) => {

    const validateLogin = loginUserSchema.safeParse(req.body);

    if (!validateLogin.success) {
        // return error 400 if failed + the error detail
        return res.status(400).json({
            message: "Validation failed",
            errors: validateLogin.error.errors,
        });
    }

    try {

        const {email, password} = req.body;

        const [users] = await database.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users[0];

        // const isPasswordValid = await bcrypt.compare(password, user.password);

        // if (!isPasswordValid) {
        //     return res.status(401).json({ message: "Invalid email or password" });
        // }

        const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        await database.execute('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [user.id, refreshToken]);

        return res.json({
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Error logging in" });
    }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
    const userId = req.user.id; 

    try {
        const [user] = await database.execute('SELECT id, fullName, username, email FROM users WHERE id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user[0]); // Return the user profile data
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        return res.status(500).json({ message: "Error retrieving user profile" });
    }
};
export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const userId = decoded.id;

        // Check if refresh token exists in the database
        const [storedToken] = await database.execute(
            `SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ?`,
            [userId, refreshToken]
        );

        if (storedToken.length === 0) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Generate new access token
        const newAccessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Error refreshing token:", error);
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};