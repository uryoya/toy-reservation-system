import { TZDate } from "@date-fns/tz";
import type { Aggregate, Entity } from "#lib/domain-model";
import type { YearMonth, TrainerId, TimeZone } from "./values.js";

/**
 * トレーナーのスケジュール
 */
type TrainerScheduleProps = {
  readonly monthlySchedules: Map<string, MonthlySchedule>;
};

export class TrainerSchedule implements Aggregate<TrainerId> {
  public readonly timezone: TimeZone = "Asia/Tokyo";

  constructor(
    readonly id: TrainerId,
    readonly monthlySchedules: Map<string, MonthlySchedule>,
    readonly __version: number
  ) {}

  /** 月別のスケジュールを追加 */
  addMonthlySchedule(
    yearMonth: YearMonth,
    availableDates: number[],
    now: Date
  ): TrainerSchedule {
    if (this.monthlySchedules.has(yearMonth.toString())) {
      throw new Error("指定された年月のスケジュールは既に存在します");
    }
    const availableTzDates = availableDates.map(
      (date) =>
        new TZDate(yearMonth.year, yearMonth.month - 1, date, this.timezone)
    );
    if (availableTzDates.some((date) => date < now)) {
      throw new Error("過去の日付は指定できません");
    }

    const monthlySchedule = new MonthlySchedule(yearMonth, availableTzDates);

    return this.clone({
      monthlySchedules: new Map(this.monthlySchedules).set(
        yearMonth.toString(),
        monthlySchedule
      ),
    });
  }

  private clone(overwrite: Partial<TrainerScheduleProps>): TrainerSchedule {
    return new TrainerSchedule(
      this.id,
      overwrite.monthlySchedules ?? this.monthlySchedules,
      this.__version
    );
  }
}

/**
 * 月別トレーナースケジュール
 */
type MonthlyScheduleProps = {
  readonly availableDates: TZDate[];
};

export class MonthlySchedule implements Entity<YearMonth, "yearMonth"> {
  constructor(
    readonly yearMonth: YearMonth,
    readonly availableDates: TZDate[]
  ) {
    if (availableDates.some((date) => !yearMonth.includes(date))) {
      throw new Error("出勤日はスケジュールの年月に含まれている必要があります");
    }
  }

  private clone(overwrite: Partial<MonthlyScheduleProps>): MonthlySchedule {
    return new MonthlySchedule(
      this.yearMonth,
      overwrite.availableDates ?? this.availableDates
    );
  }

  toJSON() {
    return {
      yearMonth: this.yearMonth,
      availableDates: this.availableDates,
    };
  }
}
