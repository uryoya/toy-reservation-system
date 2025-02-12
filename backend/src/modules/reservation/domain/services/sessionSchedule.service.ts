import { add } from "date-fns";
import { ValidationError } from "#lib/application-service";
import { ReservationId, SessionPeriod, TrainerId } from "../models/values.js";
import type { ReservationRepository } from "../repositories/reservation.repository.js";
import type { TrainerScheduleRepository } from "../repositories/trainerSchedule.repository.js";
import { Assigned } from "../models/reservation.aggregate.js";

export class SessionScheduleService {
  constructor(
    readonly reservationRepository: ReservationRepository,
    readonly trainerScheduleRepository: TrainerScheduleRepository,
  ) {}

  async schedule1HourSession(trainerId: string, start: Date, timestamp: Date): Promise<Assigned> {
    const sessionPeriod = SessionPeriod.from(start, add(start, { hours: 1 }));
    const trainerSchedule = await this.loadTrainerScheduleById(TrainerId.from(trainerId));
    const confirmedReservations = await this.reservationRepository.findAllConfirmed();

    const trainerAssignable = trainerSchedule.shifts.some((shift) => shift.includes(sessionPeriod));
    const sessionAssignable = !confirmedReservations.some((reservation) =>
      SessionPeriod.overlaps(reservation.sessionPeriod, sessionPeriod),
    );

    if (trainerAssignable && sessionAssignable) {
      const reservation = Assigned.create(
        ReservationId.from(crypto.randomUUID()),
        trainerSchedule.id,
        sessionPeriod,
        timestamp,
      );
      return reservation;
    }
    throw new ValidationError("指定されたトレーナーはこの時間の予約を受け付けることはできません");
  }

  private async loadTrainerScheduleById(trainerId: TrainerId) {
    const trainerSchedule = await this.trainerScheduleRepository.findById(trainerId);
    if (!trainerSchedule) {
      throw new ValidationError("トレーナーのスケジュールが見つかりません");
    }
    return trainerSchedule;
  }
}
