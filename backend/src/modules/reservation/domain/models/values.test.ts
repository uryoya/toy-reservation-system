import { describe, expect, test } from "vitest";
import { YearMonth } from "./values.js";
import { TZDate } from "@date-fns/tz";

describe("YearMonthは年月を表すValueObject", () => {
  describe("includes()は指定した日付が含まれるかどうかを返す", () => {
    test.each([
      // new Date("2021-01-01T00:00:00Z"),
      // new Date("2021-01-31T23:59:59.999Z"),
      new TZDate("2021-01-01T00:00:00", "Asia/Tokyo"),
      new TZDate("2021-01-31T23:59:59.999", "Asia/Tokyo"),
    ])("指定した日付が含まれる場合、trueを返す: %s", (date) => {
      const yearMonth = new YearMonth(2021, 1);
      expect(yearMonth.includes(date)).toBe(true);
    });
  });
});
