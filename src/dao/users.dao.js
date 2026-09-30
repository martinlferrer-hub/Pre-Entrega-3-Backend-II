import { UserModel } from "../models/User.js";

export const usersDao = {
  async findByEmail(email) {
    return UserModel.findOne({ email }).select("+password");
  },

  async create(userData) {
    return UserModel.create(userData);
  }
};
