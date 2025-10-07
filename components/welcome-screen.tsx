"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface WelcomeScreenProps {
  onEnterDesktop: () => void
}

export default function WelcomeScreen({ onEnterDesktop }: WelcomeScreenProps) {
  const [clickTurns, setClickTurns] = useState(0)
  return (
    <div className="w-full h-[100dvh] relative overflow-hidden bg-white flex items-center justify-center">
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

  {/* Mobile: layout simple sin JS dinámico */}
      <div className="md:hidden absolute inset-0 z-10">
        <div className="relative w-full h-full">
          {/* KIKU */}
          <div className="absolute top-[11%] left-3 flex items-end gap-[8px]">
            {['/inicio celu/K.svg','/inicio celu/I.svg','/inicio celu/KK.svg','/inicio celu/U.svg'].map((src,idx)=> (
              <div key={src+idx} className="h-[28vh] max-h-[250px] border border-red-500">
                <img
                  src={src}
                  alt=""
                  className="h-full w-auto "
                  draggable={false}
                />
              </div>
            ))}
          </div>
          {/* CLICK (solo decorativo en mobile) */}
          <img
            src="/inicio/CLICK.svg"
            alt="Click"
            className="absolute top-[9%] left-[27%] h-[9.5vh] max-h-[90px] w-auto pointer-events-none"
            draggable={false}
          />
          {/* CREAM + AQUI centrado */}
          <div className="absolute top-[43%] right-3 flex flex-col items-center gap-0">
            <div className="flex items-end gap-[8px]">
              {['/inicio celu/C.svg','/inicio celu/R.svg','/inicio celu/E.svg','/inicio celu/A.svg','/inicio celu/M.svg'].map((src,idx)=>(
                <div key={src+idx} className="h-[28vh] max-h-[250px] flex items-end">
                  <img
                    src={src}
                    alt=""
                    className="h-full w-auto block object-contain"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            <motion.img
              src="/inicio/AQUI.svg"
              alt="Aquí"
              whileTap={{ scale: 0.95 }}
              onClick={onEnterDesktop}
              className=" -mt-[2vh] h-[11vh] max-h-[95px] w-auto cursor-pointer"
            />
          </div>
          {/* Caritas */}
          <div className="absolute right-8 bottom-[5%] flex gap-4">
            {[1,2,3].map(i => (
              <img key={i} src="/inicio/CARITA.svg" alt="Carita" className="h-[8vh] max-h-[70px] w-auto" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
