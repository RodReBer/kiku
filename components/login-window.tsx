"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginWindowProps {
  onLoginSuccess: () => void
  onClose: () => void
}

export default function LoginWindow({ onLoginSuccess, onClose }: LoginWindowProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded credentials for demonstration
    if (username === "admin" && password === "kiku") {
      onLoginSuccess()
      setError("")
    } else {
      setError("Usuario o contraseña incorrectos.")
    }
  }

  return (
    <Card className="w-full max-w-md bg-white border-2 border-gray-400" style={{ borderStyle: "outset" }}>
      <CardHeader
        className="border-b-2 border-gray-400 flex flex-row items-center justify-between p-2"
        style={{ borderStyle: "inset" }}
      >
        <CardTitle className="text-sm font-bold text-black">Iniciar Sesión</CardTitle>
        <Button
          variant="ghost"
          onClick={onClose}
          className="p-1 h-auto w-auto text-black hover:bg-gray-400"
          style={{ borderStyle: "outset" }}
        >
          X
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-black">
              Usuario:
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 bg-gray-50 border border-gray-300 text-black"
              style={{ borderStyle: "inset" }}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-black">
              Contraseña:
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-gray-50 border border-gray-300 text-black"
              style={{ borderStyle: "inset" }}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            style={{ borderStyle: "outset" }}
          >
            Iniciar Sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
