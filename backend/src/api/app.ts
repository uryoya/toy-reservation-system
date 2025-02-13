import { Hono } from "hono";
import { logger } from "hono/logger";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { TZDate } from "@date-fns/tz";
import { endOfMonth, startOfMonth } from "date-fns";
import {
  useAddTrainerAccount,
  useAuthenticate,
  useCreateInitialTrainerAccount,
  useLoginTrainerAccount,
  useLoginUserAccount,
  useRegisterUserAccount,
} from "#mod/iam";
import {
  useAddTrainerWorkShift,
  useCancelReservationByMember,
  useEditTrainerWorkShift,
  useRemoveTrainerWorkShift,
  useReserveSession,
} from "#mod/reservation";
import { bearer } from "./middleware.js";
import { useRegisterTrainerProfile } from "#mod/profile";
import { ConflictError, UnauthenticatedError, UnauthorizedError, ValidationError } from "#lib/application-service";

type Context = {
  Variables: {
    supabase: SupabaseClient;
    prisma: PrismaClient;
  };
};

const userApp = new Hono<Context>()
  .post("/users/register", async (c) => {
    const body = await c.req.json();
    const registerUserAccount = useRegisterUserAccount(c.var.supabase);

    const command = {
      email: body.email,
      password: body.password,
    };
    const result = await registerUserAccount.execute(command);

    return c.json(result, 201);
  })
  .post("/users/login", async (c) => {
    const body = await c.req.json();
    const loginUserAccount = useLoginUserAccount(c.var.supabase);

    const command = {
      email: body.email,
      password: body.password,
    };
    const result = await loginUserAccount.execute(command);

    return c.json(result, 200);
  })
  .post("/reservations", bearer(), async (c) => {
    const body = await c.req.json();
    const reserveSession = useReserveSession(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        trainerId: body.trainerId,
        start: new Date(body.start),
      },
    };
    const result = await reserveSession.execute(command);

    return c.json(result, 201);
  })
  .get("/reservations", bearer(), async (c) => {
    const { supabase, prisma } = c.var;
    const authenticate = useAuthenticate(supabase);

    const { account: member } = await authenticate.execute({ accessToken: c.var.accessToken, role: "USER" });

    const reservations = await prisma.reservation.findMany({
      include: {
        canceled: true,
      },
      where: {
        traineeId: member.id,
      },
    });

    return c.json(reservations);
  })
  .post("/reservations/:id/cancel", bearer(), async (c) => {
    const body = await c.req.json();
    const cancelReservationByMember = useCancelReservationByMember(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        reservationId: c.req.param("id"),
        reason: body.reason,
      },
    };

    const result = await cancelReservationByMember.execute(command);

    return c.json(result, 200);
  })
  .get("/trainers", bearer(), async (c) => {
    const { supabase, prisma, accessToken } = c.var;
    const authenticate = useAuthenticate(supabase);

    await authenticate.execute({ accessToken, role: "USER" });
    const trainers = await prisma.trainerProfile.findMany();

    return c.json(trainers, 200);
  });

const trainerApp = new Hono<Context>()
  .post("/trainers/init", async (c) => {
    const body = await c.req.json();
    const createInitialTrainerAccount = useCreateInitialTrainerAccount(c.var.supabase, c.var.prisma);

    const command = {
      email: body.email,
      password: body.password,
    };
    const result = await createInitialTrainerAccount.execute(command);

    return c.json(result, 201);
  })
  .post("/trainers/add", bearer(), async (c) => {
    const body = await c.req.json();
    const addTrainerAccount = useAddTrainerAccount(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      email: body.email,
      password: body.password,
    };
    const result = await addTrainerAccount.execute(command);

    return c.json(result, 201);
  })
  .post("/trainers/login", async (c) => {
    const body = await c.req.json();
    const loginTrainerAccount = useLoginTrainerAccount(c.var.supabase);

    const command = {
      email: body.email,
      password: body.password,
    };
    const result = await loginTrainerAccount.execute(command);

    return c.json(result, 200);
  })
  .get("/trainers/schedules", bearer(), async (c) => {
    const year = c.req.query("year") ?? new Date().getFullYear();
    const month = c.req.query("month") ?? new Date().getMonth() + 1;
    const authenticate = useAuthenticate(c.var.supabase);

    const { account: trainer } = await authenticate.execute({ accessToken: c.var.accessToken, role: "TRAINER" });

    const queryMonth = new TZDate(+year, +month - 1, 1, "Asia/Tokyo");
    const schedule = await c.var.prisma.trainerWorkShift.findMany({
      select: {
        id: true,
        start: true,
        end: true,
      },
      where: {
        trainerId: trainer.id,
        start: {
          gte: startOfMonth(queryMonth),
          lte: endOfMonth(queryMonth),
        },
      },
    });

    return c.json(schedule);
  })
  .post("/trainers/schedules", bearer(), async (c) => {
    const body = await c.req.json();
    const addTrainerWorkShift = useAddTrainerWorkShift(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        start: new Date(body.start),
        end: new Date(body.end),
      },
    };
    const result = await addTrainerWorkShift.execute(command);

    return c.json(result, 201);
  })
  .post("/trainers/schedules/:id", bearer(), async (c) => {
    const shiftId = c.req.param("id");
    const body = await c.req.json();
    const editTrainerWorkShift = useEditTrainerWorkShift(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        id: shiftId,
        start: body.start && new Date(body.start),
        end: body.end && new Date(body.end),
      },
    };
    const result = await editTrainerWorkShift.execute(command);

    return c.json(result, 200);
  })
  .delete("/trainers/schedules/:id", bearer(), async (c) => {
    const shiftId = c.req.param("id");
    const removeTrainerWorkShift = useRemoveTrainerWorkShift(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        id: shiftId,
      },
    };
    const result = await removeTrainerWorkShift.execute(command);

    return c.json(result, 200);
  })
  .get("/reservations", bearer(), async (c) => {
    const { supabase, prisma, accessToken } = c.var;
    const authenticate = useAuthenticate(supabase);

    await authenticate.execute({ accessToken, role: "TRAINER" });

    const reservations = await prisma.reservation.findMany({
      include: {
        canceled: true,
      },
    });

    return c.json(reservations, 200);
  })
  .post("/profiles", bearer(), async (c) => {
    const body = await c.req.json();
    const registerTrainerProfile = useRegisterTrainerProfile(c.var.supabase, c.var.prisma);

    const command = {
      accessToken: c.var.accessToken,
      timestamp: new Date(),
      form: {
        name: body.name,
        age: body.age,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    };
    const result = await registerTrainerProfile.execute(command);

    return c.json(result, 201);
  })
  .get("/profiles/me", bearer(), async (c) => {
    const authenticate = useAuthenticate(c.var.supabase);
    const prisma = c.get("prisma");

    const { account: trainer } = await authenticate.execute({ accessToken: c.var.accessToken, role: "TRAINER" });
    const profile = await prisma.trainerProfile.findUnique({
      where: {
        id: trainer.id,
      },
    });

    return c.json(profile, 200);
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
  .route("/trainer-app", trainerApp)
  .onError(async (error, c) => {
    if (error instanceof UnauthenticatedError) {
      return c.json({ error: error.message }, 401);
    }
    if (error instanceof UnauthorizedError) {
      return c.json({ error: error.message }, 403);
    }
    if (error instanceof ValidationError) {
      console.warn(error);
      return c.json({ error: error.message }, 400);
    }
    if (error instanceof ConflictError) {
      console.warn(error);
      return c.json({ error: error.message }, 409);
    }
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  });
