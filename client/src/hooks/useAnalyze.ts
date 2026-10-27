import { useMutation } from "@tanstack/react-query";
import { AnalyzeRequest, AnalysisResult } from "shared";
import { apiClient } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";

export function useAnalyze() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (req: AnalyzeRequest): Promise<AnalysisResult> => {
      const result = await apiClient.analyze(req);
      apiClient.saveLocalRequest(req);
      if (result.saved && result.id) {
        navigate(`/results/${result.id}`);
      } else {
        apiClient.saveLocalResult(result);
        navigate("/results/local");
      }
      return result;
    },
  });
}
