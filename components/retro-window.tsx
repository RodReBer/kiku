"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RetroWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number; centered?: boolean };
  size: { width: number; height: number };
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onResize: (size: { width: number; height: number }) => void;
  onFocus: () => void;
  preserveAspect?: boolean;
  aspectRatio?: number;
  backgroundTransparent?: boolean;
}

export default function RetroWindow({
  id,
  title,
  children,
  isMinimized,
  isMaximized,
  position,
  size,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  onFocus,
  preserveAspect,
  aspectRatio,
  backgroundTransparent,
}: RetroWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest("button")) {
      return;
    }

    onFocus();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest("button")) {
      return;
    }

    onFocus();
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    const touch = e.touches[0];
    setResizeStart({
      x: touch.clientX,
      y: touch.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        e.preventDefault();
        // Usar tamaño real del DOM para bounds precisos
        const el = windowRef.current;
        if (!el) return;

        // Permitir arrastrar hasta los bordes, teniendo en cuenta el borde del contenedor (7px por lado)
        const containerBorder = 19; // 7px * 2
        const maxX = window.innerWidth - el.offsetWidth - containerBorder;
        const maxY = window.innerHeight - el.offsetHeight - containerBorder;

        const newX = Math.max(0, Math.min(maxX, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(maxY, e.clientY - dragStart.y));
        onMove({ x: newX, y: newY });
      }

      if (isResizing && !isMaximized) {
        e.preventDefault();

        // Límites máximos para que no se pueda estirar más allá de la pantalla
        const containerBorder = 20 // margen de seguridad
        const el = windowRef.current
        const currentX = el ? el.offsetLeft : position.x
        const currentY = el ? el.offsetTop : position.y
        const maxWidth = window.innerWidth - currentX - containerBorder
        const maxHeight = window.innerHeight - currentY - containerBorder

        if (preserveAspect && aspectRatio) {
          const deltaX = e.clientX - resizeStart.x;
          const deltaY = e.clientY - resizeStart.y;

          const tentativeWidth = Math.max(300, resizeStart.width + deltaX);
          const tentativeHeight = Math.max(200, resizeStart.height + deltaY);

          const widthChange = Math.abs(tentativeWidth - resizeStart.width);
          const heightChange = Math.abs(tentativeHeight - resizeStart.height);

          let finalWidth, finalHeight;

          // Chrome dimensions: 4px horizontal borders (2+2), 32px vertical (28 header + 4 borders)
          const CHROME_WIDTH = 4;
          const CHROME_HEIGHT = 32;

          if (widthChange > heightChange) {
            // Priority to width change
            finalWidth = tentativeWidth;
            const contentWidth = finalWidth - CHROME_WIDTH;
            const contentHeight = contentWidth / aspectRatio;
            finalHeight = contentHeight + CHROME_HEIGHT;
          } else {
            // Priority to height change
            finalHeight = tentativeHeight;
            const contentHeight = finalHeight - CHROME_HEIGHT;
            const contentWidth = contentHeight * aspectRatio;
            finalWidth = contentWidth + CHROME_WIDTH;
          }

          // Ensure minimums are respected
          if (finalWidth < 300 || finalHeight < 200) {
            // If one dimension is too small, clamp it and recalculate the other
            if (finalWidth < 300) {
              finalWidth = 300;
              const contentWidth = finalWidth - CHROME_WIDTH;
              const contentHeight = contentWidth / aspectRatio;
              finalHeight = contentHeight + CHROME_HEIGHT;
            } else {
              finalHeight = 200;
              const contentHeight = finalHeight - CHROME_HEIGHT;
              const contentWidth = contentHeight * aspectRatio;
              finalWidth = contentWidth + CHROME_WIDTH;
            }
          }

          // Apply max screen limits while preserving aspect ratio
          finalWidth = Math.max(300, Math.min(finalWidth, maxWidth))
          finalHeight = Math.max(200, Math.min(finalHeight, maxHeight))

          // Re-apply aspect ratio with limits
          if (finalWidth / aspectRatio > maxHeight) {
            finalHeight = maxHeight
            finalWidth = finalHeight * aspectRatio
          }
          if (finalHeight * aspectRatio > maxWidth) {
            finalWidth = maxWidth
            finalHeight = finalWidth / aspectRatio
          }

          onResize({ width: Math.round(finalWidth), height: Math.round(finalHeight) })
        } else {
          const newWidth = Math.max(300, Math.min(resizeStart.width + (e.clientX - resizeStart.x), maxWidth))
          const newHeight = Math.max(200, Math.min(resizeStart.height + (e.clientY - resizeStart.y), maxHeight))
          onResize({ width: newWidth, height: newHeight })
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (isDragging && !isMaximized) {
        e.preventDefault();
        // Usar tamaño real del DOM para bounds precisos
        const el = windowRef.current;
        if (!el) return;

        // Permitir arrastrar hasta los bordes, teniendo en cuenta el borde del contenedor (7px por lado)
        const containerBorder = 19; // 7px * 2
        const maxX = window.innerWidth - el.offsetWidth - containerBorder;
        const maxY = window.innerHeight - el.offsetHeight - containerBorder;

        const newX = Math.max(0, Math.min(maxX, touch.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(maxY, touch.clientY - dragStart.y));
        onMove({ x: newX, y: newY });
      }

      if (isResizing && !isMaximized) {
        e.preventDefault();

        // Límites máximos para que no se pueda estirar más allá de la pantalla
        const containerBorder = 20 // margen de seguridad
        const el = windowRef.current
        const currentX = el ? el.offsetLeft : position.x
        const currentY = el ? el.offsetTop : position.y
        const maxWidth = window.innerWidth - currentX - containerBorder
        const maxHeight = window.innerHeight - currentY - containerBorder

        if (preserveAspect && aspectRatio) {
          const deltaX = touch.clientX - resizeStart.x;
          const deltaY = touch.clientY - resizeStart.y;

          const tentativeWidth = Math.max(300, resizeStart.width + deltaX);
          const tentativeHeight = Math.max(200, resizeStart.height + deltaY);

          const widthChange = Math.abs(tentativeWidth - resizeStart.width);
          const heightChange = Math.abs(tentativeHeight - resizeStart.height);

          let finalWidth, finalHeight;

          // Chrome dimensions: 4px horizontal borders (2+2), 32px vertical (28 header + 4 borders)
          const CHROME_WIDTH = 4;
          const CHROME_HEIGHT = 32;

          if (widthChange > heightChange) {
            finalWidth = tentativeWidth;
            const contentWidth = finalWidth - CHROME_WIDTH;
            const contentHeight = contentWidth / aspectRatio;
            finalHeight = contentHeight + CHROME_HEIGHT;
          } else {
            finalHeight = tentativeHeight;
            const contentHeight = finalHeight - CHROME_HEIGHT;
            const contentWidth = contentHeight * aspectRatio;
            finalWidth = contentWidth + CHROME_WIDTH;
          }

          // Ensure minimums are respected
          if (finalWidth < 300 || finalHeight < 200) {
            if (finalWidth < 300) {
              finalWidth = 300;
              const contentWidth = finalWidth - CHROME_WIDTH;
              const contentHeight = contentWidth / aspectRatio;
              finalHeight = contentHeight + CHROME_HEIGHT;
            } else {
              finalHeight = 200;
              const contentHeight = finalHeight - CHROME_HEIGHT;
              const contentWidth = contentHeight * aspectRatio;
              finalWidth = contentWidth + CHROME_WIDTH;
            }
          }

          // Apply max screen limits while preserving aspect ratio
          finalWidth = Math.max(300, Math.min(finalWidth, maxWidth))
          finalHeight = Math.max(200, Math.min(finalHeight, maxHeight))

          // Re-apply aspect ratio with limits
          if (finalWidth / aspectRatio > maxHeight) {
            finalHeight = maxHeight
            finalWidth = finalHeight * aspectRatio
          }
          if (finalHeight * aspectRatio > maxWidth) {
            finalWidth = maxWidth
            finalHeight = finalWidth / aspectRatio
          }

          onResize({ width: Math.round(finalWidth), height: Math.round(finalHeight) })
        } else {
          const newWidth = Math.max(300, Math.min(resizeStart.width + (touch.clientX - resizeStart.x), maxWidth))
          const newHeight = Math.max(200, Math.min(resizeStart.height + (touch.clientY - resizeStart.y), maxHeight))
          onResize({ width: newWidth, height: newHeight })
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.body.style.userSelect = "";
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    position,
    size,
    isMaximized,
    onMove,
    onResize,
    preserveAspect,
    aspectRatio,
  ]);

  // Estilo para ventana (maximizada usa viewport completo salvo que preserveAspect ajuste posición desde el padre)
  const windowStyle = isMaximized
    ? preserveAspect
      ? { x: position.x, y: position.y, width: size.width, height: size.height }
      : { x: 0, y: 0, width: "100%", height: "100%" } // Usa 100% del contenedor padre
    : { x: position.x, y: position.y, width: size.width, height: size.height };

  if (isMinimized) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        className="absolute bg-gray-200 shadow-md flex flex-col"
        style={{
          left: windowStyle.x,
          top: windowStyle.y,
          width: windowStyle.width,
          height: windowStyle.height,
          zIndex,
          borderStyle: "solid",
          borderWidth: "2px",
          borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
          boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
          backgroundColor: backgroundTransparent ? "transparent" : "#C0C0C0",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
        onMouseDown={() => onFocus()}
      >
        <div
          className="window-header h-7 border-b border-gray-500 flex items-center justify-between px-2 cursor-move"
          style={{
            borderStyle: "solid",
            background: "#C0C0C0",
            borderColor: "#D9D9D9 #434343 #434343 #D9D9D9",
            touchAction: "none",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <span className="text-black font-bold text-xs truncate flex-1 ml-2">
            {title}
          </span>
          <div className="flex space-x-1">
            <button
              className="w-5 h-5 bg-gray-300 border border-gray-500 hover:bg-gray-400 transition-colors flex items-center justify-center"
              style={{
                borderStyle: "outset",
                borderWidth: "1px",
                borderColor: "#D9D9D9 #434343 #434343 #D9D9D9",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
            >
              <div className="w-2 h-0.5 bg-black"></div>
            </button>

            <button
              className="w-5 h-5 bg-gray-300 border border-gray-500 hover:bg-gray-400 transition-colors flex items-center justify-center"
              style={{
                borderStyle: "outset",
                borderWidth: "1px",
                borderColor: "#D9D9D9 #434343 #434343 #D9D9D9",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMaximize();
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0"
                    y="0"
                    width="8"
                    height="8"
                    stroke="black"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
              </div>
            </button>

            <button
              className="w-5 h-5 bg-gray-300 border border-gray-500 hover:bg-gray-400 transition-colors flex items-center justify-center"
              style={{
                borderStyle: "outset",
                borderWidth: "1px",
                borderColor: "#D9D9D9 #434343 #434343 #D9D9D9",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">×</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden w-full">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { isMaximized } as any);
            }
            return child;
          })}
        </div>

        {!isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 border-l border-t border-gray-400"
            style={{ borderStyle: "inset" }}
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
          >
            <div className="w-full h-full flex items-end justify-end p-0.5">
              <div className="w-2 h-2 bg-gray-500"></div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
