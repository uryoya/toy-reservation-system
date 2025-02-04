import { describe, test, expect } from "vitest";
import { TZDate } from "@date-fns/tz";
import { WorkShift } from "./trainerSchedule.aggregate.js";
import { WorkShiftId } from "./values.js";

describe("WorkShiftは勤務シフトを表す", () => {
  describe("overlapsWith()は自他のWorkShiftが重複していないかをチェックする", () => {
    test("自他のWorkShiftが重複している場合、trueを返す", () => {
      const workShift1 = new WorkShift(
        WorkShiftId.from("1"),
        new TZDate("2022-01-01T10:00:00Z"),
        new TZDate("2022-01-01T12:00:00Z"),
        new Date()
      );
      const workShift2 = new WorkShift(
        WorkShiftId.from("2"),
        new TZDate("2022-01-01T11:00:00Z"),
        new TZDate("2022-01-01T13:00:00Z"),
        new Date()
      );
      const workShift3 = new WorkShift(
        WorkShiftId.from("3"),
        new TZDate("2022-01-01T09:00:00Z"),
        new TZDate("2022-01-01T11:00:00Z"),
        new Date()
      );

      expect(workShift1.overlapsWith(workShift2)).toBe(true);
      expect(workShift1.overlapsWith(workShift3)).toBe(true);
    });

    test("自他のWorkShiftが重複していない場合、falseを返す", () => {
      const workShift1 = new WorkShift(
        WorkShiftId.from("1"),
        new TZDate("2022-01-01T10:00:00Z"),
        new TZDate("2022-01-01T12:00:00Z"),
        new Date()
      );
      const workShift2 = new WorkShift(
        WorkShiftId.from("2"),
        new TZDate("2022-01-01T13:00:00Z"),
        new TZDate("2022-01-01T15:00:00Z"),
        new Date()
      );
      const workShift3 = new WorkShift(
        WorkShiftId.from("3"),
        new TZDate("2022-01-01T07:00:00Z"),
        new TZDate("2022-01-01T09:00:00Z"),
        new Date()
      );

      expect(workShift1.overlapsWith(workShift2)).toBe(false);
      expect(workShift1.overlapsWith(workShift3)).toBe(false);
    });
  });
});
