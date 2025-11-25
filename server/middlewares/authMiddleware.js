import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

export const authMiddleware = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET);

      req.authInfo = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: true, msg: "No autorizado, el token falló." });
    }
  }

  if (!token) {
    res.status(401).json({ error: true, msg: "No autorizado, no se proporcionó un token." });
  }
};

export const admin = (req, res, next) => {
  if (req.authInfo && req.authInfo.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: true, msg: "No tiene permisos de administrador." });
  }
};
