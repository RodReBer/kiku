// This file will add sample data to Firebase if it's missing
import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { initialProjectsData } from "./data";

export async function checkAndAddSampleData() {
  try {
    // Check if there are any projects
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    
    // If no projects found, add the sample data
    if (projectsSnapshot.empty) {
      console.log("No projects found in Firebase, adding sample data...");
      
      // Add all the initial projects
      for (const project of initialProjectsData) {
        await addDoc(collection(db, "projects"), {
          name: project.name,
          type: project.type,
          category: project.category,
          description: project.description,
          status: project.status,
          photos: project.photos || [],
          coverImage: project.coverImage,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      console.log("Sample data added successfully!");
      return true;
    } else {
      console.log(`Found ${projectsSnapshot.size} projects in Firebase`);
      return false;
    }
  } catch (error) {
    console.error("Error checking/adding sample data:", error);
    return false;
  }
}
