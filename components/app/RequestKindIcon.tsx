import {
  ClipboardList,
  MessageCircleQuestion,
  SearchCheck,
  Wrench,
} from "lucide-react";
import type { RequestKind } from "@/lib/requests-ui";

const ICONS = {
  tender: ClipboardList,
  audit: SearchCheck,
  repair: Wrench,
  other: MessageCircleQuestion,
} as const;

export function RequestKindIcon({
  kind,
  className = "size-6",
}: {
  kind: RequestKind;
  className?: string;
}) {
  const Icon = ICONS[kind];
  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
