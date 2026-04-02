"use client";

import { ReactNode, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

type Star = {
    left: string;
    top: string;
    size: number;
    opacity: number;
};

type AuthSplitLayoutProps = {
    children: ReactNode;
    switchTo: string;
    switchLabel: string;
    switchText: string;
};

const generateStars = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
        left: `${(index * 41) % 100}%`,
        top: `${(index * 67) % 100}%`,
        size: index % 3 === 0 ? 1 : 2,
        opacity: 0.2 + ((index * 11) % 8) / 10,
    } satisfies Star));

const AuthSplitLayout = ({ children, switchTo, switchLabel, switchText }: AuthSplitLayoutProps) => {
    const stars = useMemo(() => generateStars(40), []);

    useEffect(() => {
        document.documentElement.classList.add("dark");
        return () => document.documentElement.classList.remove("dark");
    }, []);

    return (
        <div className="min-h-screen overflow-x-clip bg-background px-4 py-4 text-foreground lg:px-6 lg:py-6">
            <main className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="gradient-card relative hidden overflow-hidden rounded-[2rem] border border-border/10 p-8 inset-glow lg:flex lg:flex-col lg:justify-between">
                    {stars.map((star, i) => (
                        <span
                            key={`auth-star-${i}`}
                            className="star-dot"
                            style={{ left: star.left, top: star.top, width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity * 0.7 }}
                        />
                    ))}

                    <div className="relative z-10 max-w-xl pt-4">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-border/20 bg-card/70 px-3 py-2 text-xs text-foreground/80 backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5" />
                            New Update · Introducing v3
                            <span className="underline underline-offset-2">Try Now</span>
                        </div>
                        <h1 className="mt-8 text-balance text-3xl font-medium leading-[1.1] xl:text-4xl">
                            Keep attribution, monitoring, and reporting in one operator workspace
                        </h1>
                        <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/65">
                            Sign in to Adscrush and get back to click tracking, conversion visibility, payout monitoring, and day-to-day performance operations.
                        </p>
                    </div>

                    <div className="relative z-10 -mx-8 -mb-8 rounded-t-3xl border border-border/10 bg-card/35 p-6 pb-10 inset-glow backdrop-blur">
                        <div className="mb-4 flex items-center justify-between border-b border-border/10 pb-3">
                            <p className="text-xs text-foreground/60">Dashboard · Assets Overview</p>
                            <span className="rounded-md border border-border/10 bg-foreground/10 px-2 py-1 text-[10px] text-foreground/70">Live</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-border/10 bg-card/60 p-3">
                                <p className="text-[11px] text-foreground/55">Stripe</p>
                                <p className="mt-1 text-xl font-semibold">$9,352,102</p>
                                <p className="mt-1 text-[11px] text-foreground/60">+20% this month</p>
                            </div>
                            <div className="rounded-xl border border-border/10 bg-card/60 p-3">
                                <p className="text-[11px] text-foreground/55">PayPal</p>
                                <p className="mt-1 text-xl font-semibold">$4,118,062</p>
                                <p className="mt-1 text-[11px] text-foreground/60">-4% this week</p>
                            </div>
                            <div className="rounded-xl border border-border/10 bg-card/60 p-3">
                                <p className="text-[11px] text-foreground/55">Alerts</p>
                                <p className="mt-1 text-xl font-semibold">18 pending</p>
                                <p className="mt-1 text-[11px] text-foreground/60">3 need review</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative flex rounded-[2rem] border border-border/10 bg-background p-5 inset-glow sm:p-7 lg:p-10">
                    <div className="absolute left-1/2 top-6 -translate-x-1/2">
                        <img src="/logo.png" alt="Adscrush" className="h-10 w-auto object-contain" />
                    </div>

                    <div className="absolute right-5 top-7 text-xs text-foreground/65 sm:right-7 sm:top-7">
                        {switchText}{" "}
                        <Link href={switchTo} className="text-foreground underline underline-offset-4">
                            {switchLabel}
                        </Link>
                    </div>

                    <div className="mx-auto flex w-full max-w-[520px] flex-col justify-center pb-20 pt-20 sm:pt-24">
                        {children}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 border-t border-border/10 px-6 py-6">
                        <div className="flex items-center justify-center gap-8 text-sm text-foreground/60">
                            <Link href="#contact" className="transition-colors hover:text-foreground">Contact us</Link>
                            <Link href="/#pricing" className="transition-colors hover:text-foreground">Pricing</Link>
                            <Link href="/#faq" className="transition-colors hover:text-foreground">FAQ</Link>
                            <Link href="/#platform" className="transition-colors hover:text-foreground">Platform</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AuthSplitLayout;
