import type { PrismaClient } from "@prisma/client";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";
import { TrainerId, WorkShiftId } from "../domain/models/values.js";
import { TrainerSchedule, WorkShift } from "../domain/models/trainerSchedule.aggregate.js";
import { TZDate } from "@date-fns/tz";

export class PrismaTrainerScheduleRepository implements TrainerScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async load(id: string) {
    const data = await this.prisma.trainerSchedule.findUnique({
      include: {
        shifts: true,
      },
      where: { trainerId: id },
    });

    if (!data) {
      throw new Error("データが存在しません");
    }

    const shifts = data.shifts.map(
      (s) => new WorkShift(WorkShiftId.from(s.id), new TZDate(s.start), new TZDate(s.end), s.createdAt)
    );
    const schedule = new TrainerSchedule(TrainerId.from(data.trainerId), shifts, data.createdAt, data.aggVersion);

    return schedule;
  }

  async save(schedule: TrainerSchedule) {
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.trainerSchedule.findUnique({
        where: { trainerId: schedule.id },
      });

      if (exists) {
        if (exists.aggVersion !== schedule.__version) {
          throw new Error("競合が発生しました");
        }
        await tx.trainerSchedule.delete({ where: { trainerId: schedule.id } });
      }

      await tx.trainerSchedule.create({
        data: {
          trainerId: schedule.id,
          timezone: schedule.timezone,
          shifts: {
            createMany: {
              data: schedule.shifts.map((shift) => ({
                id: shift.id,
                start: shift.start,
                end: shift.end,
                createdAt: shift.createdAt,
              })),
            },
          },
          aggVersion: schedule.__version + 1,
        },
      });
    });
  }
}
