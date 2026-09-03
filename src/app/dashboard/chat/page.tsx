import type { Metadata } from "next";
import { ChatClient } from "./ChatClient";

export const metadata: Metadata = {
  title: "AI resume chat",
  description:
    "Chat with Hunter, your AI résumé and salary coach. Ask what to fix first, how to negotiate, whether you're underpaid or which certification pays — every answer is grounded in your real analysis.",
};

export default function ChatPage() {
  return <ChatClient />;
}
