export type ApplicationService<Command extends CommandWithAuth<unknown> | CommandWithoutAuth<unknown>, Result> = {
  execute: (command: Command) => Promise<Result>;
};

export type CommandWithAuth<Form> = {
  accessToken: string;
  timestamp: Date;
  form: Form;
};

export type CommandWithoutAuth<Form> = {
  timestamp: Date;
  form: Form;
};

/** 認証エラー */
export class UnauthenticatedError extends Error {
  static {
    this.prototype.name = "UnauthenticatedError";
  }

  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}

/** 認可エラー */
export class UnauthorizedError extends Error {
  static {
    this.prototype.name = "UnauthorizedError";
  }

  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}

/** 検証エラー */
export class ValidationError extends Error {
  static {
    this.prototype.name = "ValidationError";
  }

  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}

/** システムエラー */
export class SystemError extends Error {
  static {
    this.prototype.name = "SystemError";
  }

  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}

/** 競合エラー */
export class ConflictError extends Error {
  static {
    this.prototype.name = "ConflictError";
  }

  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}
