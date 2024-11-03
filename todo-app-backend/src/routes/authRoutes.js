import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {verifyRefreshToken} from '../middlewares/authMiddleware.js'
import {refreshAccessToken} from '../middlewares/authMiddleware.js'

const router = express.Router();

// user registration
router.post('/register', registerUser); // (checked)

// user login
router.post('/login', loginUser); //(checked)

// get user profile
router.get('/profile', verifyToken, getUserProfile); // Protected route (not checked)

// refresh access token route
router.post('/refresh-token', verifyRefreshToken, refreshAccessToken); // almost (checked)

export default router;