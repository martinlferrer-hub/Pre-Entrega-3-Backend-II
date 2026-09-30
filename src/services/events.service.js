import { eventsRepository } from "../repositories/events.repository.js";

export const eventsService = {
  async getAllEvents() {
    return await eventsRepository.getAll();
  }
};
