import type { Authenticate } from "#mod/iam";
import { TrainerSchedule } from "../domain/models/trainerSchedule.aggregate.js";
import { YearMonth } from "../domain/models/values.js";
import type { TrainerScheduleRepository } from "../domain/repositories/trainerSchedule.repository.js";

export type Command = {
  accessToken: string;
  timestamp: Date;
  form: {
    year: number;
    month: number;
    dates: number[];
  };
};

export type Result = {
  schedule: TrainerSchedule;
};

/**
 * トレーナーの月別スケジュール作成
 */
export class CreateMonthlyTrainerSchedule {
  constructor(
    private readonly authenticate: Authenticate,
    private readonly trainerScheduleRepository: TrainerScheduleRepository
  ) {}

  async execute({ accessToken, timestamp, form }: Command): Promise<Result> {
    const { account: trainer } = await this.authenticate.execute({
      accessToken,
      role: "TRAINER",
    });

    const schedule = await this.trainerScheduleRepository.load(trainer.id);

    console.log(schedule);

    const newSchedule = schedule.addMonthlySchedule(
      new YearMonth(form.year, form.month),
      form.dates,
      timestamp
    );

    await this.trainerScheduleRepository.save(newSchedule);

    return {
      schedule: newSchedule,
    };
  }
}
