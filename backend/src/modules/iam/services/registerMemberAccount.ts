import { SystemError, ValidationError } from "#lib/application-service";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Command = {
  email: string;
  password: string;
};

export type Result = {
  member: {
    id: string;
    email: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
  };
};

/**
 * 会員登録
 */
export class RegisterMemberAccount {
  constructor(private readonly supabase: SupabaseClient) {}

  async execute(command: Command): Promise<Result> {
    const { data, error } = await this.supabase.auth.signUp({
      email: command.email,
      password: command.password,
      options: {
        data: {
          role: "MEMBER",
        },
      },
    });
    if (error) {
      throw new ValidationError(error.message, { cause: error });
    }
    const { user: member, session } = data;
    if (!member || !member.email || !session) {
      throw new SystemError("会員登録で想定外のエラーが発生しました");
    }

    const result: Result = {
      member: {
        id: member.id,
        email: member.email,
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
    };

    return result;
  }
}
