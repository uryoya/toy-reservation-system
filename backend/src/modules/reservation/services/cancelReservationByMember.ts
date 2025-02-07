import type { Authenticate } from "#mod/iam";
import type { ReservationRepository } from "../domain/repositories/reservation.repository.js";
import { MemberId } from "../domain/models/values.js";
import { Canceled } from "../domain/models/reservation.aggregate.js";
import { CancellationService } from "../domain/services/cancellation.service.js";

export type Command = {
  accessToken: string;
  timestamp: Date;
  form: {
    reservationId: string;
    reason: string;
  };
};

export type Result = {
  reservation: Canceled;
};

/**
 * 会員が予約をキャンセルする
 */
export class CancelReservationByMember {
  private readonly cancellationService = new CancellationService();

  constructor(
    private readonly authenticate: Authenticate,
    private readonly reservationRepository: ReservationRepository,
  ) {
    this.cancellationService = new CancellationService();
  }

  async execute({ accessToken, form, timestamp }: Command): Promise<Result> {
    const { account: member } = await this.authenticate.execute({
      accessToken,
      role: "USER",
    });

    const reservation = await this.reservationRepository.load(form.reservationId);
    const confirmedReservation = this.cancellationService.checkCancelableByMember(
      MemberId.from(member.id),
      reservation,
      timestamp,
    );
    const canceledReservation = confirmedReservation.cancel(form.reason, timestamp);
    await this.reservationRepository.save(canceledReservation);

    return {
      reservation: canceledReservation,
    };
  }
}
