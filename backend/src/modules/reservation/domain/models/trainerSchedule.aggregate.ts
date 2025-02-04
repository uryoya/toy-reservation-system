import { TZDate } from "@date-fns/tz";
import type { Aggregate, Clone } from "#lib/domain-model";
import type { YearMonth, TrainerId, TimeZone } from "./values.js";
import { MonthlyTrainerSchedule } from "./monthlyTrainerSchedule.entity.js";

interface Props {
  readonly monthlySchedules: Map<string, MonthlyTrainerSchedule>;
}

/**
 * トレーナーのスケジュール
 */
export class TrainerSchedule
  implements Aggregate<TrainerId>, Props, Clone<TrainerSchedule, Props>
{
  public readonly timezone: TimeZone = "Asia/Tokyo";

  constructor(
    readonly id: TrainerId,
    readonly monthlySchedules: Map<string, MonthlyTrainerSchedule>,
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

    const monthlySchedule = new MonthlyTrainerSchedule(
      yearMonth,
      availableTzDates
    );

    return this.clone({
      monthlySchedules: new Map(this.monthlySchedules).set(
        yearMonth.toString(),
        monthlySchedule
      ),
    });
  }

  clone(overwrite: Partial<Props>): TrainerSchedule {
    return new TrainerSchedule(
      this.id,
      overwrite.monthlySchedules ?? this.monthlySchedules,
      this.__version
    );
  }
}
