import type React from "react"
import DesktopIcon from "./desktop-icon"

interface DesktopProps {
  icons: { id: string; name: string; icon: string }[]
}

const Desktop: React.FC<DesktopProps> = ({ icons }) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900 overflow-hidden">
      {icons.map((icon) => (
        <DesktopIcon key={icon.id} id={icon.id} name={icon.name} icon={icon.icon} />
      ))}
    </div>
  )
}

export default Desktop
