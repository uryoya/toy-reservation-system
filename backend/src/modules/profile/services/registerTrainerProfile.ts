import type { PrismaClient, TrainerProfile } from "@prisma/client";
import type { Authenticate } from "#mod/iam";
import type { ApplicationService, CommandWithAuth } from "#lib/application-service";

export type Command = CommandWithAuth<{
  name: string;
  age: number;
  description: string;
  imageUrl: string;
}>;

export type Result = {
  profile: TrainerProfile;
};

/**
 * トレーナーのプロフィールを登録する
 */
export class RegisterTrainerProfile implements ApplicationService<Command, Result> {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly authenticate: Authenticate,
  ) {}

  async execute({ accessToken, form }: Command): Promise<Result> {
    const { account: trainer } = await this.authenticate.execute({ accessToken, role: "TRAINER" });

    const profile = await this.prisma.trainerProfile.create({
      data: {
        id: trainer.id,
        name: form.name,
        age: form.age,
        description: form.description,
        imageUrl: form.imageUrl,
      },
    });

    return { profile };
  }
}
