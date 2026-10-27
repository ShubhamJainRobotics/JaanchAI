import { Router, Request, Response } from "express";
import {
  OFFICIAL_PORTALS,
  HELPLINE,
  ADVISORY,
  DOMAIN_GUIDES,
} from "shared";

const router = Router();

router.get("/resources", (_req: Request, res: Response) => {
  res.json({
    portals: OFFICIAL_PORTALS,
    helpline: HELPLINE,
    evidenceToKeep: ADVISORY.evidenceToKeep,
    domainGuides: DOMAIN_GUIDES,
  });
});

export default router;
