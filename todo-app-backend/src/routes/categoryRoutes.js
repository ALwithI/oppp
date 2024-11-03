import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// possible routes for categories
router.post('/categories', createCategory); // create a new category (checked)
router.get('/categories', getCategories); // get categories for a user (checked)
router.patch('/categories/:id', updateCategory); // update a specific category (checked)
router.delete('/categories/:id', deleteCategory); // delete a specific category (checked)

export default router;