import { SystemError, ValidationError } from "#lib/application-service";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Command = {
  email: string;
  password: string;
};

export type Result = {
  user: {
    id: string;
    email: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
  };
};

/**
 * ユーザー登録
 */
export class RegisterUserAccount {
  constructor(private readonly supabase: SupabaseClient) {}

  async execute(command: Command): Promise<Result> {
    const { data, error } = await this.supabase.auth.signUp({
      email: command.email,
      password: command.password,
      options: {
        data: {
          role: "USER",
        },
      },
    });
    if (error) {
      throw new ValidationError(error.message, { cause: error });
    }
    const { user, session } = data;
    if (!user || !user.email || !session) {
      throw new SystemError("ユーザー登録で想定外のエラーが発生しました");
    }

    const result: Result = {
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
    };

    return result;
  }
}
