import { eventsDao } from "../dao/events.dao.js";

export const eventsRepository = {
  async getAll() {
    return await eventsDao.findAll();
  }
};
