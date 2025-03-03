import type { PrismaClient } from "@prisma/client";
import { TZDate } from "@date-fns/tz";
import { ConflictError } from "#lib/application-service";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";
import { TrainerId, WorkShiftId } from "../domain/models/values.js";
import { TrainerSchedule, WorkShift } from "../domain/models/trainerSchedule.aggregate.js";

export class PrismaTrainerScheduleRepository implements TrainerScheduleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: TrainerId) {
    const data = await this.prisma.trainerSchedule.findUnique({
      include: {
        shifts: true,
      },
      where: { trainerId: id },
    });

    if (!data) {
      return undefined;
    }

    const shifts = data.shifts.map(
      (s) => new WorkShift(WorkShiftId.from(s.id), new TZDate(s.start), new TZDate(s.end), s.createdAt),
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
          throw new ConflictError("競合が発生しました");
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
          createdAt: schedule.createdAt,
          aggVersion: schedule.__version + 1,
        },
      });
    });
  }
}
