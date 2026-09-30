import { usersDao } from "../dao/users.dao.js";

export const usersRepository = {
  async findByEmail(email) {
    return usersDao.findByEmail(email);
  },

  async create(userData) {
    return usersDao.create(userData);
  }
};
