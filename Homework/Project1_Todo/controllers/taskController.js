const Todo = require("../models/Task");

/**
 * @route GET /todos
 * @desc Lấy danh sách todos với các tùy chọn lọc, sắp xếp và phân trang.
 * @access Private nếu cần xác thực
 * @param {string} [status] - Lọc theo trạng thái (pending, completed, in-progress). Có thể là danh sách các giá trị phân tách bằng dấu phẩy.
 * @param {string} [search] - Tìm kiếm theo tiêu đề hoặc mô tả (tìm kiếm toàn văn).
 * @param {string} [sort=-createdAt] - Sắp xếp kết quả. Ví dụ: createdAt, -dueDate, title.
 * @param {number} [limit=10] - Số lượng kết quả trên mỗi trang.
 * @param {number} [page=1] - Số trang cần lấy.
 * @param {string} [fromDate] - Lọc theo dueDate từ ngày này (ISO 8601).
 * @param {string} [toDate] - Lọc theo dueDate đến ngày này (ISO 8601).
 * @returns {object} - Danh sách todos, thông tin phân trang và tổng số kết quả.
 * @returns {array} response.todos - Mảng các todo objects.
 * @returns {number} response.total - Tổng số todos phù hợp với bộ lọc.
 * @returns {number} response.page - Trang hiện tại.
 * @returns {number} response.totalPages - Tổng số trang.
 * @example
 * // Lấy danh sách todos với trạng thái "pending" và sắp xếp theo ngày hết hạn giảm dần
 * GET /todos?status=pending&sort=-dueDate
 */
exports.getTasks = async (req, res) => {
    const { status, search, sort = "-createdAt", limit = 10, page = 1, fromDate, toDate } = req.query;
    const filter = {};

    if (status) filter.status = { $in: status.split(",") };
    if (fromDate || toDate) {
        filter.dueDate = {};
        if (fromDate) filter.dueDate.$gte = new Date(fromDate);
        if (toDate) filter.dueDate.$lte = new Date(toDate);
    }
    if (search) filter.title = new RegExp(search, "i");

    // Tìm kiếm toàn văn (áp dụng cho title và description)
    if (search) {
        filter.$text = { $search: search };
    }

    try {
        // Phân trang
        const skip = (page - 1) * limit;

        const todos = await Todo.find(filter)
            .populate("createdBy", "name email") // Lấy thông tin người tạo
            .sort(sort.split(",").reduce((acc, key) => ({ ...acc, [key.replace("-", "")]: key.startsWith("-") ? -1 : 1 }), {}))
            .limit(Number(limit))
            .skip(skip);

        res.json({
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            todos,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



/**
 * @route POST /todos
 * @desc Tạo một todo mới.
 * @access Private (yêu cầu xác thực)
 * @param {string} title - Tiêu đề của todo (bắt buộc).
 * @param {string} [description] - Mô tả của todo.
 * @param {string} [status] - Trạng thái của todo.
 * @param {string} [dueDate] - Ngày hết hạn của todo (ISO 8601).
 * @returns {object} - Todo vừa được tạo.
 * @throws {400} - Lỗi nếu dữ liệu không hợp lệ.
 * @example
 * // Tạo một todo mới
 * POST /todos
 * {
 * "title": "Hoàn thành dự án",
 * "description": "Nộp báo cáo cuối kỳ",
 * "dueDate": "2025-02-28"
 * }
 */
exports.createTask = async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        const createdBy = req.user.id;
        const todo = await Todo.create({ title, description, status, dueDate, createdBy });
        res.status(201).json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route PUT /todos/:id
 * @desc Cập nhật một todo theo ID.
 * @access Private (yêu cầu xác thực, chỉ người tạo mới có quyền)
 * @param {string} id - ID của todo cần cập nhật (path parameter).
 * @param {string} [title] - Tiêu đề mới của todo.
 * @param {string} [description] - Mô tả mới của todo.
 * @param {string} [status] - Trạng thái mới của todo.
 * @param {string} [dueDate] - Ngày hết hạn mới của todo (ISO 8601).
 * @returns {object} - Todo đã được cập nhật.
 * @throws {404} - Todo không tồn tại.
 * @throws {400} - Lỗi nếu dữ liệu không hợp lệ.
 * @example
 * // Cập nhật todo với ID "123"
 * PUT /todos/123
 * {
 * "status": "pending"
 * }
 */
exports.updateTask = async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, createdBy: req.user.id });
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        Object.assign(todo, req.body);
        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * @route DELETE /todos/:id
 * @desc Xóa một todo theo ID.
 * @access Private (yêu cầu xác thực, chỉ người tạo mới có quyền)
 * @param {string} id - ID của todo cần xóa (path parameter).
 * @returns {object} - Thông báo xóa thành công.
 * @throws {404} - Todo không tồn tại.
 * @example
 * // Xóa todo với ID "123"
 * DELETE /todos/123
 */
exports.deleteTask = async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, createdBy: req.user.id });
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        await todo.deleteOne();
        res.json({ message: "Todo deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
