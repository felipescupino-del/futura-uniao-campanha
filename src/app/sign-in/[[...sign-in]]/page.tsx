import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left — Branding panel */}
      <div className="relative flex flex-[3] items-center justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.45_0.12_160)] via-[oklch(0.38_0.10_155)] to-[oklch(0.30_0.08_165)] px-8 py-12 lg:py-0">
        {/* Animated gradient overlay */}
        <div className="animate-gradient-shift absolute inset-0 bg-gradient-to-tr from-[oklch(0.40_0.14_150/0.4)] via-transparent to-[oklch(0.35_0.10_170/0.3)]" />

        {/* Floating decorative circles */}
        <div className="animate-float-slow absolute top-[15%] left-[10%] h-32 w-32 rounded-full bg-white/5" />
        <div className="animate-float-medium absolute top-[60%] right-[15%] h-24 w-24 rounded-full bg-white/5" />
        <div className="animate-float-fast absolute bottom-[20%] left-[25%] h-16 w-16 rounded-full bg-white/8" />
        <div className="animate-float-medium absolute top-[30%] right-[30%] h-20 w-20 rounded-full bg-white/4" />
        <div className="animate-float-slow absolute bottom-[35%] right-[8%] h-12 w-12 rounded-full bg-white/6" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="animate-scale-in">
            <Image
              src="/logo.png"
              alt="Grupo Futura União"
              width={120}
              height={120}
              className="drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="animate-slide-up mt-8 text-3xl font-bold text-white lg:text-4xl">
            Grupo Futura União
          </h1>
          <p className="animate-slide-up-delayed mt-3 max-w-md text-lg text-white/80">
            Plataforma de Campanhas de Reativação
          </p>
          <div className="animate-slide-up-delayed-2 mt-6 h-px w-24 bg-white/30" />
          <p className="animate-slide-up-delayed-2 mt-4 text-sm text-white/60">
            Gestão inteligente de corretores e campanhas
          </p>
        </div>
      </div>

      {/* Right — Clerk Sign-In form */}
      <div className="flex flex-[2] items-center justify-center bg-background p-8">
        <div className="animate-fade-in w-full max-w-md">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none w-full',
                headerTitle: 'text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'border-border text-foreground',
                formFieldLabel: 'text-foreground',
                formFieldInput: 'border-border bg-background text-foreground',
                footerActionLink: 'text-primary hover:text-primary/80',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
