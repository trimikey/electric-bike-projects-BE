const sequelize = require("../config/database");

const Appointment = require("./Appointment");
const Complaint = require("./Complaint");
const Customer = require("./Customer");
const Dealer = require("./Dealer");
const DealerInventory = require("./DealerInventory");
const InboundAllocation = require("./InboundAllocation");
const ManufacturerInventory = require("./ManufacturerInventory");
const ManufacturerOrder = require("./ManufacturerOrder");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Payment = require("./Payment");
const Promotion = require("./Promotion");
const Quote = require("./Quote");
const Role = require("./Role");
const Shipment = require("./Shipment");
const Spec = require("./Spec");
const StockAllocation = require("./StockAllocation");
const TestDrive = require("./TestDrive");
const User = require("./User");
const VehicleInventory = require("./VehicleInventory");
const VehicleModel = require("./VehicleModel");
const VehicleModelSpec = require("./VehicleModelSpec");
const VehicleVariant = require("./VehicleVariant");

// -------- Role & User --------
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "roleRef" });

Dealer.hasMany(User, { foreignKey: "dealer_id", as: "staff" });
User.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });

Dealer.belongsTo(User, { foreignKey: "manager_id", as: "manager" });
User.hasMany(Dealer, { foreignKey: "manager_id", as: "managedDealers" });

Dealer.hasMany(Customer, { foreignKey: "dealer_id", as: "customers" });
Customer.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });

// -------- Vehicle hierarchy --------
VehicleModel.hasMany(VehicleVariant, { foreignKey: "model_id", as: "variants" });
VehicleVariant.belongsTo(VehicleModel, { foreignKey: "model_id", as: "model" });

VehicleModel.hasMany(VehicleModelSpec, { foreignKey: "model_id", as: "specs" });
VehicleModelSpec.belongsTo(VehicleModel, { foreignKey: "model_id", as: "vehicleModel" });
VehicleModelSpec.belongsTo(Spec, { foreignKey: "spec_id", as: "spec" });
Spec.hasMany(VehicleModelSpec, { foreignKey: "spec_id", as: "modelBindings" });

VehicleModel.hasMany(VehicleInventory, { foreignKey: "vehicle_model_id", as: "inventory" });
VehicleInventory.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id", as: "vehicleModel" });
VehicleInventory.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
VehicleInventory.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });

Dealer.hasMany(VehicleInventory, { foreignKey: "dealer_id", as: "vehicleInventory" });

// -------- Quotes & Orders --------
Quote.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Quote.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Quote.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
Quote.belongsTo(User, { foreignKey: "user_id", as: "createdBy" });

Customer.hasMany(Order, { foreignKey: "customer_id", as: "orders" });
Order.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

Dealer.hasMany(Order, { foreignKey: "dealer_id", as: "orders" });
Order.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });

User.hasMany(Order, { foreignKey: "user_id", as: "salesOrders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "salesPerson" });

Order.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
OrderItem.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id", as: "vehicleModel" });
OrderItem.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
OrderItem.belongsTo(VehicleInventory, { foreignKey: "vehicle_inventory_id", as: "inventoryItem" });

Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
Payment.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Order.hasMany(Shipment, { foreignKey: "order_id", as: "shipments" });
Shipment.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Shipment.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Dealer.hasMany(Shipment, { foreignKey: "dealer_id", as: "shipments" });

// -------- Inventory allocations --------
DealerInventory.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
DealerInventory.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
VehicleVariant.hasMany(DealerInventory, { foreignKey: "variant_id", as: "dealerStock" });

ManufacturerInventory.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });
VehicleVariant.hasMany(ManufacturerInventory, { foreignKey: "variant_id", as: "factoryStock" });

ManufacturerOrder.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
ManufacturerOrder.belongsTo(User, { foreignKey: "created_by", as: "creator" });
ManufacturerOrder.hasMany(InboundAllocation, { foreignKey: "manufacturer_order_id", as: "allocations" });
InboundAllocation.belongsTo(ManufacturerOrder, { foreignKey: "manufacturer_order_id", as: "manufacturerOrder" });
InboundAllocation.belongsTo(VehicleVariant, { foreignKey: "variant_id", as: "variant" });

StockAllocation.belongsTo(VehicleInventory, { foreignKey: "vehicle_inventory_id", as: "vehicleInventory" });

// -------- Promotions & Complaints --------
Promotion.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Dealer.hasMany(Promotion, { foreignKey: "dealer_id", as: "promotions" });

Complaint.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Complaint.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
Complaint.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// -------- Test drives --------
TestDrive.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
TestDrive.belongsTo(Dealer, { foreignKey: "dealer_id", as: "dealer" });
TestDrive.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id", as: "vehicleModel" });

module.exports = {
  sequelize,
  Appointment,
  Complaint,
  Customer,
  Dealer,
  DealerInventory,
  InboundAllocation,
  ManufacturerInventory,
  ManufacturerOrder,
  Order,
  OrderItem,
  Payment,
  Promotion,
  Quote,
  Role,
  Shipment,
  Spec,
  StockAllocation,
  TestDrive,
  User,
  VehicleInventory,
  VehicleModel,
  VehicleModelSpec,
  VehicleVariant,
};
