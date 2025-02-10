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
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("accessToken", token);
    await next();
  });
