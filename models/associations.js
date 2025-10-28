// ✅ Import Sequelize instance
const sequelize = require("../config/db");

// ✅ Import tất cả các model
const Role = require("./Role");
const User = require("./User");
const Dealer = require("./Dealer");
const Customer = require("./Customer");
const VehicleModel = require("./VehicleModel");
const VehicleVariant = require("./VehicleVariant");
const Spec = require("./Spec");
const VehicleModelSpec = require("./VehicleModelSpec");
const Quote = require("./Quote");
const Order = require("./Order");
const Payment = require("./Payment");
const Promotion = require("./Promotion");
const TestDrive = require("./TestDrive");
const Complaint = require("./Complaint");
const Manufacturer = require("./Manufacturer");
const ManufacturerOrder = require("./ManufacturerOrder");
const ManufacturerInventory = require("./ManufacturerInventory");
const DealerInventory = require("./DealerInventory");
const VehicleInventory = require("./VehicleInventory");
const Shipment = require("./Shipment");

// ========== USERS & ROLES ==========
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

// ========== DEALERS ==========
Dealer.belongsTo(User, { foreignKey: "manager_id", as: "manager" });
User.hasMany(Dealer, { foreignKey: "manager_id", as: "managedDealers" });

// ========== VEHICLE MODELS & VARIANTS ==========
VehicleVariant.belongsTo(VehicleModel, { foreignKey: "model_id", as: "vehicleModel" });
VehicleModel.hasMany(VehicleVariant, { foreignKey: "model_id", as: "variants" });
Manufacturer.hasMany(VehicleModel, { foreignKey: "manufacturer_id", as: "vehicleModels" });
VehicleModel.belongsTo(Manufacturer, { foreignKey: "manufacturer_id", as: "manufacturer" });

// ========== SPECS ==========
VehicleModelSpec.belongsTo(VehicleModel, { foreignKey: "model_id", as: "vehicleModel" });
VehicleModelSpec.belongsTo(Spec, { foreignKey: "spec_id", as: "spec" });
VehicleModel.hasMany(VehicleModelSpec, { foreignKey: "model_id", as: "modelSpecs" });


// ========== QUOTES, ORDERS, PAYMENTS ==========
Quote.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Quote.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Quote.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });

Order.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Order.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Order.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });

Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });

// ========== PROMOTIONS ==========
Promotion.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Dealer.hasMany(Promotion, { foreignKey: "dealer_id", as: "promotions" });

// ========== TEST DRIVES ==========
TestDrive.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
TestDrive.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
TestDrive.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id", as: "vehicleModel" });
TestDrive.belongsTo(User, { foreignKey: "staff_id", as: "staff" });

// ========== COMPLAINTS ==========
Complaint.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Complaint.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Complaint.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// ========== MANUFACTURER ORDERS & ALLOCATIONS ==========
ManufacturerOrder.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
ManufacturerOrder.belongsTo(Manufacturer, { foreignKey: "manufacturer_id", as: "manufacturer" });
Manufacturer.hasMany(ManufacturerOrder, { foreignKey: "manufacturer_id", as: "orders" });
ManufacturerOrder.belongsTo(User, { foreignKey: "created_by", as: "creator" });
ManufacturerOrder.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
VehicleVariant.hasMany(ManufacturerOrder, { foreignKey: "variant_id", as: "manufacturerOrders" });

// ========== INVENTORY ==========
ManufacturerInventory.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
DealerInventory.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
DealerInventory.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
VehicleInventory.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
VehicleInventory.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });

// ========== SHIPMENTS ==========
Shipment.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Shipment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Dealer.hasMany(Shipment, { foreignKey: "dealer_id", as: "shipments" });
Order.hasMany(Shipment, { foreignKey: "order_id", as: "shipments" });

// ========== REFRESH TOKENS ==========
const RefreshTokenM = require("./RefreshToken");
Customer.hasMany(RefreshTokenM, { foreignKey: "customer_id", as: "refreshTokens" });
RefreshTokenM.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });


// ========== EXPORT ==========
module.exports = {
  sequelize,
  Role,
  User,
  Dealer,
  Customer,
  VehicleModel,
  VehicleVariant,
  Spec,
  VehicleModelSpec,
  Quote,
  Order,
  Payment,
  Promotion,
  TestDrive,
  Complaint,
  Manufacturer,
  ManufacturerOrder,
  ManufacturerInventory,
  DealerInventory,
  VehicleInventory,
  Shipment,
};
