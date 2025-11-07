// routes/complaint.routes.js
const routerC = require("express").Router();
const ctrlC = require("../controllers/complaint.controller");
const { guard } = require("../middlewares/auth.middleware");

// Tạo complaint (KH, Nhân viên đại lý, Quản lý, Admin)
routerC.post("/", guard(["Customer", "Dealer Staff", "Dealer Manager", "Admin"]), ctrlC.create);

// Danh sách complaint (NV/QL đại lý xem của đại lý mình, Admin xem tất cả — tuỳ bạn xử lý thêm filter theo req.user)
routerC.get("/", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlC.list);

// Lấy chi tiết
routerC.get("/:id", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlC.getById);

// Cập nhật nội dung / gán đại lý / đổi trạng thái
routerC.put("/:id", guard(["Dealer Staff", "Dealer Manager", "Admin"]), ctrlC.update);

// Đóng/giải quyết nhanh
routerC.post("/resolve", guard(["Dealer Manager","Dealer Staff", "Admin"]), ctrlC.resolve);

// Xoá complaint
routerC.delete("/:id", guard(["Dealer Manager","Dealer Staff", "Admin"]), ctrlC.remove);

module.exports = routerC;
