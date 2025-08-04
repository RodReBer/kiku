// This file ensures Firebase is correctly initialized
import { db } from "@/lib/firebase";
import { checkAndAddSampleData } from "@/lib/sample-data";

// Check if we have data, and add sample data if needed
if (typeof window !== 'undefined') {
  // Only run on the client side
  checkAndAddSampleData()
    .then(added => {
      if (added) {
        console.log("Sample data was added to Firebase");
      } else {
        console.log("Firebase data already exists");
      }
    })
    .catch(err => {
      console.error("Error initializing data:", err);
    });
}

// Export a dummy function to ensure this file gets imported
export const ensureFirebaseInitialized = () => {
  return !!db;
};
