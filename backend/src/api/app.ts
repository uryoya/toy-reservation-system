import { Hono } from "hono";
import { logger } from "hono/logger";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  AddTrainerAccount,
  Authenticate,
  LoginTrainerAccount,
  LoginUserAccount,
  RegisterUserAccount,
} from "#mod/iam";
import { bearer } from "./middleware.js";

type Context = {
  Variables: {
    supabase: SupabaseClient;
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
  });

export const app = new Hono<Context>()
  .basePath("/api")
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
  .route("/user-app", userApp)
  .route("/trainer-app", trainerApp);
