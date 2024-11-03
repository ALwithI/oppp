// app.js
import express from 'express';
import { createUserSchema } from './src/schemas/userSchema.js';
import database from './database/database.js';
import authRoutes from './src/routes/authRoutes.js'; // Import auth routes
import categoryRoutes from './src/routes/categoryRoutes.js'; // Import category routes
import taskRoutes from './src/routes/taskRoutes.js'; // Import task routes

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.static("public"))
app.use(express.urlencoded({extended : true}))

app.post('/api/users', async (req, res) => {
    // Validate the request payload using Zod schema
    const validation = createUserSchema.safeParse(req.body);

    if (!validation.success) {
        // If validation fails, send a 400 response with the error details
        return res.status(400).json({
            message: "Validation failed",
            errors: validation.error.errors
        });
    }

    // Validation successful
    const { email, username, fullName, password } = validation.data;

    try {
        // Check for existing email, username, or fullName in the database
        const [rows] = await database.execute(
            `SELECT * FROM users WHERE email = ? OR username = ? OR fullName = ?`,
            [email, username, fullName]
        );

        if (rows.length > 0) {
            // trait the Already exists cases
            let AlreadyExistField = '';

            if (rows.some(row => row.email === email)) AlreadyExistField = 'email';
            else if (rows.some(row => row.username === username)) AlreadyExistField = 'username';
            else if (rows.some(row => row.fullName === fullName)) AlreadyExistField = 'fullName';

            return res.status(400).json({
                message: `A user with this ${AlreadyExistField} already exists`,
            });
        }

        // Insert the user data into the database
        const [result] = await database.execute(
            `INSERT INTO users (email, username, fullName, password) VALUES (?, ?, ?, ?)`,
            [email, username, fullName, password]
        );

        // Send success response
        return res.status(201).json({
            message: "User created successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("Database error:", error);

        // Generic server error
        return res.status(500).json({
            message: "An error occurred while creating the user",
        });
    }
});
// Use the routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);
app.use('/api', taskRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
