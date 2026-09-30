import { eventsService } from "../services/events.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getAllEvents();

    res.status(200).json({
      status: "success",
      payload: events
    });
  } catch (error) {
    next(error);
  }
};
