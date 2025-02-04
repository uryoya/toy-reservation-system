import { startOfDay } from "date-fns";

interface ValueObject<T> {
  eq(value: T): boolean;
  toString(): string;
}

export class TrainerId implements ValueObject<TrainerId> {
  #id: string;

  constructor(id: string) {
    this.#id = id;
  }

  eq(value: TrainerId): boolean {
    return this.#id === value.#id;
  }

  toString(): string {
    return this.#id;
  }

  toJSON() {
    return this.#id;
  }
}

/**
 * タイムゾーン
 */
export type TimeZone = "Asia/Tokyo";

/**
 * 年月
 */
export class YearMonth implements ValueObject<YearMonth> {
  #year: number;
  #month: number;

  constructor(year: number, month: number) {
    if (!Number.isInteger(year)) {
      throw new Error("年は整数で指定してください");
    }
    if (!Number.isInteger(month)) {
      throw new Error("月は整数で指定してください");
    }
    if (month < 1 || month > 12) {
      throw new Error("月は1〜12の間で指定してください");
    }
    this.#year = year;
    this.#month = month;
  }

  get year() {
    return this.#year;
  }

  get month() {
    return this.#month;
  }

  eq(value: YearMonth): boolean {
    return this.#year === value.#year && this.#month === value.#month;
  }

  includes(date: Date): boolean {
    return (
      date.getFullYear() === this.#year && date.getMonth() + 1 === this.#month
    );
  }

  toString() {
    const YYYY = String(this.#year).padStart(4, "0");
    const MM = String(this.#month).padStart(2, "0");
    return `${YYYY}-${MM}`;
  }

  toJSON() {
    return this.toString();
  }
}

/**
 * 日にち
 */
export class CalendarDate implements ValueObject<CalendarDate> {
  #date: Date;
  #timezone: TimeZone;

  constructor(
    year: number,
    month: number,
    day: number,
    timezone: TimeZone = "Asia/Tokyo"
  ) {
    this.#date = startOfDay(new Date(year, month - 1, day));
    this.#timezone = timezone;
  }

  get date() {
    return this.#date;
  }

  get timezone() {
    return this.#timezone;
  }

  eq(value: CalendarDate): boolean {
    return (
      this.#date.getTime() === value.#date.getTime() &&
      this.#timezone === value.#timezone
    );
  }

  toString() {
    return this.#date.toISOString();
  }
}
