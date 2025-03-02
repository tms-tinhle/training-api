const Category = require("../models/categoryModel");

exports.createCategory = async (data) => {
    return await new Category(data).save();
};

exports.getCategories = async () => {
    return await Category.find();
};

exports.updateCategory = async (categoryId, updateData) => {
    return await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
};

exports.deleteCategory = async (categoryId) => {
    return await Category.findByIdAndDelete(categoryId);
};
