import type { Reservation, Confirmed } from "../models/reservation.aggregate.js";

export type ReservationRepository = {
  load: (id: string) => Promise<Reservation>;
  loadAllConfirmed: () => Promise<Confirmed[]>;
  save: (reservation: Reservation) => Promise<void>;
};
