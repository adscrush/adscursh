import { Geist, Geist_Mono, Figtree } from "next/font/google"

import "@adscrush/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@adscrush/ui/components/tooltip"
import { cn } from "@adscrush/ui/lib/utils";
import { Toaster } from "@adscrush/ui/components/sonner";
import { RevealEffect } from "@/components/common/reveal-effect";

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", figtree.variable, geistHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <RevealEffect />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
