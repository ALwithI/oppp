import database from '../../database/database.js';

// Create a new task
export const createTask = async (req, res) =>  {

    const {id: userId} = req.user;
    console.log(userId)
    const { idCategories, description, taskTitle, finishDate} = req.body;
    console.log(finishDate)
    try {
        const taskState = 0;
        const [result] = await database.execute(
            `INSERT INTO tasks (idclient, idCategories, descreption, taskTitle, finishDate, taskState) VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, idCategories, description, taskTitle, finishDate,taskState]
        );

        return res.status(201).json({ message: "Task created", taskId: result.insertId });
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "Error creating task" });
    }
};

// Get tasks by user or by categories
export const getTasks = async (req, res) => {
    const {id: userId} = req.user;
    const {categoryId } = req.params;
    console.log(categoryId)

    try {
        let query = `SELECT * FROM tasks WHERE idclient = ?`;
        const params = [userId];

        if (categoryId) {
            query += ` AND idCategories = ?`;
            params.push(categoryId);
        }

        const [tasks] = await database.execute(query, params);
        return res.json({ tasks });
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        return res.status(500).json({ message: "Error retrieving tasks" });
    }
};
// Update a task by id
export const updateTask = async (req, res) => {
    const { id } = req.params; // Task ID from request params
    const { idCategories, description, taskTitle, finishDate, taskState } = req.body; // Updated data
    const { id: userId } = req.user;

    try {
        const fields = []; // fields to update
        const values = []; // values to update fields

        // This condition traits the case where if the user is updating to a categorie that doesn't belong to him 
        if (idCategories !== undefined) {
            console.log(userId)
            console.log(idCategories)
            const [categoryResult] = await database.execute(
                `SELECT * FROM tasks WHERE idCategories = ? AND idclient = ?`,
                [idCategories, userId]
            );

            // If not found that means it doesnt belong to him
            if (categoryResult.length === 0) {
                console.log('test');
                return res.status(400).json({ message: "Invalid category for this user" });
            }

            fields.push("idCategories = ?");
            values.push(idCategories);
        }

        // this serie of conditions trait either if the user want to update one or multiple data 
        if (description !== undefined) {
            fields.push("descreption = ?");
            values.push(description);
        }
        if (taskTitle !== undefined) {
            fields.push("taskTitle = ?");
            values.push(taskTitle);
        }
        if (finishDate !== undefined) {
            fields.push("finishDate = ?");
            values.push(finishDate);
        }
        if (taskState !== undefined) {
            fields.push("taskState = ?");
            values.push(taskState);
        }

        // If no fields to update return 400 + a message
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Add task ID and user ID to the values array for the WHERE clause
        values.push(id, userId);

        // SQL query with dynamic fields
        const query = `UPDATE tasks SET ${fields.join(", ")} WHERE idtask = ? AND idclient = ?`;
        const [result] = await database.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        return res.json({ message: "Task updated successfully" });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ message: "Error updating task" });
    }
};
// Delete a task by id
export const deleteTask = async (req, res) => {
    const {id: userId} = req.user;
    const { id } = req.params; // Task id from the req params

    try {
        const [result] = await database.execute(
            `DELETE FROM tasks WHERE idtask = ? AND idclient=?`,
            [id,userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ message: "Error deleting task" });
    }
};