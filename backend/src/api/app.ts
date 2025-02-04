import { Hono } from "hono";
import { logger } from "hono/logger";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  AddTrainerAccount,
  Authenticate,
  CreateInitialTrainerAccount,
  LoginTrainerAccount,
  LoginUserAccount,
  RegisterUserAccount,
} from "#mod/iam";
import {
  CreateMonthlyTrainerSchedule,
  PrismaTrainerScheduleRepository,
} from "#mod/reservation";
import { bearer } from "./middleware.js";
import type { PrismaClient } from "@prisma/client";

type Context = {
  Variables: {
    supabase: SupabaseClient;
    prisma: PrismaClient;
  };
};

const userApp = new Hono<Context>()
  .post("/users/register", async (c) => {
    const body = await c.req.json();
    const supabase = c.get("supabase");
    const registerUserAccount = new RegisterUserAccount(supabase);

    const command = {
      email: body.email,
      password: body.password,
    };

    try {
      const result = await registerUserAccount.execute(command);
      c.status(201);
      return c.json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        c.status(403);
        return c.json({ error: error.message });
      } else {
        c.status(500);
        return c.json({ error: "Internal server error" });
      }
    }
  })
  .post("/users/login", async (c) => {
    const body = await c.req.json();
    const supabase = c.get("supabase");
    const loginUserAccount = new LoginUserAccount(supabase);

    const command = {
      email: body.email,
      password: body.password,
    };

    try {
      const result = await loginUserAccount.execute(command);
      c.status(201);
      return c.json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        c.status(403);
        return c.json({ error: error.message });
      } else {
        c.status(500);
        return c.json({ error: "Internal server error" });
      }
    }
  });

const trainerApp = new Hono<Context>()
  .post("/trainers/init", async (c) => {
    const body = await c.req.json();
    const createInitialTrainerAccount = new CreateInitialTrainerAccount(
      c.var.supabase
    );

    const command = {
      email: body.email,
      password: body.password,
    };

    try {
      const result = await createInitialTrainerAccount.execute(command);
      c.status(201);
      return c.json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        c.status(403);
        return c.json({ error: error.message });
      } else {
        c.status(500);
        return c.json({ error: "Internal server error" });
      }
    }
  })
  .post("/trainers/add", bearer(), async (c) => {
    const body = await c.req.json();
    const authenticate = new Authenticate(c.var.supabase);
    const addTrainerAccount = new AddTrainerAccount(
      c.var.supabase,
      authenticate
    );

    const command = {
      accessToken: c.var.accessToken,
      email: body.email,
      password: body.password,
    };

    try {
      const result = await addTrainerAccount.execute(command);
      c.status(201);
      return c.json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        c.status(403);
        return c.json({ error: error.message });
      } else {
        c.status(500);
        return c.json({ error: "Internal server error" });
      }
    }
  })
  .post("/trainers/login", async (c) => {
    const body = await c.req.json();
    const loginTrainerAccount = new LoginTrainerAccount(c.var.supabase);

    const command = {
      email: body.email,
      password: body.password,
    };

    try {
      const result = await loginTrainerAccount.execute(command);
      c.status(201);
      return c.json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        c.status(403);
        return c.json({ error: error.message });
      } else {
        c.status(500);
        return c.json({ error: "Internal server error" });
      }
    }
  })
  .post("/trainers/schedules", bearer(), async (c) => {
    const body = await c.req.json();
    const authenticate = new Authenticate(c.var.supabase);
    const trainerScheduleRepository = new PrismaTrainerScheduleRepository(
      c.var.prisma
    );
    const createTrainerSchedule = new CreateMonthlyTrainerSchedule(
      authenticate,
      trainerScheduleRepository
    );

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        year: body.year,
        month: body.month,
        dates: body.dates,
      },
    };

    try {
      const result = await createTrainerSchedule.execute(command);
      c.status(201);
      return c.json(result);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        c.status(403);
        return c.json({ error: error.message });
      } else {
        c.status(500);
        return c.json({ error: "Internal server error" });
      }
    }
  });

export const app = new Hono<Context>()
  .use(logger())
  .use(async (c, next) => {
    c.set(
      "supabase",
      createClient(
        process.env.SUPABASE_API_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    );
    await next();
  })
  .basePath("/api")
  .route("/user-app", userApp)
  .route("/trainer-app", trainerApp);
