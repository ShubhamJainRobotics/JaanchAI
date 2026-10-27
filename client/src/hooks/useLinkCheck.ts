import { useMutation } from "@tanstack/react-query";
import { LinkCheckRequest, LinkCheckResult } from "shared";
import { apiClient } from "../lib/apiClient";

export function useLinkCheck() {
  return useMutation({
    mutationFn: async (req: LinkCheckRequest): Promise<LinkCheckResult> => {
      return apiClient.checkLink(req);
    },
  });
}
