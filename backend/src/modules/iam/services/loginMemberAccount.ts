import { SystemError, UnauthenticatedError } from "#lib/application-service";
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
 * ユーザーログイン
 */
export class LoginMemberAccount {
  constructor(private readonly supabase: SupabaseClient) {}

  async execute(command: Command): Promise<Result> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: command.email,
      password: command.password,
    });
    if (error) {
      throw new UnauthenticatedError(error.message, { cause: error });
    }
    const { user: member, session } = data;
    if (!member.email || !member.user_metadata?.role) {
      throw new SystemError("認証で想定外のエラーが発生しました");
    }
    if (member.user_metadata.role !== "MEMBER") {
      throw new UnauthenticatedError("ログインできません");
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
