import "dotenv/config";
import { sequelize } from "../config/database.js";
import User from "../models/User.js";
import "../models/associations.js";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000/api";

const log = (message, data = null) => {
  console.log(`\n--- ${message} ---`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
  } catch (error) {
    console.error("API Request Error:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    throw error;
  }
};

const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = spawn("npm", ["run", "dev"], { cwd: process.cwd(), shell: true });

    server.stdout.on("data", (data) => {
      console.log(`[Server]: ${data}`);
      if (data.toString().includes("Server running on port")) {
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.error(`[Server Error]: ${data}`);
    });

    server.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Server process exited with code ${code}`));
      }
    });
  });
};

const runTestFlow = async () => {
    let serverProcess;
  try {
    log("Iniciando el servidor...");
    serverProcess = await startServer();
    log("Servidor iniciado.");

    log("Iniciando el flujo de prueba...");

    // 1. Limpiar la base de datos
    log("1. Limpiando la base de datos...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.drop();
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    await sequelize.sync({ force: true });
    log("Base de datos limpia.");

    // 2. Registrar usuarios (admin y cliente)
    log("2. Registrando usuarios...");
    const adminData = { firstName: "Admin", lastName: "User", email: "admin@test.com", password: "password123", repassword: "password123" };
    const customerData = { firstName: "Test", lastName: "User", email: "test@test.com", password: "password123", repassword: "password123" };
    
    await apiRequest("/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
    });
    await apiRequest("/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
    });
    log("Usuarios registrados:", { admin: adminData.email, customer: customerData.email });
    
    // Asignar rol de admin directamente en la BD
    const adminUser = await User.findOne({ where: { email: adminData.email } });
    if (adminUser) {
        adminUser.role = "admin";
        await adminUser.save();
        log("Rol de administrador asignado a:", adminUser.email);
    } else {
        throw new Error("No se pudo encontrar el usuario admin para asignarle el rol.");
    }

    // 3. Iniciar sesión
    log("3. Iniciando sesión...");
    const adminLogin = await apiRequest("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminData.email, password: adminData.password }),
    });
    const customerLogin = await apiRequest("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customerData.email, password: customerData.password }),
    });
    const adminToken = adminLogin.token;
    const customerToken = customerLogin.token;
    log("Tokens obtenidos.");

    // 4. Crear categorías (como admin)
    log("4. Creando categorías...");
    const category1 = await apiRequest("/categories/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: "Laptops", description: "Potentes laptops para trabajo y juego." }),
    });
    const category2 = await apiRequest("/categories/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: "Smartphones", description: "Los últimos modelos de smartphones." }),
    });
    log("Categorías creadas:", [category1.name, category2.name]);

    // 5. Crear productos (como admin)
    log("5. Creando productos...");
    const product1 = await apiRequest("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: "Laptop Pro", sku: "LP-001", price: 1200, stock: 50, categoryId: category1.id }),
    });
    const product2 = await apiRequest("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ name: "Smartphone X", sku: "SP-001", price: 800, stock: 100, categoryId: category2.id }),
    });
    log("Productos creados:", [product1.name, product2.name]);

    // 6. Añadir productos al carrito (como cliente)
    log("6. Añadiendo productos al carrito...");
    await apiRequest("/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ productId: product1.id, quantity: 1 }),
    });
    await apiRequest("/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ productId: product2.id, quantity: 2 }),
    });
    log("Productos añadidos al carrito.");

    // 7. Ver el carrito
    log("7. Viendo el carrito...");
    const cart = await apiRequest("/cart", {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    log("Contenido del carrito:", cart);

    log("Flujo de prueba completado con éxito!");
  } catch (error) {
    console.error("\n*** El flujo de prueba falló ***");
    console.error(error.message);
    process.exit(1);
  } finally {
    if (serverProcess) {
        log("Deteniendo el servidor...");
        serverProcess.kill();
        log("Servidor detenido.");
    }
    await sequelize.close();
    log("Conexión a la base de datos cerrada.");
  }
};

runTestFlow();
