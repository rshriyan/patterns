// Abstract an external library for dealing with dates, datetime.
import dayjs, { OpUnitType, QUnitType, UnitType } from 'dayjs';

import timezone from 'dayjs/plugin/timezone';
import weekday from 'dayjs/plugin/weekday';
import utc from 'dayjs/plugin/utc';

import { isNil } from '@utils';
import { LocalDateTimeString, LocalTimeString } from '../utils/local_date_time';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);

export enum Timezone {
  UTC = 'UTC',
  PST = 'America/Los_Angeles',
  CST = 'America/Chicago',
  EST = 'America/New_York',
}
// Mimics the types accepted by Dayjs, but purposely removes Dayjs as one of the accepted types.
export type DateTimeAdapterTypes = string | number | Date | null | undefined;

export class DateTimeAdapter {
  // Holds the library core instance, this can be swapped with another library like moment
  private instance: dayjs.Dayjs;

  // Purposely made private for internal use, we cannot expose this outside since that
  // leaks the library specific type(dayjs.Dayjs) to the caller. This will break abstraction.
  private constructor(dayjs: dayjs.Dayjs) {
    this.instance = dayjs;
  }

  static create(value: DateTimeAdapterTypes = undefined): DateTimeAdapter {
    if (isNil(value)) {
      return new DateTimeAdapter(dayjs());
    }
    return new DateTimeAdapter(dayjs(value));
  }

  format(template?: string): string {
    return this.instance.format(template);
  }

  isBefore(value?: DateTimeAdapterTypes | DateTimeAdapter): boolean {
    if (value instanceof DateTimeAdapter) {
      return this.instance.isBefore(value.toDate());
    } else {
      return this.instance.isBefore(value);
    }
  }

  isAfter(value?: DateTimeAdapterTypes | DateTimeAdapter): boolean {
    if (value instanceof DateTimeAdapter) {
      return this.instance.isAfter(value.toDate());
    } else {
      return this.instance.isAfter(value);
    }
  }

  // https://day.js.org/docs/en/display/difference
  diff(value: DateTimeAdapterTypes | DateTimeAdapter, unit?: string): number {
    if (value instanceof DateTimeAdapter) {
      return this.instance.diff(value.toDate(), <QUnitType | OpUnitType>unit);
    } else {
      return this.instance.diff(value, <QUnitType | OpUnitType>unit);
    }
  }

  // Important to not mutate the current instance, modifications should always return new instance
  add(value: number, unit: string): DateTimeAdapter {
    // returns a clone i.e. a new dayJs, so the current instance should not be updated.
    return new DateTimeAdapter(this.instance.add(value, unit));
  }

  toDate(): Date {
    return this.instance.toDate();
  }

  valueOf(): number {
    return this.instance.valueOf();
  }

  isValid(): boolean {
    return this.instance.isValid();
  }

  subtract(number: number, unit: string): DateTimeAdapter {
    return new DateTimeAdapter(this.instance.subtract(number, unit));
  }

  set(hour: string, number: number): DateTimeAdapter {
    return DateTimeAdapter.create(
      this.instance.set(<UnitType>hour, number).toDate(),
    );
  }

  date(): number {
    return this.instance.date();
  }

  clone(): DateTimeAdapter {
    return new DateTimeAdapter(this.instance.clone());
  }

  isSame(value: DateTimeAdapter): boolean {
    return this.instance.isSame(value.toDate());
  }

  toLocalTimeString(): LocalTimeString {
    return this.instance.format('HH:mm');
  }

  setTimezone(zone: Timezone): DateTimeAdapter {
    return new DateTimeAdapter(this.instance.tz(zone));
  }

  weekday(): number {
    return this.instance.weekday();
  }

  hour(): number {
    return this.instance.hour();
  }
}
