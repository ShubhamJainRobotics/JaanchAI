import { useMutation } from "@tanstack/react-query";
import { ChallengeRequest, ChallengeOutput } from "shared";
import { apiClient } from "../lib/apiClient";

export function useChallengeEmail() {
  return useMutation({
    mutationFn: async (
      req: ChallengeRequest
    ): Promise<ChallengeOutput & { aiUsed: boolean }> => {
      return apiClient.generateChallenge(req);
    },
  });
}
