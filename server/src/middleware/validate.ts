import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[source];
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const error = result.error as ZodError;
      const details = error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      }));

      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details,
        },
      });
      return;
    }

    req[source] = result.data;
    next();
  };
}
