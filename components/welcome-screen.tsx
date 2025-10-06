"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  const [clickTurns, setClickTurns] = useState(0)

  // Ajuste de altura real del viewport en mobile para evitar scroll por barras de navegador
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--app-vh', `${vh}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    window.addEventListener('orientationchange', setVh)
    return () => {
      window.removeEventListener('resize', setVh)
      window.removeEventListener('orientationchange', setVh)
    }
  }, [])

  // Escalado controlado del canvas móvil para evitar overflow / scroll y cortar elementos
  useEffect(() => {
    const BASE_W = 430
    const BASE_H = 820
    const recomputeScale = () => {
      const vw = window.innerWidth
      const rawVh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      let scale = Math.min(vw / BASE_W, rawVh / BASE_H)
      scale = scale * 0.995
      if (scale > 1) scale = 1
      // Limitar el mínimo a 0.9 para que las letras no se achiquen demasiado
      if (scale < 0.9) scale = 0.9
      document.documentElement.style.setProperty('--mobile-scale', scale.toString())
      // Si la escala es menor a 1, reducir top/bottom de los bloques para evitar corte
      const kikuTop = scale < 1 ? 140 : 150
      const creamTop = scale < 1 ? 350 : 365
      const caritasBottom = scale < 1 ? 40 : 60
      document.documentElement.style.setProperty('--kiku-top', `${kikuTop}px`)
      document.documentElement.style.setProperty('--cream-top', `${creamTop}px`)
      document.documentElement.style.setProperty('--caritas-bottom', `${caritasBottom}px`)
    }
    recomputeScale()
    window.addEventListener('resize', recomputeScale)
    window.addEventListener('orientationchange', recomputeScale)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', recomputeScale)
    }
    return () => {
      window.removeEventListener('resize', recomputeScale)
      window.removeEventListener('orientationchange', recomputeScale)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', recomputeScale)
      }
    }
  }, [])
  return (
    <div
      className="w-full relative overflow-hidden bg-white flex items-center justify-center"
      style={{ height: 'calc(var(--app-vh, 1vh) * 100)' }}
    >
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
  <div className="absolute top-[10%] left-0 ml-6 md:ml-80 z-[2000] hidden md:flex flex-row items-center justify-start pointer-events-auto">
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

  {/* Mobile: layout escalado proporcional fijo (re-ajuste: KIKU arriba izq, CREAM abajo der, CLICK sobre KIKU) */}
      <div className="md:hidden absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
        <div
          className="relative origin-center pointer-events-none select-none"
          style={{
            width: 430,
            height: 820,
            transform: 'scale(var(--mobile-scale,1))'
          }}
        >
          {/* KIKU alineado a la izquierda con padding mínimo */}
          <div className="absolute left-[17px] flex flex-row items-end gap-[10px]" style={{ top: 'var(--kiku-top, 150px)' }}>
            <img src="/inicio celu/K.svg" alt="K" className="h-[220px] w-auto" />
            <img src="/inicio celu/I.svg" alt="I" className="h-[220px] w-auto -ml-[17px]" />
            <img src="/inicio celu/KK.svg" alt="K" className="h-[220px] w-auto" />
            <img src="/inicio celu/U.svg" alt="U" className="h-[220px] w-auto" />
          </div>
          {/* CLICK sobre KIKU (ligeramente centrado relativo a la palabra) */}
          <img
            src="/inicio/CLICK.svg"
            alt="Click"
            className="absolute top-[150px] left-[110px] h-[65px] w-auto pointer-events-none"
            draggable={false}
          />
          {/* CREAM alineado a la derecha con padding mínimo */}
          <div className="absolute right-[17px] flex flex-col items-end" style={{ top: 'var(--cream-top, 365px)' }}>
            <div className="flex flex-row items-end gap-[12px]">
              {["/inicio celu/C.svg", "/inicio celu/R.svg", "/inicio celu/E.svg", "/inicio celu/A.svg", "/inicio celu/M.svg"].map((src, idx) => (
                <img key={src + idx} src={src} alt="" className="h-[220px] w-auto" draggable={false} />
              ))}
            </div>
            {/* AQUI centrado respecto al ancho del bloque CREAM */}
            <motion.img
              src="/inicio/AQUI.svg"
              alt="Aquí"
              draggable={false}
              onClick={onEnterDesktop}
              whileTap={{ scale: 0.95 }}
              className="block mx-auto mt-[-17px] h-[85px] w-auto cursor-pointer pointer-events-auto"
            />
          </div>
          {/* Caritas */}
          <div className="absolute right-[40px] flex flex-row gap-[14px]" style={{ bottom: 'var(--caritas-bottom, 60px)' }}>
            {[1,2,3].map(i => (
              <img key={i} src="/inicio/CARITA.svg" alt="Carita" className="h-[64px] w-auto" draggable={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
