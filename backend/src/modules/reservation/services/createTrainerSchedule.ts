import type { Authenticate } from "#mod/iam";
import { TrainerSchedule } from "../domain/models/trainerSchedule.aggregate.js";
import { TrainerId } from "../domain/models/values.js";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";

export type Command = {
  accessToken: string;
  timestamp: Date;
};

export type Result = {
  schedule: TrainerSchedule;
};

/**
 * トレーナーのスケジュール作成
 */
export class CreateTrainerSchedule {
  constructor(
    private readonly authenticate: Authenticate,
    private readonly trainerScheduleRepository: TrainerScheduleRepository
  ) {}

  async execute({ accessToken, timestamp }: Command): Promise<Result> {
    const { account: trainer } = await this.authenticate.execute({
      accessToken,
      role: "TRAINER",
    });

    const newSchedule = TrainerSchedule.create(TrainerId.from(trainer.id), timestamp);

    await this.trainerScheduleRepository.save(newSchedule);

    return {
      schedule: newSchedule,
    };
  }
}
