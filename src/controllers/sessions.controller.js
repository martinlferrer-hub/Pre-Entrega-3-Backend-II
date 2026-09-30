import { sessionsService } from "../services/sessions.service.js";
import { env } from "../config/env.js";

const getCookieOptions = (nodeEnv) => ({
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 1000,
  secure: nodeEnv === "production"
});

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await sessionsService.getSessions();

    res.status(200).json({
      status: "success",
      payload: sessions
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const user = await sessionsService.registerUser(req.body);

    res.status(201).json({
      status: "success",
      payload: user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token } = await sessionsService.login(email, password);

    res.cookie("currentUser", token, getCookieOptions(env.NODE_ENV));

    res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    next(error);
  }
};

export const current = (req, res) => {
  const { id, email, role } = req.user;

  res.status(200).json({
    status: "success",
    payload: { id, email, role }
  });
};

export const logout = (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production"
  });

  res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};
