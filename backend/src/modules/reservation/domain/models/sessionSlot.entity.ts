// import type { SessionSlotId } from "./values.js";

// /**
//  * セッション枠
//  */
// export abstract class SessionSlot {
//   constructor(
//     readonly id: SessionSlotId,
//     readonly start: Date,
//     readonly end: Date
//   ) {}

//   static from(
//     id: SessionSlotId,
//     start: Date,
//     end: Date,
//     reservedAt: Date | undefined,
//     now: Date
//   ): SessionSlot {
//     if (reservedAt) {
//       return new Reserved(id, start, end, reservedAt);
//     }
//     if (start < now) {
//       return new Expired(id, start, end);
//     }
//     return new Available(id, start, end);
//   }

//   isAvailable(): this is Available {
//     return false;
//   }

//   isReserved(): this is Reserved {
//     return false;
//   }

//   isExpired(): this is Expired {
//     return false;
//   }
// }

// /**
//  * 予約可能なセッション枠
//  */
// class Available extends SessionSlot {
//   constructor(
//     readonly id: SessionSlotId,
//     readonly start: Date,
//     readonly end: Date
//   ) {
//     super(id, start, end);
//   }

//   reserve(now: Date): Reserved {
//     return new Reserved(this.id, this.start, this.end, now);
//   }

//   expire(): Expired {
//     return new Expired(this.id, this.start, this.end);
//   }

//   isAvailable(): this is Available {
//     return true;
//   }
// }

// /**
//  * 予約済みのセッション枠
//  */
// class Reserved extends SessionSlot {
//   constructor(
//     readonly id: SessionSlotId,
//     readonly start: Date,
//     readonly end: Date,
//     readonly reservedAt: Date
//   ) {
//     super(id, start, end);
//   }

//   cancel(): Available {
//     return new Available(this.id, this.start, this.end);
//   }

//   isReserved(): this is Reserved {
//     return true;
//   }
// }

// /**
//  * 期限切れのセッション枠
//  */
// class Expired extends SessionSlot {
//   constructor(
//     readonly id: SessionSlotId,
//     readonly start: Date,
//     readonly end: Date
//   ) {
//     super(id, start, end);
//   }

//   isExpired(): this is Expired {
//     return true;
//   }
// }
