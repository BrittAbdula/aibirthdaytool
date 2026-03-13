import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { DiscoveryLink } from "@/lib/discovery-links";

interface DiscoveryPanelProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  links: DiscoveryLink[];
}

export default function DiscoveryPanel({
  title,
  description,
  icon,
  links,
}: DiscoveryPanelProps) {
  return (
    <GlassCard className="h-full border-white/60 bg-white/75 p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-orange-50 p-3 text-primary ring-1 ring-orange-100">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start justify-between gap-4 rounded-2xl border border-orange-100/80 bg-white/80 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-orange-50/80"
          >
            <div>
              <div className="font-semibold text-gray-800 transition-colors group-hover:text-primary">
                {link.label}
              </div>
              <div className="mt-1 text-sm leading-6 text-gray-600">
                {link.description}
              </div>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
