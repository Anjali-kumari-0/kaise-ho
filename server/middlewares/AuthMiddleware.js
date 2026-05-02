import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token is invalid" });
  }
};