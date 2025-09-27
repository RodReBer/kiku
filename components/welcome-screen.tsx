"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-white flex items-center justify-center">
      {/* Fondo de pantalla: "kikucream" ocupando toda la pantalla */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="/inicio/kiku-cream-inicio.png"
          alt="KIKUCREAM"
          fill
          sizes="100vw"
          className="object-contain"
          priority
          draggable={false}
        />
      </div>

  {/* Capa superior: orden "click" -> "aquí" -> "caritas" (ajustable con top-[]) */}
  <div className="absolute z-10 left-1/2 -translate-x-1/2 top-[0%] ml-6 md:ml-20 flex flex-row items-center">
        {/* 1) CLICK */}

          <img
            src="/inicio/click-inicio.png"
            alt="Click"
            draggable={false}
            className="select-none max-w-none h-auto transform scale-75 -translate-y-1 md:-translate-y-5 -mr-6 md:-mr-8 lg:-mr-10"
          />

        {/* 2) AQUÍ (botón) */}
        <motion.div
          className="cursor-pointer -ml-16 md:-ml-24 lg:-ml-32 relative z-20"
          onClick={onEnterDesktop}
          initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          whileHover={{ rotate: 360 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          title="Entrar"
          role="button"
          aria-label="Entrar al escritorio"
        >
          <img
            src="/inicio/aqui-inicio.png"
            alt="Aquí"
            draggable={false}
            className="select-none max-w-none h-auto transform scale-75"
          />
        </motion.div>

        {/* 3) CARITAS */}
  <div className="select-none -ml-[4.5rem] md:-ml-[6.5rem] lg:-ml-[8.5rem] relative z-10">
          <img
            src="/inicio/caritas-inicio.png"
            alt="Caritas"
            draggable={false}
            className="select-none max-w-none h-auto transform scale-75"
          />
        </div>
      </div>
    </div>
  )
}
