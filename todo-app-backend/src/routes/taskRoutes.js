import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

//possible routes for tasks
router.post('/tasks', createTask); // Create a task  (checked)
router.get('/tasks', getTasks); // Get all tasks for a user  (checked)
router.get('/tasks/:categoryId', getTasks); // Get specify tasks for user (checked)
router.patch('/tasks/:id', updateTask); // Update a task (checked)
router.delete('/tasks/:id', deleteTask); // Delete a task (checked)
 
export default router;