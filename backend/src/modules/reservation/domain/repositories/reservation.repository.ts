import type { Reservation, Confirmed } from "../models/reservation.aggregate.js";
import type { ReservationId } from "../models/values.js";

export type ReservationRepository = {
  findById: (id: ReservationId) => Promise<Reservation | undefined>;
  findAllConfirmed: () => Promise<Confirmed[]>;
  save: (reservation: Reservation) => Promise<void>;
};
