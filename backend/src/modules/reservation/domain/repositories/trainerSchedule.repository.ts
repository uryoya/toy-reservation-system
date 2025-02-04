import type { TrainerSchedule } from "../models/trainerSchedule.aggregate.js";

export type TrainerScheduleRepository = {
  load: (id: string) => Promise<TrainerSchedule>;
  save: (schedule: TrainerSchedule) => Promise<void>;
};
