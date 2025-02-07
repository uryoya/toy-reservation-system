import type { PrismaClient } from "@prisma/client";
import type { ReservationRepository } from "../domain/repositories/reservation.repository.js";
import { MemberId, ReservationId, SessionPeriod, TrainerId } from "../domain/models/values.js";
import { Canceled, Confirmed, type Reservation } from "../domain/models/reservation.aggregate.js";

export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async load(id: string) {
    const data = await this.prisma.reservation.findUnique({
      include: {
        canceled: true,
      },
      where: { id },
    });

    if (!data) {
      throw new Error("データが存在しません");
    }

    if (data.canceled) {
      return new Canceled(
        ReservationId.from(data.id),
        TrainerId.from(data.trainerId),
        MemberId.from(data.traineeId),
        SessionPeriod.from(data.start, data.end),
        data.canceled.reason,
        data.canceled.createdAt,
        data.createdAt,
        data.aggVersion,
      );
    }

    return new Confirmed(
      ReservationId.from(data.id),
      TrainerId.from(data.trainerId),
      MemberId.from(data.traineeId),
      SessionPeriod.from(data.start, data.end),
      data.createdAt,
      data.aggVersion,
    );
  }

  async loadAllConfirmed() {
    const data = await this.prisma.reservation.findMany({
      where: {
        canceled: null,
      },
    });

    return data.map(
      (r) =>
        new Confirmed(
          ReservationId.from(r.id),
          TrainerId.from(r.trainerId),
          MemberId.from(r.traineeId),
          SessionPeriod.from(r.start, r.end),
          r.createdAt,
          r.aggVersion,
        ),
    );
  }

  async save(reservation: Reservation) {
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.reservation.findUnique({
        where: { id: reservation.id },
      });

      if (exists) {
        if (exists.aggVersion !== reservation.__version) {
          throw new Error("競合が発生しました");
        }
        await tx.reservation.delete({ where: { id: reservation.id } });
      }

      if (reservation instanceof Confirmed) {
        await tx.reservation.create({
          data: {
            id: reservation.id,
            trainerId: reservation.trainerId,
            traineeId: reservation.traineeId,
            start: reservation.sessionPeriod.start,
            end: reservation.sessionPeriod.end,
            createdAt: reservation.createdAt,
            aggVersion: reservation.__version + 1,
          },
        });
      } else {
        await tx.reservation.create({
          data: {
            id: reservation.id,
            trainerId: reservation.trainerId,
            traineeId: reservation.traineeId,
            start: reservation.sessionPeriod.start,
            end: reservation.sessionPeriod.end,
            canceled: {
              create: {
                reason: reservation.cancelReason,
                createdAt: reservation.canceledAt,
              },
            },
            createdAt: reservation.createdAt,
            aggVersion: reservation.__version + 1,
          },
        });
      }
    });
  }
}
