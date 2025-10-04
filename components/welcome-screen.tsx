"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  const [clickTurns, setClickTurns] = useState(0)
  return (
    <div className="h-screen w-full relative overflow-hidden bg-white flex items-center justify-center">
      {/* Fondo de pantalla: letras SVG componiendo KIKUCREAM (responsive) */}
  <div className="absolute inset-0 z-0 flex items-center justify-between pointer-events-none">
    {/* Desktop/Tablet: una sola fila KIKUCREAM ocupando todo el ancho */}
    <div className="hidden md:flex w-full h-full items-end justify-center pointer-events-none select-none flex-nowrap overflow-hidden gap-9">
      {/* KIKU */}
      <div className="flex flex-row items-end gap-7">
        {["/inicio/KK.svg", "/inicio/I.svg", "/inicio/KK.svg", "/inicio/U.svg"].map((src, idx) => (
          <img
            key={src + idx}
            src={src}
            alt=""
            draggable={false}
            className="h-[90vh] max-h-screen w-auto"
          />
        ))}
      </div>
      {/* CREAM */}
      <div className="flex flex-row items-end gap-7">
        {[
          "/inicio/C.svg",
          "/inicio/R.svg",
          "/inicio/E.svg",
          "/inicio/A.svg",
          "/inicio/M.svg"
        ].map((src, idx) => (
          <img
            key={src + idx}
            src={src}
            alt=""
            draggable={false}
            className="h-[90vh] max-h-screen w-auto"
          />
        ))}
      </div>
    </div>

        {/* Mobile: dos filas, arriba KIKU y abajo CREAM, ocupando todo el ancho */}
        <div className="md:hidden flex flex-col items-center justify-center leading-none pointer-events-none select-none w-full h-full">
          <div className="flex items-end justify-between w-full">
            {[
              "/inicio celu/K CELU.svg",
              "/inicio celu/I CELU.svg",
              "/inicio celu/K CELU.svg",
              "/inicio celu/U CELU.svg",
            ].map((src, idx) => (
              <img
                key={src + idx}
                src={src}
                alt=""
                draggable={false}
                className="h-[18vh] sm:h-[20vh] w-auto"
              />
            ))}
          </div>
          <div className="mt-[2.5vw] flex items-end justify-between w-full">
            {[
              "/inicio celu/C CELU.svg",
              "/inicio celu/R CELU.svg",
              "/inicio celu/E CELU.svg",
              "/inicio celu/A CELU.svg",
              "/inicio celu/M CELU.svg",
            ].map((src, idx) => (
              <img
                key={src + idx}
                src={src}
                alt=""
                draggable={false}
                className="h-[18vh] sm:h-[20vh] w-auto"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: CLICK / AQUI / CARITAS grandes centradas un poco más arriba del medio */}
  <div className="absolute top-[10%] left-0 ml-6 md:ml-80 z-[2000] hidden md:flex flex-row items-center justify-start pointer-events-auto">
          <motion.img
          src="/inicio/CLICK.svg"
          alt="Click"
          draggable={false}
          onClick={() => setClickTurns(t => t + 1)}
          animate={{ rotate: clickTurns * 360 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          className="select-none max-w-none h-[18vh] xl:h-[22vh] 2xl:h-[24vh] w-auto cursor-pointer drop-shadow-lg"
        />
          <motion.div
          className="relative cursor-pointer"
          onClick={onEnterDesktop}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          title="Entrar"
          role="button"
          aria-label="Entrar al escritorio"
        >
            <motion.img
            src="/inicio/AQUI.svg"
            alt="Aquí"
            draggable={false}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="select-none max-w-none h-[18vh] xl:h-[22vh] 2xl:h-[24vh] w-auto drop-shadow-lg mt-11 -ml-6"
          />
        </motion.div>
        <div className="relative select-none">
          <img
            src="/inicio/CARITA.svg"
            alt="Caritas"
            draggable={false}
            className="select-none max-w-none h-[12vh] xl:h-[16vh] 2xl:h-[18vh] w-auto drop-shadow-lg"
          />
        </div>
      </div>

      {/* Mobile: versión condensada (click no rota aquí) */}
      <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 z-[120] flex flex-row items-center pointer-events-auto">
        <img
          src="/inicio/CLICK.svg"
          alt="Click"
          draggable={false}
          className="select-none max-w-none h-auto transform scale-75 -mr-4"
        />
        <motion.div
          className="cursor-pointer"
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
            src="/inicio/AQUI.svg"
            alt="Aquí"
            draggable={false}
            className="select-none max-w-none h-auto transform scale-75"
          />
        </motion.div>
        <div className="select-none -ml-6 relative">
          <img
            src="/inicio/CARITA.svg"
            alt="Caritas"
            draggable={false}
            className="select-none max-w-none h-auto transform scale-75"
          />
        </div>
      </div>
    </div>
  )
}
