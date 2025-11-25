import { Card } from '@/components/ui/card'
import { ChatInterface } from '@/components/chat/ChatInterface'

export function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant to manage your CRM
        </p>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <ChatInterface />
      </Card>
    </div>
  )
}
