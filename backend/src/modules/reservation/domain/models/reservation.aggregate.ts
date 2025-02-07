import type { Aggregate } from "#lib/domain-model";
import type { MemberId, ReservationId, SessionPeriod, TrainerId } from "./values.js";

/** 予約 */
export type Reservation = Confirmed | Canceled;

/** トレーナーをアサイン済みの仮予約 */
export class Assigned implements Aggregate<ReservationId> {
  constructor(
    readonly id: ReservationId,
    readonly trainerId: TrainerId,
    readonly sessionPeriod: SessionPeriod,
    readonly createdAt: Date,
    readonly __version: number,
  ) {}

  static create(id: ReservationId, trainerId: TrainerId, sessionPeriod: SessionPeriod, timestamp: Date): Assigned {
    if (sessionPeriod.start < timestamp) {
      throw new Error("セッション開始時間は現在時刻より後である必要があります");
    }

    return new Assigned(id, trainerId, sessionPeriod, timestamp, 0);
  }

  confirm(traineeId: MemberId, timestamp: Date): Confirmed {
    return new Confirmed(this.id, this.trainerId, traineeId, this.sessionPeriod, timestamp, 0);
  }
}

/** 確定済みの予約 */
export class Confirmed implements Aggregate<ReservationId> {
  constructor(
    readonly id: ReservationId,
    readonly trainerId: TrainerId,
    readonly traineeId: MemberId,
    readonly sessionPeriod: SessionPeriod,
    readonly createdAt: Date,
    readonly __version: number,
  ) {}

  cancel(reason: string, timestamp: Date): Canceled {
    return new Canceled(
      this.id,
      this.trainerId,
      this.traineeId,
      this.sessionPeriod,
      reason,
      this.createdAt,
      timestamp,
      this.__version,
    );
  }
}

/** キャンセル済みの予約 */
export class Canceled implements Aggregate<ReservationId> {
  constructor(
    readonly id: ReservationId,
    readonly trainerId: TrainerId,
    readonly traineeId: MemberId,
    readonly sessionPeriod: SessionPeriod,
    readonly cancelReason: string,
    readonly createdAt: Date,
    readonly canceledAt: Date,
    readonly __version: number,
  ) {}
}
