// src/models/associations.js
const sequelizeAssoc = require("../config/db");

// Import models
const RoleM = require("./Role");
const UserM = require("./User");
const DealerM = require("./Dealer");
const CustomerM = require("./Customer");
const VehicleModelM = require("./VehicleModel");
const VehicleVariantM = require("./VehicleVariant");
const SpecM = require("./Spec");
const VehicleModelSpecM = require("./VehicleModelSpec");
const QuoteM = require("./Quote");
const OrderM = require("./Order");
const PaymentM = require("./Payment");
const PromotionM = require("./Promotion");
const TestDriveM = require("./TestDrive");
const ComplaintM = require("./Complaint");
const ManufacturerOrderM = require("./ManufacturerOrder");
const InboundAllocationM = require("./InboundAllocation");
const ManufacturerInventoryM = require("./ManufacturerInventory");
const DealerInventoryM = require("./DealerInventory");
const VehicleInventoryM = require("./VehicleInventory");
const ShipmentM = require("./Shipment");

// ========== USERS & ROLES ==========
UserM.belongsTo(RoleM, { foreignKey: "role_id", as: "role" });
RoleM.hasMany(UserM, { foreignKey: "role_id", as: "users" });

// ========== DEALERS ==========
DealerM.belongsTo(UserM, { foreignKey: "manager_id", as: "manager" });
UserM.hasMany(DealerM, { foreignKey: "manager_id", as: "managedDealers" });

// ========== VEHICLE MODELS & VARIANTS ==========
VehicleVariantM.belongsTo(VehicleModelM, { foreignKey: "model_id", as: "model" });
VehicleModelM.hasMany(VehicleVariantM, { foreignKey: "model_id", as: "variants" });

// ========== SPECS ==========
VehicleModelSpecM.belongsTo(VehicleModelM, { foreignKey: "model_id", as: "vehicleModel" });
VehicleModelSpecM.belongsTo(SpecM, { foreignKey: "spec_id", as: "spec" });
VehicleModelM.hasMany(VehicleModelSpecM, { foreignKey: "model_id", as: "specs" });

// ========== QUOTES, ORDERS, PAYMENTS ==========
QuoteM.belongsTo(CustomerM, { foreignKey: "customer_id", as: "customer" });
QuoteM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
QuoteM.belongsTo(VehicleVariantM, { foreignKey: "variant_id", as: "variant" });

OrderM.belongsTo(CustomerM, { foreignKey: "customer_id", as: "customer" });
OrderM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
OrderM.belongsTo(VehicleVariantM, { foreignKey: "variant_id", as: "variant" });

PaymentM.belongsTo(OrderM, { foreignKey: "order_id", as: "order" });
OrderM.hasMany(PaymentM, { foreignKey: "order_id", as: "payments" });

// ========== PROMOTIONS ==========
PromotionM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
DealerM.hasMany(PromotionM, { foreignKey: "dealer_id", as: "promotions" });

// ========== TEST DRIVES ==========
TestDriveM.belongsTo(CustomerM, { foreignKey: "customer_id", as: "customer" });
TestDriveM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
TestDriveM.belongsTo(VehicleModelM, { foreignKey: "vehicle_model_id", as: "vehicleModel" });
TestDriveM.belongsTo(UserM, { foreignKey: "staff_id", as: "staff" });

// ========== COMPLAINTS ==========
ComplaintM.belongsTo(CustomerM, { foreignKey: "customer_id", as: "customer" });
ComplaintM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
ComplaintM.belongsTo(OrderM, { foreignKey: "order_id", as: "order" });

// ========== MANUFACTURER ORDERS & ALLOCATIONS ==========
ManufacturerOrderM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
ManufacturerOrderM.belongsTo(UserM, { foreignKey: "created_by", as: "creator" });
InboundAllocationM.belongsTo(ManufacturerOrderM, { foreignKey: "manufacturer_order_id", as: "manufacturerOrder" });
InboundAllocationM.belongsTo(VehicleVariantM, { foreignKey: "variant_id", as: "variant" });
ManufacturerOrderM.hasMany(InboundAllocationM, { foreignKey: "manufacturer_order_id", as: "allocations" });

// ========== INVENTORY ==========
ManufacturerInventoryM.belongsTo(VehicleVariantM, { foreignKey: "variant_id", as: "variant" });
DealerInventoryM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
DealerInventoryM.belongsTo(VehicleVariantM, { foreignKey: "variant_id", as: "variant" });
VehicleInventoryM.belongsTo(VehicleVariantM, { foreignKey: "variant_id", as: "variant" });
VehicleInventoryM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });

// ========== SHIPMENTS ==========
ShipmentM.belongsTo(DealerM, { foreignKey: "dealer_id", as: "dealer" });
ShipmentM.belongsTo(OrderM, { foreignKey: "order_id", as: "order" });
DealerM.hasMany(ShipmentM, { foreignKey: "dealer_id", as: "shipments" });
OrderM.hasMany(ShipmentM, { foreignKey: "order_id", as: "shipments" });

// ========== EXPORT ==========
module.exports = {
  sequelize: sequelizeAssoc,
  Role: RoleM,
  User: UserM,
  Dealer: DealerM,
  Customer: CustomerM,
  VehicleModel: VehicleModelM,
  VehicleVariant: VehicleVariantM,
  Spec: SpecM,
  VehicleModelSpec: VehicleModelSpecM,
  Quote: QuoteM,
  Order: OrderM,
  Payment: PaymentM,
  Promotion: PromotionM,
  TestDrive: TestDriveM,
  Complaint: ComplaintM,
  ManufacturerOrder: ManufacturerOrderM,
  InboundAllocation: InboundAllocationM,
  ManufacturerInventory: ManufacturerInventoryM,
  DealerInventory: DealerInventoryM,
  VehicleInventory: VehicleInventoryM,
  Shipment: ShipmentM,
};
