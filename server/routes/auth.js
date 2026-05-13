import { Router } from "express";
import { toNodeHandler } from "better-auth/node";

export default function authRoutes(auth) {
  const router = Router();
  router.use(toNodeHandler(auth));
  return router;
}
