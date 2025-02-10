import { SystemError, UnauthenticatedError, UnauthorizedError } from "#lib/application-service";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Command = {
  accessToken: string;
  role: "USER" | "TRAINER";
};

export type Result = {
  account: {
    id: string;
    email: string;
  };
};

/**
 * アカウント認証
 */
export class Authenticate {
  constructor(private readonly supabase: SupabaseClient) {}

  async execute(command: Command): Promise<Result> {
    const { data, error } = await this.supabase.auth.getUser(command.accessToken);
    if (error) {
      throw new UnauthenticatedError(error.message, { cause: error });
    }
    const { user } = data;
    if (!user.email || !user.user_metadata?.role) {
      throw new SystemError("認証で想定外のエラーが発生しました");
    }
    if (user.user_metadata.role !== command.role) {
      throw new UnauthorizedError("アクセスできません");
    }

    const result: Result = {
      account: {
        id: user.id,
        email: user.email,
      },
    };

    return result;
  }
}
