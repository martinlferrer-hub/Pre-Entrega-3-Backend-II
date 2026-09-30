import { usersRepository } from "../repositories/users.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const sessionsService = {
  async getSessions() {
    return [];
  },

  async registerUser(data = {}) {
    const { first_name, last_name, email, password } = data;

    if (!first_name || !last_name || !email || !password) {
      throw createError("Faltan campos obligatorios", 400);
    }

    if (
      typeof first_name !== "string" ||
      typeof last_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw createError("Los campos enviados no tienen un formato válido", 400);
    }

    const normalizedFirstName = first_name.trim();
    const normalizedLastName = last_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedFirstName || !normalizedLastName) {
      throw createError("Faltan campos obligatorios", 400);
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw createError("El email no tiene un formato válido", 400);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw createError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        400
      );
    }

    const existingUser = await usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw createError("El email ya está registrado", 409);
    }

    const hashedPassword = await hashPassword(password);

    try {
      const user = await usersRepository.create({
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "user"
      });

      return {
        id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      if (error.code === 11000) {
        throw createError("El email ya está registrado", 409);
      }
      throw error;
    }
  },

  async login(email, password) {
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      throw createError("Credenciales inválidas", 401);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw createError("Credenciales inválidas", 401);
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      throw createError("Credenciales inválidas", 401);
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    return {
      token: generateToken(tokenPayload),
      user: tokenPayload
    };
  }
};
