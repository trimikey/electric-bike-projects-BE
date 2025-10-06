const Dealer = require("./Dealer");
const User = require("./User");
const Customer = require("./Customer");
const VehicleModel = require("./VehicleModel");
const VehicleInventory = require("./VehicleInventory");
const Appointment = require("./Appointment");
const Quote = require("./Quote");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Payment = require("./Payment");
const StockAllocation = require("./StockAllocation");

// Dealer relationships
Dealer.hasMany(User, { foreignKey: "dealer_id" });
User.belongsTo(Dealer, { foreignKey: "dealer_id" });

Dealer.hasMany(Customer, { foreignKey: "dealer_id" });
Customer.belongsTo(Dealer, { foreignKey: "dealer_id" });

Dealer.hasMany(VehicleInventory, { foreignKey: "dealer_id" });
VehicleInventory.belongsTo(Dealer, { foreignKey: "dealer_id" });

// Vehicle model <-> Inventory
VehicleModel.hasMany(VehicleInventory, { foreignKey: "vehicle_model_id" });
VehicleInventory.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id" });

// Orders
Customer.hasMany(Order, { foreignKey: "customer_id" });
Order.belongsTo(Customer, { foreignKey: "customer_id" });

Dealer.hasMany(Order, { foreignKey: "dealer_id" });
Order.belongsTo(Dealer, { foreignKey: "dealer_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

VehicleModel.hasMany(OrderItem, { foreignKey: "vehicle_model_id" });
OrderItem.belongsTo(VehicleModel, { foreignKey: "vehicle_model_id" });

// Payments
Order.hasMany(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

// Stock allocation
StockAllocation.belongsTo(VehicleInventory, { foreignKey: "vehicle_inventory_id" });

module.exports = {
  Dealer,
  User,
  Customer,
  VehicleModel,
  VehicleInventory,
  Appointment,
  Quote,
  Order,
  OrderItem,
  Payment,
  StockAllocation,
};
