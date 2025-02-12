import { ValidationError } from "#lib/application-service";
import type { Authenticate } from "#mod/iam";
import { TrainerSchedule } from "../domain/models/trainerSchedule.aggregate.js";
import { TrainerId, WorkShiftId } from "../domain/models/values.js";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";

export type Command = {
  accessToken: string;
  timestamp: Date;
  form: {
    id: string;
  };
};

export type Result = {
  schedule: TrainerSchedule;
};

/**
 * トレーナーのシフトを削除する
 */
export class RemoveTrainerWorkShift {
  constructor(
    private readonly authenticate: Authenticate,
    private readonly trainerScheduleRepository: TrainerScheduleRepository,
  ) {}

  async execute({ accessToken, form }: Command): Promise<Result> {
    const { account: trainer } = await this.authenticate.execute({
      accessToken,
      role: "TRAINER",
    });

    const schedule = await this.loadTrainerScheduleById(TrainerId.from(trainer.id));

    const updatedSchedule = schedule.removeShift(WorkShiftId.from(form.id));

    await this.trainerScheduleRepository.save(updatedSchedule);

    return {
      schedule: updatedSchedule,
    };
  }

  private async loadTrainerScheduleById(id: TrainerId) {
    const schedule = await this.trainerScheduleRepository.findById(id);
    if (!schedule) {
      throw new ValidationError("トレーナーのスケジュールが見つかりません");
    }
    return schedule;
  }
}
