const Category = require('../models/Category');

const categoryController = {
    // Lấy tất cả danh mục
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    },

    // Tạo danh mục mới
    createCategory: async (req, res) => {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        try {
            const newCategory = new Category({ name });
            const savedCategory = await newCategory.save();
            res.status(201).json(savedCategory);
        } catch (error) {
            res.status(500).json({ message: 'Error creating category', error });
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (req, res) => {
        const { id } = req.params;

        try {
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching category', error });
        }
    },

    // Cập nhật danh mục theo ID
    updateCategory: async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;

        try {
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { name },
                { new: true, runValidators: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(500).json({ message: 'Error updating category', error });
        }
    },

    // Xóa danh mục theo ID
    deleteCategory: async (req, res) => {
        const { id } = req.params;

        try {
            const deletedCategory = await Category.findByIdAndDelete(id);

            if (!deletedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting category', error });
        }
    }
};

module.exports = categoryController;
