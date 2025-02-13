import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import { useAuthenticate } from "#mod/iam";
import { RegisterTrainerProfile } from "./services/registerTrainerProfile.js";

export type { RegisterTrainerProfile } from "./services/registerTrainerProfile.js";

export const useRegisterTrainerProfile = (supabase: SupabaseClient, prisma: PrismaClient) => {
  const authenticate = useAuthenticate(supabase);

  return new RegisterTrainerProfile(prisma, authenticate);
};
