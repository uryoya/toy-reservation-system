import type { TZDate } from "@date-fns/tz";
import type { YearMonth } from "./values.js";
import type { Entity, Clone } from "#lib/domain-model";

interface Props {
  readonly availableDates: TZDate[];
}

/**
 * 月別トレーナースケジュール
 */
export class MonthlyTrainerSchedule
  implements
    Entity<YearMonth, "yearMonth">,
    Props,
    Clone<MonthlyTrainerSchedule, Props>
{
  constructor(
    readonly yearMonth: YearMonth,
    readonly availableDates: TZDate[]
  ) {
    if (!availableDates.every((date) => yearMonth.includes(date))) {
      throw new Error("出勤日はスケジュールの年月に含まれている必要があります");
    }
  }

  clone(overwrite: Partial<Props>): MonthlyTrainerSchedule {
    return new MonthlyTrainerSchedule(
      this.yearMonth,
      overwrite.availableDates ?? this.availableDates
    );
  }
}
