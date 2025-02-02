import type { Authenticate } from "#mod/iam";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Command = {
  accessToken: string;
  email: string;
  password: string;
};

export type Result = {
  trainer: {
    id: string;
    email: string;
  };
  session: {
    accessToken: string;
    refreshToken: string;
  };
};

/**
 * トレーナー追加
 */
export class AddTrainerAccount {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly authenticate: Authenticate
  ) {}

  async execute({ accessToken, ...command }: Command): Promise<Result> {
    await this.authenticate.execute({ accessToken, role: "TRAINER" });
    const { data, error } = await this.supabase.auth.signUp({
      email: command.email,
      password: command.password,
      options: {
        data: {
          role: "TRAINER",
        },
      },
    });
    if (error) {
      throw new Error(error.message, { cause: error });
    }
    const { user: trainer, session } = data;
    if (!trainer || !trainer.email || !session) {
      throw new Error("トレーナー登録で想定外のエラーが発生しました");
    }

    const result: Result = {
      trainer: {
        id: trainer.id,
        email: trainer.email,
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
    };

    return result;
  }
}
