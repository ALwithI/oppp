import database from '../../database/database.js';

// Create a new category
export const createCategory = async (req, res) => {
    const {nameCategories } = req.body;

    const {id: userId} = req.user;
    //validation zod

    try {
        console.log("test")
        const [existingNameCategories] = await database.execute('SELECT * FROM categories WHERE idclient = ? AND nameCategories = ?', [userId, nameCategories]);
        if (existingNameCategories.length > 0) {
            return res.status(400).json({ message: "Categorie with the Same name Already Exist" });
        }
        const [result] = await database.execute(
            `INSERT INTO categories (idclient, nameCategories) VALUES (?, ?)`,
            [userId, nameCategories]
        );

        return res.status(201).json({ message: "Category created", categoryId: result.insertId });
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ message: "Error creating category" });
    }
};

// Get categories for a user
export const getCategories = async (req, res) => {
    const {id: userId} = req.user;
    
    try {
        const [categories] = await database.execute(
            `SELECT * FROM categories WHERE idclient = ?`,
            [userId]
        );

        return res.json({ categories });
    } catch (error) {
        console.error("Error retrieving categories:", error);
        return res.status(500).json({ message: "Error retrieving categories" });
    }
};
// Update a category by id
export const updateCategory = async (req, res) => {
    const { id } = req.params; // Category ID from the route parameters
    const { nameCategories } = req.body; // New category name

    try {
        const [result] = await database.execute(
            `UPDATE categories SET nameCategories = ? WHERE idCategories = ?`,
            [nameCategories, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ message: "Error updating category" });
    }
};
// Delete a category by id
export const deleteCategory = async (req, res) => {
    const { id } = req.params; // it's provided in the header

    try {
        const [result] = await database.execute(
            `DELETE FROM categories WHERE idCategories = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        return res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ message: "Error deleting category" });
    }
};