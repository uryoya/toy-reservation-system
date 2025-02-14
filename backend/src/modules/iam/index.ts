import type { SupabaseClient } from "@supabase/supabase-js";
import { useCreateTrainerSchedule } from "#mod/reservation";
import { Authenticate } from "./services/authenticate.js";
import { RegisterMemberAccount } from "./services/registerMemberAccount.js";
import { LoginMemberAccount } from "./services/loginMemberAccount.js";
import { CreateInitialTrainerAccount } from "./services/createInitialTrainerAccount.js";
import type { PrismaClient } from "@prisma/client";
import { AddTrainerAccount } from "./services/addTrainerAccount.js";
import { LoginTrainerAccount } from "./services/loginTrainerAccount.js";

export type { Authenticate } from "./services/authenticate.js";
export type { RegisterMemberAccount } from "./services/registerMemberAccount.js";
export type { LoginMemberAccount } from "./services/loginMemberAccount.js";
export type { CreateInitialTrainerAccount } from "./services/createInitialTrainerAccount.js";
export type { AddTrainerAccount } from "./services/addTrainerAccount.js";
export type { LoginTrainerAccount } from "./services/loginTrainerAccount.js";

export const useAuthenticate = (supabase: SupabaseClient) => {
  return new Authenticate(supabase);
};

export const useRegisterMemberAccount = (supabase: SupabaseClient) => {
  return new RegisterMemberAccount(supabase);
};

export const useLoginMemberAccount = (supabase: SupabaseClient) => {
  return new LoginMemberAccount(supabase);
};

export const useCreateInitialTrainerAccount = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const createTrainerSchedule = useCreateTrainerSchedule(supabase, prisma);

  return new CreateInitialTrainerAccount(supabase, createTrainerSchedule);
};

export const useAddTrainerAccount = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);
  const createTrainerSchedule = useCreateTrainerSchedule(supabase, prisma);

  return new AddTrainerAccount(supabase, authenticate, createTrainerSchedule);
};

export const useLoginTrainerAccount = (supabase: SupabaseClient) => {
  return new LoginTrainerAccount(supabase);
};
