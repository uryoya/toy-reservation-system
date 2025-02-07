import { sub } from "date-fns";
import { MemberId } from "../models/values.js";
import { Confirmed, type Reservation } from "../models/reservation.aggregate.js";

export class CancellationService {
  constructor() {}

  checkCancelableByMember(cancelerId: MemberId, reservation: Reservation, timestamp: Date): Confirmed {
    if (reservation.traineeId !== cancelerId) {
      throw new Error("この予約はキャンセルできません");
    }
    if (!(reservation instanceof Confirmed)) {
      // Assignedの状態では永続化されないので、これは考慮せず、キャンセル済みとして扱う。
      throw new Error("この予約はキャンセル済みです");
    }
    const cancelableLimit = sub(reservation.sessionPeriod.start, { hours: 24 });
    if (cancelableLimit < timestamp) {
      throw new Error("キャンセル期限を過ぎています");
    }

    return reservation;
  }
}
