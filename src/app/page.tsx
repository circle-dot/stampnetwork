import Link from "next/link";
import { siteName } from "../../config/siteConfig";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundSize: '40px 40px',
        backgroundImage: `
          linear-gradient(to right, hsla(180, 100%, 50%, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, hsla(180, 100%, 50%, 0.1) 1px, transparent 1px)
        `,
      }}></div>
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">Welcome to {siteName}</h1>
        <p className="text-xl text-foreground mb-8">Build Trust, Vouch for Others, Grow Communities</p>
        <Link href="/explorer" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors">
        Get Started
        </Link>
      </div>
    </div>
  );
}