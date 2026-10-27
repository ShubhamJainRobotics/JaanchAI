import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";

export const organizationsRouter = Router();

const QuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
});

organizationsRouter.get(
  "/",
  async (req: Request, res: Response, Next: NextFunction) => {
    try {
      const parsed = QuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid search query parameter.",
          },
        });
      }

      const q = parsed.data.q.toLowerCase();

      let query = supabaseAdmin
        .from("organizations")
        .select(
          "id, name, aliases, kind, official_domains, careers_url, scholarships_url, is_government, is_demo, needs_team_review"
        )
        .order("name", { ascending: true })
        .limit(10);

      if (q.length > 0) {
        query = query.or(`name.ilike.%${q}%,aliases.cs.{"${q}"}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const results = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        aliases: row.aliases || [],
        kind: row.kind,
        officialDomains: row.official_domains || [],
        careersUrl: row.careers_url,
        scholarshipsUrl: row.scholarships_url,
        isGovernment: row.is_government,
        isDemo: row.is_demo,
        needsTeamReview: row.needs_team_review,
      }));

      return res.json({ items: results });
    } catch (err) {
      Next(err);
    }
  }
);
