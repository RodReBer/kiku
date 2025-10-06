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

      {/* Mobile nuevo layout compuesto */}
      <div className="md:hidden absolute inset-0 z-10 pointer-events-none select-none">
        {/* KIKU + CLICK */}
        <div className="relative w-full">
          <div className="relative flex flex-row items-end gap-[1.2vw] mt-[24vw] ml-[2vw] mr-[10vw]">
            {/* CLICK sobre KIKU más abajo y a la derecha */}
            <img
              src="/inicio/CLICK.svg"
              alt="Click"
              draggable={false}
              className="absolute -top-[1vw] left-[26vw] h-[19vw] w-auto"
            />
            {/* KIKU con K e I sin separación */}
            <div className="flex flex-row items-end">
              <img src="/inicio celu/K.svg" alt="" draggable={false} className="h-[30vh] w-auto" />
              <img src="/inicio celu/I.svg" alt="" draggable={false} className="h-[30vh] w-auto -ml-[1.5vw]" />
            </div>
            {/* resto de K U con gap mínimo */}
            <img src="/inicio celu/KK.svg" alt="" draggable={false} className="h-[30vh] w-auto" />
            <img src="/inicio celu/U.svg" alt="" draggable={false} className="h-[30vh] w-auto" />
          </div>
          {/* CREAM desplazado hacia la derecha */}
          <div className="relative flex flex-row items-end gap-[1.2vw] justify-end w-full pr-[2vw]">
            {["/inicio celu/C.svg", "/inicio celu/R.svg", "/inicio celu/E.svg", "/inicio celu/A.svg", "/inicio celu/M.svg"].map((src, idx) => (
              <img
                key={src + idx}
                src={src}
                alt=""
                draggable={false}
                className="h-[30vh] w-auto"
              />
            ))}
          </div>
          {/* AQUI superpuesto debajo de CREAM */}
          <div className="relative w-full">
            <motion.img
              src="/inicio/AQUI.svg"
              alt="Aquí"
              draggable={false}
              onClick={onEnterDesktop}
              whileTap={{ scale: 0.95 }}
              className="h-[13vh] w-auto mt-[-5vw] mx-auto cursor-pointer pointer-events-auto"
            />
          </div>
          {/* CARITAS abajo a la derecha: tres caritas */}
          <div className="flex flex-row items-end gap-[2vw] w-full justify-end pr-[6vw] mt-[5vw]">
            {[1,2,3].map(i => (
              <img
                key={i}
                src="/inicio/CARITA.svg"
                alt="Caritas"
                draggable={false}
                className="h-[5vh] w-auto"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
