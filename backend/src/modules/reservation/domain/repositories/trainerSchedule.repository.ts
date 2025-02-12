import type { TrainerSchedule } from "../models/trainerSchedule.aggregate.js";
import type { TrainerId } from "../models/values.js";

export type TrainerScheduleRepository = {
  findById: (id: TrainerId) => Promise<TrainerSchedule | undefined>;
  save: (schedule: TrainerSchedule) => Promise<void>;
};
