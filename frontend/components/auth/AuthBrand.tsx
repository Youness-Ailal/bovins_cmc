import Image from "next/image";

/**
 * Auth left panel — split into proper layers so every asset is reusable:
 *   /public/auth-bg.png      — cattle barn photo (background)
 *   /public/logo-white.png   — BOVITRACK logo for dark surfaces (navbar, splash, etc.)
 *   /public/logo-green.png   — BOVITRACK logo for light surfaces (future use)
 *
 * Overlay: rgba(27,46,31,0.72) matches #1B2E1F darkening from Main-Design.pen.
 * Logo: 150×148px, tagline #C8D9CC Inter 16px — from Pencil node XPYXW.
 * Panel width: 540px (fixed), hidden below lg breakpoint.
 */
export default function AuthBrand() {
  return (
    <div className="relative hidden lg:block shrink-0 w-[540px]">
      {/* Layer 1: cattle barn photo */}
      <Image
        src="/auth-bg.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />

      {/* Layer 2: dark green overlay — #1B2E1F @ 72% */}
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: "rgba(27, 46, 31, 0.85)" }}
      />

      {/* Layer 3: brand content — centered */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-12 text-center">
        <Image
          src="/logo-white.png"
          alt="BOVITRACK"
          width={150}
          height={148}
          priority
        />
        <p
          className="font-inter text-base leading-relaxed"
          style={{ color: "#C8D9CC", maxWidth: "400px" }}
        >
          Gestion intelligente de votre troupeau bovin
        </p>
      </div>
    </div>
  );
}
