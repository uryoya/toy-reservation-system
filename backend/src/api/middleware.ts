import { createMiddleware } from "hono/factory";

type BearerMiddlewareContext = {
  Variables: {
    accessToken: string;
  };
};

/**
 * Bearer認証
 *
 * Bearerトークンを取得してContextに渡します。トークンの検証はハンドラー側で行います。
 */
export const bearer = () =>
  createMiddleware<BearerMiddlewareContext>(async (c, next) => {
    const authorization = c.req.header("Authorization");
    if (!authorization) {
      c.status(401);
      return c.json({ error: "Unauthorized" });
    }

    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") {
      c.status(401);
      return c.json({ error: "Unauthorized" });
    }

    c.set("accessToken", token);
    await next();
  });
