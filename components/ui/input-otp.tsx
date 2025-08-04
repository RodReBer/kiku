"use client"

import { OTPInput, Slot, OTPInputContext } from "input-otp"
import { Minus, Star } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, has } = inputOTPContext.slots[index]

  return (
    <Slot
      ref={ref}
      index={index}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        has && "ring-1 ring-ring",
        className,
      )}
      {...props}
    >
      {char}
      {has && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-ping rounded-full bg-foreground opacity-10" />
        </div>
      )}
    </Slot>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPMask = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", className)}
      {...props}
    >
      <Star className="h-3 w-3 fill-foreground" />
    </div>
  ),
)
InputOTPMask.displayName = "InputOTPMask"

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
      <Minus />
    </div>
  ),
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPMask, InputOTPSeparator }
