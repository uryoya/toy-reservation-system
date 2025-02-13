import type { PrismaClient } from "@prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuthenticate } from "#mod/iam";
import { CreateTrainerSchedule } from "./services/createTrainerSchedule.js";
import { PrismaTrainerScheduleRepository } from "./repositories/prismaTrainerSchedule.repository.js";
import { AddTrainerWorkShift } from "./services/addTrainerWorkShift.js";
import { EditTrainerWorkShift } from "./services/editTrainerWorkShift.js";
import { RemoveTrainerWorkShift } from "./services/removeTrainerWorkShift.js";
import { ReserveSession } from "./services/reserveSession.js";
import { PrismaReservationRepository } from "./repositories/prismaReservation.repository.js";
import { CancelReservationByMember } from "./services/cancelReservationByMember.js";

export type { CreateTrainerSchedule } from "./services/createTrainerSchedule.js";
export type { AddTrainerWorkShift } from "./services/addTrainerWorkShift.js";
export type { EditTrainerWorkShift } from "./services/editTrainerWorkShift.js";
export type { RemoveTrainerWorkShift } from "./services/removeTrainerWorkShift.js";
export type { ReserveSession } from "./services/reserveSession.js";
export type { CancelReservationByMember } from "./services/cancelReservationByMember.js";

export const useCreateTrainerSchedule = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const trainerScheduleRepository = new PrismaTrainerScheduleRepository(prisma);

  return new CreateTrainerSchedule(authenticate, trainerScheduleRepository);
};

export const useAddTrainerWorkShift = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const trainerScheduleRepository = new PrismaTrainerScheduleRepository(prisma);

  return new AddTrainerWorkShift(authenticate, trainerScheduleRepository);
};

export const useEditTrainerWorkShift = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const trainerScheduleRepository = new PrismaTrainerScheduleRepository(prisma);

  return new EditTrainerWorkShift(authenticate, trainerScheduleRepository);
};

export const useRemoveTrainerWorkShift = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const trainerScheduleRepository = new PrismaTrainerScheduleRepository(prisma);

  return new RemoveTrainerWorkShift(authenticate, trainerScheduleRepository);
};

export const useReserveSession = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const trainerScheduleRepository = new PrismaTrainerScheduleRepository(prisma);
  const reservationRepository = new PrismaReservationRepository(prisma);

  return new ReserveSession(authenticate, trainerScheduleRepository, reservationRepository);
};

export const useCancelReservationByMember = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const reservationRepository = new PrismaReservationRepository(prisma);

  return new CancelReservationByMember(authenticate, reservationRepository);
};
