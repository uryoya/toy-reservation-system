import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateTrainerSchedule } from "#mod/reservation";

export type Command = {
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
 * システム立ち上げ時の最初のトレーナーを作成する
 */
export class CreateInitialTrainerAccount {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly createTrainerSchedule: CreateTrainerSchedule,
  ) {}

  async execute(command: Command): Promise<Result> {
    await this.checkSystemInitialized();

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

  private async checkSystemInitialized() {
    const { data: listUserData, error: listUserError } = await this.supabase.auth.admin.listUsers({ perPage: 1 });
    if (listUserError) {
      throw new Error(listUserError.message, { cause: listUserError });
    }
    if (listUserData.total > 0) {
      throw new Error("システムは初期化済みのためトレーナーアカウントを作成できません");
    }
  }
}
