import type { SupabaseClient } from "@supabase/supabase-js";
import type { Authenticate } from "#mod/iam";
import type { CreateTrainerSchedule } from "#mod/reservation";

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
    private readonly authenticate: Authenticate,
    private readonly createTrainerSchedule: CreateTrainerSchedule,
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

    // 新規作成したトレーナーのスケジュールを作成
    await this.createTrainerSchedule.execute({
      accessToken: session.access_token,
      timestamp: new Date(),
    });

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
