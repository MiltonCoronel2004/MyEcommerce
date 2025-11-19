import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

export const authMiddleware = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user to the request
      req.authInfo = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: true, msg: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ error: true, msg: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.authInfo && req.authInfo.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: true, msg: "Not authorized as an admin" });
  }
};
