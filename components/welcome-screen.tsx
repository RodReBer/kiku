"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  return (
    <div
      className="h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#ff0000" }}
    >
      {/* Nube grande clickeable en el centro */}
      <motion.div
        className="cursor-pointer group relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onEnterDesktop}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          src="/nube-grande.png"
          alt="Entrar al Desktop"
          width={600}
          height={600}
          className="object-contain transition-all duration-300"
          draggable={false}
        />

      </motion.div>
    </div>
  )
}
