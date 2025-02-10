import { ValidationError } from "#lib/application-service";

const brandTrainerId = Symbol();
const brandMemberId = Symbol();
const brandWorkShiftId = Symbol();
const brandReservationId = Symbol();
const brandSessionPeriod = Symbol();

/** トレーナーのID */
export type TrainerId = string & { [brandTrainerId]: unknown };
export const TrainerId = {
  from: (id: string): TrainerId => id as TrainerId,
};

/** 会員のID */
export type MemberId = string & { [brandMemberId]: unknown };
export const MemberId = {
  from: (id: string): MemberId => id as MemberId,
};

/** 勤務シフトID */
export type WorkShiftId = string & { [brandWorkShiftId]: unknown };
export const WorkShiftId = {
  from: (id: string): WorkShiftId => id as WorkShiftId,
};

/** 予約ID */
export type ReservationId = string & { [brandReservationId]: unknown };
export const ReservationId = {
  from: (id: string): ReservationId => id as ReservationId,
};

/** タイムゾーン */
export type TimeZone = "Asia/Tokyo";

/** セッション時間 */
export type SessionPeriod = {
  start: Date;
  end: Date;
} & { [brandSessionPeriod]: unknown };

const isSessionPeriod = (value: { start: Date; end: Date }): value is SessionPeriod => {
  return value.start < value.end;
};

export const SessionPeriod = {
  from: (start: Date, end: Date): SessionPeriod => {
    const sessionPeriod = { start, end };

    if (isSessionPeriod(sessionPeriod)) {
      return sessionPeriod;
    }

    throw new ValidationError("セッション開始時間は終了時間より前である必要があります");
  },

  overlaps: (a: SessionPeriod, b: SessionPeriod): boolean => {
    return a.start < b.end && a.end > b.start;
  },
};
