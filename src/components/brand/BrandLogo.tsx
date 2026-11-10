import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "light" | "dark";
  showSubtitle?: boolean;
  subtitleText?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export function BrandLogo({
  variant = "light",
  showSubtitle = true,
  subtitleText = "Sistem Keputusan Kapasitas UMKM",
  size = "md",
  href = "/",
  className = "",
}: BrandLogoProps) {
  const isDark = variant === "dark";

  const sizeConfig = {
    sm: {
      box: "w-8 h-8 rounded-lg",
      icon: "text-[18px]",
      title: "text-[16px]",
      sub: "text-[9px]",
    },
    md: {
      box: "w-10 h-10 rounded-xl",
      icon: "text-[22px]",
      title: "text-[19px]",
      sub: "text-[11px]",
    },
    lg: {
      box: "w-12 h-12 rounded-2xl",
      icon: "text-[26px]",
      title: "text-[22px]",
      sub: "text-[12px]",
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Real Custom Logo from User */}
      <div
        className={`${sizeConfig.box} relative overflow-hidden flex items-center justify-center rounded-xl bg-white shadow-md shadow-blue-600/15 group-hover:scale-105 transition-transform flex-shrink-0 p-0.5 border border-blue-100/60`}
      >
        <Image
          src="/logo.png"
          alt="BizCapacity Logo"
          width={48}
          height={48}
          className="w-full h-full object-contain rounded-lg"
          priority
        />
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight leading-none ${sizeConfig.title} text-slate-900 dark:text-white`}
          >
            BizCapacity
          </span>
          {/* Live pulsing status beacon */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-500" />
          </span>
          <span
            className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-400/30 shrink-0"
          >
            UMKM
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`font-medium tracking-wide leading-tight mt-1 truncate ${sizeConfig.sub} text-slate-500 dark:text-slate-400`}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
