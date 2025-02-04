import type { PrismaClient } from "@prisma/client";
import { TZDate } from "@date-fns/tz";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";
import { TrainerId, YearMonth } from "../domain/models/values.js";
import {
  MonthlySchedule,
  TrainerSchedule,
} from "../domain/models/trainerSchedule.aggregate.js";

export class PrismaTrainerScheduleRepository
  implements TrainerScheduleRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async load(id: string) {
    const data = await this.prisma.trainerSchedule.findUnique({
      include: {
        schedules: true,
      },
      where: { id },
    });

    if (data) {
      const monthlySchedules = new Map(
        data.schedules.map((s) => {
          const yearMonth = new YearMonth(s.year, s.month);
          const dates = s.availableDates.map(
            (d) => new TZDate(s.year, s.month - 1, d, data.timezone)
          );
          return [yearMonth.toString(), new MonthlySchedule(yearMonth, dates)];
        })
      );
      const trainerSchedule = new TrainerSchedule(
        new TrainerId(data.id),
        monthlySchedules,
        data.aggVersion
      );

      return trainerSchedule;
    }

    // データが存在しない場合は空のスケジュールを返す
    const initTrainerSchedule = new TrainerSchedule(
      new TrainerId(id),
      new Map(),
      0
    );

    return initTrainerSchedule;
  }

  async save(schedule: TrainerSchedule) {
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.trainerSchedule.findUnique({
        where: { id: schedule.id.toString() },
      });

      if (exists) {
        if (exists.aggVersion === schedule.__version) {
          await tx.trainerSchedule.delete({
            where: { id: schedule.id.toString() },
          });
          await tx.trainerSchedule.create({
            data: {
              id: schedule.id.toString(),
              timezone: schedule.timezone,
              schedules: {
                createMany: {
                  data: Array.from(schedule.monthlySchedules.values()).map(
                    (s) => ({
                      year: s.yearMonth.year,
                      month: s.yearMonth.month,
                      availableDates: s.availableDates.map((d) => d.getDate()),
                    })
                  ),
                },
              },
              aggVersion: schedule.__version + 1,
            },
          });
        } else {
          throw new Error("競合が発生しました");
        }
      } else {
        // TODO: 存在しない（＝新規作成）ときはここで新しく作ることにする。ただ集約に初期化ロジックを作った方がいいかも？
        await tx.trainerSchedule.create({
          data: {
            id: schedule.id.toString(),
            timezone: schedule.timezone,
            aggVersion: schedule.__version,
          },
        });
      }
    });
  }
}
