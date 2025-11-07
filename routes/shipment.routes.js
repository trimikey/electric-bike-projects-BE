// routes/shipment.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/shipment.controller");
const { guard } = require("../middlewares/auth.middleware");

// Tạo shipment
router.post(
  "/",
  guard(["EVM Staff", "Dealer Manager","Dealer Staff", "Admin"]), // tuỳ quyền của bạn
  ctrl.create
);

// Danh sách / chi tiết
router.get("/", guard(["Dealer Staff", "Dealer Manager", "Admin", "EVM Staff"]), ctrl.list);
router.get("/:id", guard(["Dealer Staff", "Dealer Manager", "Admin", "EVM Staff"]), ctrl.getById);

// Cập nhật thông tin
router.put("/:id", guard(["Dealer Manager", "Admin","Dealer Staff", "EVM Staff"]), ctrl.update);

// Đổi trạng thái
router.post("/:id/ship", guard(["Dealer Manager", "Admin","Dealer Staff", "EVM Staff"]), ctrl.markShipped);
router.post("/:id/deliver", guard(["Dealer Manager","Dealer Staff", "Admin"]), ctrl.markDelivered);
router.post("/:id/fail", guard(["Dealer Manager", "Admin","Dealer Staff", "EVM Staff"]), ctrl.markFailed);

// Xoá
router.delete("/:id", guard(["Admin","Dealer Staff"]), ctrl.remove);

module.exports = router;
