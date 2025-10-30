"use client";

import { collection, Timestamp, Firestore } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { User } from "firebase/auth";

type LogAction = "CREATE" | "UPDATE" | "DELETE";
type EntityType = "Order" | "JastipEvent" | "User";

/**
 * Logs a user activity to the 'activity_logs' collection in Firestore.
 * This is a non-blocking operation.
 *
 * @param firestore - The Firestore instance.
 * @param user - The authenticated user object. Must contain uid and email.
 * @param action - The action performed (CREATE, UPDATE, DELETE).
 * @param entityType - The type of entity being acted upon.
 * @param entityId - The ID of the entity.
 * @param details - A descriptive string of the action.
 */
export function logActivity(
  firestore: Firestore,
  user: User | null,
  action: LogAction,
  entityType: EntityType,
  entityId: string,
  details: string
): void {
  if (!user || !user.uid || !user.email) {
    console.warn("Activity not logged: User is not properly authenticated.");
    return;
  }

  const activityLog = {
    userId: user.uid,
    userEmail: user.email,
    action,
    entityType,
    entityId,
    details,
    timestamp: Timestamp.now(),
  };

  const logCollection = collection(firestore, "activity_logs");
  addDocumentNonBlocking(logCollection, activityLog);
}
