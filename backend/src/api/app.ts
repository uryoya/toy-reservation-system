import { Hono } from "hono";
import { logger } from "hono/logger";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import {
  AddTrainerAccount,
  Authenticate,
  CreateInitialTrainerAccount,
  LoginTrainerAccount,
  LoginUserAccount,
  RegisterUserAccount,
} from "#mod/iam";
import {
  AddTrainerWorkShift,
  CreateTrainerSchedule,
  EditTrainerWorkShift,
  PrismaTrainerScheduleRepository,
} from "#mod/reservation";
import { bearer } from "./middleware.js";

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
    const authenticate = new Authenticate(c.var.supabase);
    const trainerScheduleRepository = new PrismaTrainerScheduleRepository(c.var.prisma);
    const createTrainerSchedule = new CreateTrainerSchedule(authenticate, trainerScheduleRepository);
    const createInitialTrainerAccount = new CreateInitialTrainerAccount(c.var.supabase, createTrainerSchedule);

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
    const trainerScheduleRepository = new PrismaTrainerScheduleRepository(c.var.prisma);
    const createTrainerSchedule = new CreateTrainerSchedule(authenticate, trainerScheduleRepository);
    const addTrainerAccount = new AddTrainerAccount(c.var.supabase, authenticate, createTrainerSchedule);

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
    const trainerScheduleRepository = new PrismaTrainerScheduleRepository(c.var.prisma);
    const addTrainerWorkShift = new AddTrainerWorkShift(authenticate, trainerScheduleRepository);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        start: new Date(body.start),
        end: new Date(body.end),
      },
    };

    try {
      const result = await addTrainerWorkShift.execute(command);
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
  .post("/trainers/schedules/:id", bearer(), async (c) => {
    const shiftId = c.req.param("id");
    const body = await c.req.json();
    const authenticate = new Authenticate(c.var.supabase);
    const trainerScheduleRepository = new PrismaTrainerScheduleRepository(c.var.prisma);
    const editTrainerWorkShift = new EditTrainerWorkShift(authenticate, trainerScheduleRepository);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        id: shiftId,
        start: body.start && new Date(body.start),
        end: body.end && new Date(body.end),
      },
    };

    console.log(command);

    try {
      const result = await editTrainerWorkShift.execute(command);
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
    const supabase = createClient(process.env.SUPABASE_API_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const prisma = new PrismaClient();

    c.set("supabase", supabase);
    c.set("prisma", prisma);

    await next();
  })
  .basePath("/api")
  .route("/user-app", userApp)
  .route("/trainer-app", trainerApp);
