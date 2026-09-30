export const eventsDao = {
  async findAll() {
    return [
      {
        id: "mock-event-001",
        title: "Evento de ejemplo",
        description: "Datos mock para verificar la arquitectura por capas."
      }
    ];
  }
};
