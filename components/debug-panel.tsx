"use client"

import { useState } from "react"
import { useData } from "@/context/data-context"
import { Button } from "@/components/ui/button"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DebugPanel() {
  const { projects, loading, error, refreshData } = useData()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkFirebaseConnection = async () => {
    setIsChecking(true)
    try {
      const projectsSnapshot = await getDocs(collection(db, "projects"))
      const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      setDebugInfo({
        firebaseConnected: true,
        projectsFound: projectsData.length,
        projectsData: projectsData,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error("Firebase connection check error:", err)
      setDebugInfo({
        firebaseConnected: false,
        error: JSON.stringify(err),
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="font-medium mb-2 flex justify-between items-center">
        Debug Panel
        <Button variant="outline" size="sm" onClick={() => setDebugInfo(null)}>
          Close
        </Button>
      </h3>
      
      <div className="space-y-3 text-xs">
        <div>
          <p><strong>Context Projects:</strong> {projects.length}</p>
          <p><strong>Loading:</strong> {loading ? "Yes" : "No"}</p>
          <p><strong>Error:</strong> {error || "None"}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkFirebaseConnection}
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Check Firebase"}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </div>
        
        {debugInfo && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
