const brandTrainerId = Symbol();
const brandWorkShiftId = Symbol();

/** トレーナーのID */
export type TrainerId = string & { [brandTrainerId]: unknown };
export const TrainerId = {
  from: (id: string): TrainerId => id as TrainerId,
};

/** 勤務シフトID */
export type WorkShiftId = string & { [brandWorkShiftId]: unknown };
export const WorkShiftId = {
  from: (id: string): WorkShiftId => id as WorkShiftId,
};

/**
 * タイムゾーン
 */
export type TimeZone = "Asia/Tokyo";
