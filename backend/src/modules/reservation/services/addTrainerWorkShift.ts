import type { Authenticate } from "#mod/iam";
import { TrainerSchedule } from "../domain/models/trainerSchedule.aggregate.js";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";

export type Command = {
  accessToken: string;
  timestamp: Date;
  form: {
    start: Date;
    end: Date;
  };
};

export type Result = {
  schedule: TrainerSchedule;
};

/**
 * トレーナーのスケジュールにシフトを追加する
 */
export class AddTrainerWorkShift {
  constructor(
    private readonly authenticate: Authenticate,
    private readonly trainerScheduleRepository: TrainerScheduleRepository
  ) {}

  async execute({ accessToken, form, timestamp }: Command): Promise<Result> {
    const { account: trainer } = await this.authenticate.execute({
      accessToken,
      role: "TRAINER",
    });

    const schedule = await this.trainerScheduleRepository.load(trainer.id);

    const updatedSchedule = schedule.addShift(form.start, form.end, timestamp);

    await this.trainerScheduleRepository.save(updatedSchedule);

    return {
      schedule: updatedSchedule,
    };
  }
}
