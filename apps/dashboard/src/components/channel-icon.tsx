import { Mail, MessageSquare, Phone, Bell, MessageCircle } from "lucide-react"
import type { Channel } from "../data/types"

const channelConfig: Record<Channel, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  sms: { icon: MessageSquare, label: "SMS" },
  email: { icon: Mail, label: "Email" },
  push: { icon: Bell, label: "Push" },
  call: { icon: Phone, label: "Call" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
}

interface ChannelIconProps {
  channel: Channel
  showLabel?: boolean
  className?: string
}

export function ChannelIcon({ channel, showLabel = false, className }: ChannelIconProps) {
  const config = channelConfig[channel]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-sm">{config.label}</span>}
    </span>
  )
}
