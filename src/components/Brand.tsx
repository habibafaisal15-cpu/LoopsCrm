import { cn } from "@/lib/utils";

export function LoopsLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={cn("loops-logo", size, className)}>
      <img
        src="/loops-logo-light.png"
        alt="Loops"
        className="logo-light"
        width={164}
        height={80}
      />
      <img
        src="/loops-logo.png"
        alt=""
        className="logo-dark"
        width={164}
        height={80}
      />
    </span>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("brand-lockup", className)}>
      <LoopsLogo size="sm" />
      <span className="brand-crm">CRM</span>
    </span>
  );
}
