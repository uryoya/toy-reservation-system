import { add } from "date-fns";
import { ReservationId, SessionPeriod } from "../models/values.js";
import type { ReservationRepository } from "../repositories/reservation.repository.js";
import type { TrainerScheduleRepository } from "../repositories/trainerSchedule.repository.js";
import { Assigned } from "../models/reservation.aggregate.js";

export class SessionScheduleService {
  constructor(
    readonly reservationRepository: ReservationRepository,
    readonly trainerScheduleRepository: TrainerScheduleRepository
  ) {}

  async schedule1HourSession(trainerId: string, start: Date, timestamp: Date): Promise<Assigned> {
    const sessionPeriod = SessionPeriod.from(start, add(start, { hours: 1 }));
    const trainerSchedule = await this.trainerScheduleRepository.load(trainerId);
    const confirmedReservations = await this.reservationRepository.loadAllConfirmed();

    const trainerAssignable = trainerSchedule.shifts.some((shift) => shift.includes(sessionPeriod));
    const sessionAssignable = !confirmedReservations.some((reservation) =>
      SessionPeriod.overlaps(reservation.sessionPeriod, sessionPeriod)
    );

    if (trainerAssignable && sessionAssignable) {
      const reservation = Assigned.create(
        ReservationId.from(crypto.randomUUID()),
        trainerSchedule.id,
        sessionPeriod,
        timestamp
      );
      return reservation;
    }
    throw new Error("指定されたトレーナーはこの時間の予約を受け付けることはできません");
  }
}
