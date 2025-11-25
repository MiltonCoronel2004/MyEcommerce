import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

/**
 * Middleware para verificar la autenticación de un usuario a través de un JSON Web Token (JWT).
 * Protege las rutas que requieren que un usuario haya iniciado sesión.
 */
export const authMiddleware = (req, res, next) => {
  let token;

  // El token debe ser enviado en el header 'Authorization' con el formato 'Bearer <token>'.
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 1. Extrae el token del header, quitando la parte 'Bearer '.
      token = req.headers.authorization.split(" ")[1];

      // 2. Verifica y decodifica el token usando el secreto.
      // Si el token es inválido o ha expirado, jwt.verify lanzará un error.
      const decoded = jwt.verify(token, JWT_SECRET);

      // 3. Añade la información decodificada del usuario (payload del token) al objeto 'req'.
      // Esto permite que los siguientes middlewares y controladores accedan a la información del usuario autenticado.
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

/**
 * Middleware para verificar si el usuario autenticado es un administrador.
 * Debe usarse siempre DESPUÉS de 'authMiddleware', ya que depende de 'req.authInfo'.
 */
export const admin = (req, res, next) => {
  if (req.authInfo && req.authInfo.role === "admin") {
    // Si el usuario tiene el rol 'admin', permite el acceso.
    next();
  } else {
    // Si no, deniega el acceso con un estado 403 Forbidden.
    res.status(403).json({ error: true, msg: "No tiene permisos de administrador." });
  }
};
