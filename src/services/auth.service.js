const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const Customer = require("../models/Customer");
const { generateToken } = require("../utils/jwt");

exports.registerCustomer = async ({ full_name, email, phone, password, address, dob }) => {
  if (!email || !password) {
    throw new Error("Email và password là bắt buộc");
  }

  const existed = await Customer.findOne({ where: { email } });
  if (existed) {
    const error = new Error("Email already registered");
    error.status = 400;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const customer = await Customer.create({
    id: uuidv4(),
    full_name,
    email,
    phone,
    address,
    dob,
    password_hash,
  });

  const token = generateToken(customer, { expiresIn: "1d" });
  return { customer, token };
};

exports.loginCustomer = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email và password là bắt buộc");
  }

  const customer = await Customer.findOne({ where: { email } });
  if (!customer) {
    const error = new Error("Email không tồn tại");
    error.status = 404;
    throw error;
  }

  const isValid = await bcrypt.compare(password, customer.password_hash || "");
  if (!isValid) {
    const error = new Error("Sai mật khẩu");
    error.status = 401;
    throw error;
  }

  const token = generateToken(customer, { expiresIn: "1d" });
  return { customer, token };
};

exports.buildCustomerPayload = (customer) => ({
  id: customer.id,
  full_name: customer.full_name,
  email: customer.email,
  phone: customer.phone,
});

exports.upsertGoogleCustomer = async ({ email, name }) => {
  if (!email) {
    const error = new Error("Thiếu email");
    error.status = 400;
    throw error;
  }

  const [customer] = await Customer.findOrCreate({
    where: { email },
    defaults: {
      id: uuidv4(),
      full_name: name || email.split("@")[0],
    },
  });

  const token = generateToken(customer, { expiresIn: "1d" });
  return { customer, token };
};
