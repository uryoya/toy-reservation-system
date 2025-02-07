export type ApplicationService<Cmd extends Command<unknown> | NoAuthCommand<unknown>, Result> = {
  execute: (command: Cmd) => Promise<Result>;
};

export type Command<Form> = {
  accessToken: string;
  timestamp: Date;
  form: Form;
};

export type NoAuthCommand<Form> = {
  timestamp: Date;
  form: Form;
};
