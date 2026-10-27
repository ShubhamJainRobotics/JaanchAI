import { useState } from "react";
import { ChecklistItem } from "shared";
import { apiClient } from "../lib/apiClient";

export function useChecklist(initialItems: ChecklistItem[], isSavedAnalysis: boolean) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const toggleItem = async (index: number) => {
    const item = items[index];
    if (!item) return;

    const newCompleted = !item.completed;
    const updatedItems = [...items];
    updatedItems[index] = {
      ...item,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null,
    };
    setItems(updatedItems);

    // If analysis is saved in database and item has a DB id, sync to backend
    if (isSavedAnalysis && item.id) {
      try {
        await apiClient.patchChecklist(item.id, { completed: newCompleted });
      } catch (err) {
        // Rollback on failure
        console.error("Failed to sync checklist completion:", err);
        setItems(items);
      }
    } else {
      // For local guest session, update sessionStorage
      const current = apiClient.getLocalResult();
      if (current) {
        current.checklist = updatedItems;
        apiClient.saveLocalResult(current);
      }
    }
  };

  return {
    items,
    toggleItem,
  };
}
