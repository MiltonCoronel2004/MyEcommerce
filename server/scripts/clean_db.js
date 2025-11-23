import "dotenv/config";
import { sequelize } from "../config/database.js";
import "../models/associations.js";

const cleanDb = async () => {
    console.log("Limpiando la base de datos...");
    try {
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        await sequelize.drop();
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
        await sequelize.sync({ force: true });
        console.log("Base de datos limpia.");
    } catch (error) {
        console.error("Error al limpiar la base de datos:", error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

cleanDb();
