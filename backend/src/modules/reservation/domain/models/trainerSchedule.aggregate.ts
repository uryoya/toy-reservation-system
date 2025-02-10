import { TZDate } from "@date-fns/tz";
import type { Aggregate, Entity } from "#lib/domain-model";
import { ValidationError } from "#lib/application-service";
import { SessionPeriod, TrainerId, WorkShiftId, type TimeZone } from "./values.js";

/**
 * トレーナーのスケジュール
 */
export class TrainerSchedule implements Aggregate<TrainerId> {
  #shifts: Map<WorkShiftId, WorkShift>;

  public readonly timezone: TimeZone = "Asia/Tokyo";

  constructor(
    readonly id: TrainerId,
    shifts: WorkShift[],
    readonly createdAt: Date,
    readonly __version: number,
  ) {
    this.#shifts = new Map(shifts.map((shift) => [shift.id, shift]));
  }

  get shifts(): WorkShift[] {
    return this.#shifts.values().toArray();
  }

  static create(trainerId: TrainerId, timestamp: Date): TrainerSchedule {
    return new TrainerSchedule(trainerId, [], timestamp, 0);
  }

  addShift(start: Date, end: Date, timestamp: Date): TrainerSchedule {
    const newShift = new WorkShift(
      WorkShiftId.from(crypto.randomUUID()),
      new TZDate(start, this.timezone),
      new TZDate(end, this.timezone),
      timestamp,
    );

    if (newShift.overlaps(this.shifts)) {
      throw new ValidationError("既存のシフトと重複するシフトを追加することはできません");
    }

    const updatedShifts = new Map(this.#shifts);
    updatedShifts.set(newShift.id, newShift);

    return this.clone({ shifts: updatedShifts.values().toArray() });
  }

  editShift(shiftId: WorkShiftId, start?: Date, end?: Date): TrainerSchedule {
    const shift = this.#shifts.get(shiftId);
    if (!shift) {
      throw new ValidationError("指定されたシフトが存在しません");
    }

    const editedShift = shift.edit(start && new TZDate(start, this.timezone), end && new TZDate(end, this.timezone));
    const otherShifts = this.#shifts
      .values()
      .filter((s) => s.id !== editedShift.id)
      .toArray();
    if (editedShift.overlaps(otherShifts)) {
      throw new ValidationError("既存のシフトと重複するシフトを追加することはできません");
    }

    const updatedShifts = new Map(this.#shifts);
    updatedShifts.set(editedShift.id, editedShift);

    return this.clone({ shifts: updatedShifts.values().toArray() });
  }

  removeShift(shiftId: WorkShiftId): TrainerSchedule {
    if (!this.#shifts.has(shiftId)) {
      throw new ValidationError("指定されたシフトが存在しません");
    }

    const updatedShifts = new Map(this.#shifts);
    updatedShifts.delete(shiftId);

    return this.clone({ shifts: updatedShifts.values().toArray() });
  }

  private clone(overwrite: Partial<CloneableTrainerScheduleProps>): TrainerSchedule {
    return new TrainerSchedule(this.id, overwrite.shifts ?? this.shifts, this.createdAt, this.__version);
  }
}

type CloneableTrainerScheduleProps = {
  readonly shifts: WorkShift[];
};

/**
 * 勤務シフト
 */
export class WorkShift implements Entity<WorkShiftId> {
  constructor(
    readonly id: WorkShiftId,
    readonly start: TZDate,
    readonly end: TZDate,
    readonly createdAt: Date,
  ) {
    if (start >= end) {
      throw new ValidationError("開始日時は終了日時より前である必要があります");
    }
  }

  edit(start?: TZDate, end?: TZDate): WorkShift {
    return this.clone({ start, end });
  }

  overlapsWith(other: WorkShift): boolean {
    return this.start < other.end && this.end > other.start;
  }

  overlaps(others: WorkShift[]): boolean {
    return others.some((other) => this.overlapsWith(other));
  }

  includes(sessionPeriod: SessionPeriod): boolean {
    return this.start <= sessionPeriod.start && sessionPeriod.end <= this.end;
  }

  private clone(overwrite: Partial<CloneableWorkShiftProps>): WorkShift {
    return new WorkShift(this.id, overwrite.start ?? this.start, overwrite.end ?? this.end, this.createdAt);
  }

  toJSON() {
    return {
      id: this.id,
      start: this.start,
      end: this.end,
      createdAt: this.createdAt,
    };
  }
}

type CloneableWorkShiftProps = {
  readonly start: TZDate;
  readonly end: TZDate;
};
