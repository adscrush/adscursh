import { Geist, Geist_Mono, Figtree } from "next/font/google"

import "@adscrush/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@adscrush/ui/components/tooltip"
import { cn } from "@adscrush/ui/lib/utils"
import { Toaster } from "@adscrush/ui/components/sonner"
import { RevealEffect } from "@/components/common/reveal-effect"
import { Metadata, Viewport } from "next"
import NextTopLoader from "nextjs-toploader"

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" })

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
    other: {
      rel: "icon",
      url: "/logo.png",
    },
  },
  title: "AdsCrush - Conversion Tracking & Analytics",
  description:
    "Comprehensive analytics platform for managing leads, clients, products, and advertising campaigns across Google and Meta platforms.",
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        figtree.variable,
        geistHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <NextTopLoader color="#2299DD" showSpinner={false} />
          <TooltipProvider>
            {children}
            <RevealEffect />
          </TooltipProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
