import type { Authenticate } from "#mod/iam";
import { ValidationError, type ApplicationService, type CommandWithAuth } from "#lib/application-service";
import type { ReservationRepository } from "../domain/repositories/reservation.repository.js";
import { MemberId, ReservationId } from "../domain/models/values.js";
import { Canceled } from "../domain/models/reservation.aggregate.js";
import { CancellationService } from "../domain/services/cancellation.service.js";

export type Command = CommandWithAuth<{
  reservationId: string;
  reason: string;
}>;

export type Result = {
  reservation: Canceled;
};

/**
 * 会員が予約をキャンセルする
 */
export class CancelReservationByMember implements ApplicationService<Command, Result> {
  private readonly cancellationService = new CancellationService();

  constructor(
    private readonly authenticate: Authenticate,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute({ accessToken, form, timestamp }: Command): Promise<Result> {
    const { account: member } = await this.authenticate.execute({
      accessToken,
      role: "USER",
    });

    const reservation = await this.loadReservationById(ReservationId.from(form.reservationId));
    const confirmedReservation = this.cancellationService.checkCancelableByMember(
      MemberId.from(member.id),
      reservation,
      timestamp,
    );
    const canceledReservation = confirmedReservation.cancel(form.reason, timestamp);
    await this.reservationRepository.save(canceledReservation);

    return { reservation: canceledReservation };
  }

  private async loadReservationById(id: ReservationId) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new ValidationError("予約が見つかりません");
    }
    return reservation;
  }
}
