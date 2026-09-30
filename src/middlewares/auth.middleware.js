import { verifyToken } from "../utils/jwt.js";

export const auth = (req, res, next) => {
  const token = req.cookies?.currentUser;

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado"
    });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "No autenticado"
    });
  }
};
