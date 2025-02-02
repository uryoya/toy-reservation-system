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
 * ユーザーログイン
 */
export class LoginUserAccount {
  constructor(private readonly supabase: SupabaseClient) {}

  async execute(command: Command): Promise<Result> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: command.email,
      password: command.password,
    });
    if (error) {
      throw new Error(error.message, { cause: error });
    }
    const { user, session } = data;
    if (!user.email || !user.user_metadata?.role) {
      throw new Error("認証で想定外のエラーが発生しました");
    }
    if (user.user_metadata.role !== "USER") {
      throw new Error("ログインできません");
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
