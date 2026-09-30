import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título del evento es obligatorio."],
      trim: true
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria."],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const EventModel = model("events", eventSchema);
