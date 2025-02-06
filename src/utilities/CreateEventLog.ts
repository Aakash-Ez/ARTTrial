import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Logs an event to the Firestore database.
 * @param userId - The ID of the user who triggered the event.
 * @param eventString - A description of the event.
 * @returns A promise that resolves when the event log is successfully created.
 */
export const createEventLog = async (userId: string, eventString: string): Promise<void> => {
  try {
    const eventLog = {
      userId,
      event: eventString,
      timestamp: Timestamp.now(),
    };

    const eventLogsCollection = collection(db, "eventLogs");
    await addDoc(eventLogsCollection, eventLog);

    console.log("Event log created successfully:", eventLog);
  } catch (error) {
    console.error("Error creating event log:", error);
    throw new Error("Failed to create event log.");
  }
};