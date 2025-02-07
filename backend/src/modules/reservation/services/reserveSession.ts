import type { Authenticate } from "#mod/iam";
import { SessionScheduleService } from "../domain/services/sessionSchedule.service.js";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";
import type { ReservationRepository } from "../domain/repositories/reservation.repository.js";
import { MemberId } from "../domain/models/values.js";
import { Confirmed } from "../domain/models/reservation.aggregate.js";

export type Command = {
  accessToken: string;
  timestamp: Date;
  form: {
    trainerId: string;
    start: Date;
  };
};

export type Result = {
  reservation: Confirmed;
};

/**
 * 会員がセッションを予約する
 */
export class ReserveSession {
  private readonly sessionScheduleService: SessionScheduleService;

  constructor(
    private readonly authenticate: Authenticate,
    private readonly trainerScheduleRepository: TrainerScheduleRepository,
    private readonly reservationRepository: ReservationRepository
  ) {
    this.sessionScheduleService = new SessionScheduleService(reservationRepository, trainerScheduleRepository);
  }

  async execute({ accessToken, form, timestamp }: Command): Promise<Result> {
    const { account: member } = await this.authenticate.execute({
      accessToken,
      role: "USER",
    });

    const assignedReservation = await this.sessionScheduleService.schedule1HourSession(
      form.trainerId,
      form.start,
      timestamp
    );
    const confirmedReservation = assignedReservation.confirm(MemberId.from(member.id), timestamp);

    await this.reservationRepository.save(confirmedReservation);

    return {
      reservation: confirmedReservation,
    };
  }
}
