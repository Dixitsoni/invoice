import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

export const setupSecurity = (app) => {
  app.use(helmet());
  app.use(cors({ origin: "*", credentials: true }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
    })
  );
};
