const express = require("express");
const routerTD = express.Router();
const ctrlTD = require("../controllers/testDrive.controller");
const { guard } = require("../middlewares/auth.middleware");

// ==================== TEST DRIVE ROUTES ====================

// ✅ Tạo lịch lái thử
routerTD.post(
  "/schedule",
  guard(["Dealer Staff", "Dealer Manager", "Admin"]),
  ctrlTD.schedule
);

// ✅ Lấy tất cả lịch lái thử (có thể filter theo dealer_id, status)
routerTD.get(
  "/",
  guard(["Admin", "Dealer Manager", "Dealer Staff"]),
  ctrlTD.listAll
);

// ✅ Lấy lịch lái thử của 1 khách hàng
routerTD.get(
  "/customer/:id",
  guard(["Customer", "Dealer Staff"]),
  ctrlTD.listByCustomer
);

// ✅ Cập nhật trạng thái lịch lái thử
routerTD.put(
  "/:id/status",
  guard(["Dealer Staff", "Dealer Manager", "Admin"]),
  ctrlTD.updateStatus
);

// ✅ Xoá lịch lái thử
routerTD.delete("/:id", guard(["Admin","Dealer Staff"]), ctrlTD.remove);

module.exports = routerTD;
