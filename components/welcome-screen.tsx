"use client"

import { motion, useAnimationControls } from "framer-motion"
import { useState, useEffect } from "react"
import { useData } from "@/context/data-context"
import Image from "next/image"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  const [clickTurns, setClickTurns] = useState(0)
  // Mobile-only: control AQUI spin before redirect
  const mobileAquiControls = useAnimationControls()
  const [isSpinningMobile, setIsSpinningMobile] = useState(false)

  // Desktop: control AQUI spin before redirect
  const desktopAquiControls = useAnimationControls()
  const [isSpinningDesktop, setIsSpinningDesktop] = useState(false)

  // No precargar imágenes - se cargarán bajo demanda cuando se abra cada proyecto

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
                className="h-[90dvh] max-h-screen w-auto"
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
                className="h-[90dvh] max-h-screen w-auto"
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
          className="select-none max-w-none h-[18dvh] xl:h-[22dvh] 2xl:h-[24dvh] w-auto cursor-pointer"
        />
        <motion.div
          className="relative cursor-pointer"
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
            animate={desktopAquiControls}
            whileHover={{ rotate: 360 }}
            onClick={async () => {
              if (isSpinningDesktop) return
              setIsSpinningDesktop(true)
              try {
                // Rotate to 720 to ensure an extra 360 turn if already at 360 from hover
                await desktopAquiControls.start({ rotate: 720, transition: { duration: 0.6, ease: "easeInOut" } })
              } finally {
                desktopAquiControls.set({ rotate: 0 })
                setIsSpinningDesktop(false)
                onEnterDesktop()
              }
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ transformOrigin: '50% 50%' }}
            className="select-none max-w-none h-[18dvh] xl:h-[22dvh] 2xl:h-[24dvh] w-auto mt-11 -ml-6"
          />
        </motion.div>
        <div className="relative select-none">
          <img
            src="/inicio/CARITA.svg"
            alt="Caritas"
            draggable={false}
            className="select-none max-w-none h-[12dvh] xl:h-[16dvh] 2xl:h-[18dvh] w-auto"
          />
        </div>
      </div>

      {/* Mobile: full viewport composition - scaled proportionally to prevent bottom cutoff */}
      <div className="md:hidden absolute inset-0 z-10 overflow-visible">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/inicio celu/CELULAR INICIO.svg"
            alt="KIKUCREAM mobile composition"
            className="mobile-composition block w-full h-[122dvh] max-[376px]:h-[122dvh] max-[480px]:h-[122dvh] max-[380px]:h-[122dvh] max-[340px]:h-[116.5dvh] object-contain pointer-events-none select-none origin-center"
            draggable={false}
            aria-hidden="true"
          />
        </div>
        {/* AQUI button wrapper centers translation separate from rotation to avoid jump */}
        <div className="absolute left-1/2 top-[70%] max-[420px]:top-[71%] max-[380px]:top-[73%] max-[340px]:top-[75%] -translate-x-1/2 ">
          <motion.img
            src="/inicio/AQUI.svg"
            alt="Aquí"
            animate={mobileAquiControls}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onClick={async () => {
              if (isSpinningMobile) return
              setIsSpinningMobile(true)
              try {
                // Rotate to 720 to ensure an extra 360 turn if already at 360 from hover
                await mobileAquiControls.start({ rotate: 720, transition: { duration: 0.6, ease: "easeInOut" } })
              } finally {
                mobileAquiControls.set({ rotate: 0 })
                setIsSpinningMobile(false)
                onEnterDesktop()
              }
            }}
            style={{ transformOrigin: '50% 50%' }}
            aria-busy={isSpinningMobile}
            className="w-[76vw] max-w-[410px] h-auto transform max-[420px]:w-[80vw] max-[380px]:w-[86vw] max-[340px]:w-[90vw] cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
