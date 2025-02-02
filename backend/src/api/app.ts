import { Hono } from "hono";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { LoginUserAccount, RegisterUserAccount } from "#mod/iam";
import { logger } from "hono/logger";

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

export const app = new Hono<Context>()
  .basePath("/api")
  .use(logger())
  .use(async (c, next) => {
    c.set(
      "supabase",
      createClient(
        process.env.SUPABASE_API_URL!,
        process.env.SUPABASE_ANON_KEY!
      )
    );
    await next();
  })
  .route("/user-app", userApp);
