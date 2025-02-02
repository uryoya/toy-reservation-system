import { serve } from "@hono/node-server";
import { app } from "./api/app.js";

const main = () => {
  serve({
    fetch: app.fetch,
    port: 8080,
  });
  console.log("Server is running on http://localhost:8080");
};

main();
