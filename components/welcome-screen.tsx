"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  const [clickTurns, setClickTurns] = useState(0)
  return (
    <div className="fixed inset-0 w-full h-dvh overflow-hidden overscroll-none bg-white flex items-center justify-center select-none">
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

        {/* Mobile: Nuevo layout personalizado */}
        {/* Dejamos este contenedor vacío para mobile porque el layout móvil lo renderizamos fuera, con z más alto */}
        <div className="md:hidden" />
      </div>

    {/* Desktop: CLICK / AQUI / CARITAS grandes centradas un poco más arriba del medio */}
  <div className="absolute top-[10%] left-1/2 md:left-[52%] xl:left-[55%] 2xl:left-[57%] -translate-x-1/2 z-[2000] hidden md:flex flex-row items-center justify-center pointer-events-auto">
          <motion.img
          src="/inicio/CLICK.svg"
          alt="Click"
          draggable={false}
          onClick={() => setClickTurns(t => t + 1)}
          animate={{ rotate: clickTurns * 360 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          className="select-none max-w-none h-[18vh] xl:h-[22vh] 2xl:h-[24vh] w-auto cursor-pointer"
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
            className="select-none max-w-none h-[18vh] xl:h-[22vh] 2xl:h-[24vh] w-auto mt-11 -ml-6"
          />
        </motion.div>
        <div className="relative select-none">
          <img
            src="/inicio/CARITA.svg"
            alt="Caritas"
            draggable={false}
            className="select-none max-w-none h-[12vh] xl:h-[16vh] 2xl:h-[18vh] w-auto"
          />
        </div>
      </div>

      {/* Mobile: full viewport composition with slight responsive scale to reduce side whitespace */}
      <div className="md:hidden absolute inset-0 z-10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/inicio celu/CELULAR INICIO.svg"
            alt="KIKUCREAM mobile composition"
            className="mobile-composition block w-full h-full object-contain pt-[1.2vh] pointer-events-none select-none max-[380px]:scale-[1.2] max-[350px]:scale-[1.08] max-[330px]:scale-[1.11] origin-center"
            draggable={false}
            aria-hidden="true"
          />
        </div>
        {/* AQUI button wrapper centers translation separate from rotation to avoid jump */}
  <div className="absolute left-1/2 top-[74%] -translate-x-1/2 ">
          <motion.img
            src="/inicio/AQUI.svg"
            alt="Aquí"
            whileTap={{ rotate: 360 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            onClick={onEnterDesktop}
            style={{ transformOrigin: '50% 50%' }}
            className="w-[74vw] max-w-[400px] h-auto transform max-[420px]:w-[78vw] max-[380px]:w-[84vw] max-[340px]:w-[88vw] cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
