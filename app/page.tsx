"use client"

import { useState, useEffect } from "react"
import LoadingScreen from "@/components/loading-screen"
import WelcomeScreen from "@/components/welcome-screen"
import MacDesktop from "@/components/mac-desktop"
import DebugPanel from "@/components/debug-panel"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "welcome" | "desktop">("welcome")
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Simular tiempo de carga
    // const timer = setTimeout(() => {
    //   setCurrentScreen("welcome")
    // }, 3000) // 3 segundos de loading

    // Enable debug panel with keyboard shortcut (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleEnterDesktop = () => {
    setCurrentScreen("desktop")
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      {/* {currentScreen === "loading" && <LoadingScreen />} */}
      {currentScreen === "welcome" && <WelcomeScreen onEnterDesktop={handleEnterDesktop} />}
      {currentScreen === "desktop" && <MacDesktop />}
      {showDebug && <DebugPanel />}
    </main>
  )
}
