Index.tsx
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. 
All colors MUST be HSL.
*/

@layer base {
  :root {
    --background: 220 40% 1.4%;
    --foreground: 210 40% 98%;

    --card: 224 26% 8%;
    --card-foreground: 210 40% 98%;

    --popover: 224 26% 8%;
    --popover-foreground: 210 40% 98%;

    --primary: 217 91% 57%;
    --primary-foreground: 0 0% 100%;

    --secondary: 224 18% 12%;
    --secondary-foreground: 210 40% 96%;

    --muted: 224 18% 12%;
    --muted-foreground: 220 12% 66%;

    --accent: 224 18% 12%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 0 0% 100%;
    --input: 224 16% 14%;
    --ring: 217 91% 57%;

    --card-fill: 224 26% 8%;
    --glow: 241 42% 62%;
    --radius-xl: 1rem;
    --radius-hero: 2.1875rem;

    --radius: 0.5rem;

    --sidebar-background: 0 0% 98%;

    --sidebar-foreground: 240 5.3% 26.1%;

    --sidebar-primary: 240 5.9% 10%;

    --sidebar-primary-foreground: 0 0% 98%;

    --sidebar-accent: 240 4.8% 95.9%;

    --sidebar-accent-foreground: 240 5.9% 10%;

    --sidebar-border: 220 13% 91%;

    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 220 40% 1.4%;
    --foreground: 210 40% 98%;

    --card: 224 26% 8%;
    --card-foreground: 210 40% 98%;

    --popover: 224 26% 8%;
    --popover-foreground: 210 40% 98%;

    --primary: 217 91% 57%;
    --primary-foreground: 0 0% 100%;

    --secondary: 224 18% 12%;
    --secondary-foreground: 210 40% 98%;

    --muted: 224 18% 12%;
    --muted-foreground: 220 12% 66%;

    --accent: 224 18% 12%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 0 0% 100%;
    --input: 224 16% 14%;
    --ring: 217 91% 57%;
    --card-fill: 224 26% 8%;
    --glow: 241 42% 62%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    font-family: 'Inter', sans-serif;
    @apply bg-background text-foreground antialiased;
  }
}

@layer utilities {
  .gradient-card {
    background: radial-gradient(ellipse 154% 126% at 50% 3%, #0026e200 34%, #0026e299 64%, #fff);
  }

  .card-fill {
    background: hsl(var(--card-fill) / 0.65);
    backdrop-filter: blur(8px);
  }

  .inset-glow {
    box-shadow: inset 0 1px 0 hsl(0 0% 100% / 0.08), inset 0 0 40px hsl(var(--glow) / 0.08), 0 20px 45px hsl(220 40% 1% / 0.45);
  }

  .soft-border {
    border-color: hsl(var(--border) / 0.1);
  }

  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 650ms ease, transform 650ms ease;
    will-change: transform, opacity;
  }

  .reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .star-dot {
    position: absolute;
    border-radius: 9999px;
    background: hsl(var(--foreground));
    pointer-events: none;
  }
}

```

Home.tsx 
```tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CandlestickChart,
  Check,
  CircleDollarSign,
  Cpu,
  Facebook,
  Gem,
  Globe,
  Instagram,
  Layers,
  LayoutDashboard,
  LineChart,
  Linkedin,
  Menu,
  Newspaper,
  PieChart,
  Search,
  Sparkles,
  Twitter,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import bento1 from "@/assets/bento-1.png";
import bento2 from "@/assets/bento-2.png";
import bento3 from "@/assets/bento-3.png";
import bento4 from "@/assets/bento-4.png";
import bento5 from "@/assets/bento-5.png";
import pricingDiamond from "@/assets/pricing-diamond.png";
import rootFixedOverlay from "@/assets/root-fixed-overlay.png";

type Star = {
  left: string;
  top: string;
  size: number;
  opacity: number;
};

const navLinks = ["Home", "Pricing", "FAQ", "About", "Contact"];

const stats = [
  { name: "Stripe", label: "Revenue", value: "$9,352,102", change: "+20% ($187,042)", up: true },
  { name: "PayPal", label: "Revenue", value: "$4,118,062", change: "-4% ($164,722)", up: false },
  { name: "Shopify", label: "Revenue", value: "$11,312,102", change: "+10% ($1,131,210)", up: true },
  { name: "Gumroad", label: "Revenue", value: "$2,245,369", change: "-0.2% ($4,490)", up: false },
];

const tableRows = [
  { id: 1, product: "Enterprise Plan", category: "Subscription", price: "$299", change: "+12.5%", up: true },
  { id: 2, product: "API Access", category: "Developer", price: "$149", change: "+8.2%", up: true },
  { id: 3, product: "Data Export", category: "Analytics", price: "$49", change: "-2.1%", up: false },
  { id: 4, product: "Custom Reports", category: "Insights", price: "$79", change: "+15.3%", up: true },
  { id: 5, product: "Team Seats", category: "Collaboration", price: "$25", change: "+5.7%", up: true },
  { id: 6, product: "Storage Plus", category: "Cloud", price: "$19", change: "-0.8%", up: false },
];

const testimonials = [
  { handle: "@cryptomanu", text: "This changed the way I trade...", seed: "cryptomanu" },
  { handle: "@blockdanny", text: "The predictive alerts saved me...", seed: "blockdanny" },
  { handle: "@eth_eli", text: "Signed up for price tracking. Stayed for alerts.", seed: "etheli" },
  { handle: "@ethkaren", text: "Love the cross-platform access...", seed: "ethkaren" },
  { handle: "@devtraderjoe", text: "I integrated the API...", seed: "devtraderjoe" },
  { handle: "@noirnode", text: "The dark UI, performance, and real-time feed? Chef's kiss.", seed: "noirnode" },
  { handle: "@btcbrenda", text: "LI has completely streamlined...", seed: "btcbrenda" },
  { handle: "@altcoinrookie", text: "Data is beautifully visualized...", seed: "altcoinrookie" },
  { handle: "@uxonchain", text: "First crypto tool that feels like designers and traders made it.", seed: "uxonchain" },
  { handle: "@codetheblock", text: "Perfect for builders...", seed: "codetheblock" },
  { handle: "@fifi.rfqh", text: "Before LI, I had 4 tabs open...", seed: "fifirfqh" },
  { handle: "@signalhunter", text: "Being able to monitor over 200 coins in one place is a lifesaver.", seed: "signalhunter" },
  { handle: "@codecrusher", text: "As a crypto dev, this is gold...", seed: "codecrusher" },
  { handle: "@defidiego", text: "Used to rely on 3 apps. Now I just use LI.", seed: "defidiego" },
  { handle: "@lunalurker", text: "I'm not a pro trader, but LI makes me feel like one...", seed: "lunalurker" },
];

const leftFaq = [
  {
    q: "What is this service and who is it intended for?",
    a: "This platform is a professional-grade analytics dashboard designed for active traders, analysts, and portfolio managers who need unified market intelligence and faster decisions.",
  },
  { q: "How does the analytics feature function?", a: "LI combines exchange feeds, portfolio activity, and predictive models into one real-time analytics workspace." },
  { q: "How does the service gather real-time market data?", a: "Data streams are aggregated from major exchanges and normalized continuously to deliver low-latency signals." },
  { q: "Is my data and API access protected?", a: "All API credentials are encrypted in transit and at rest, with strict access controls and audit trails." },
];

const rightFaq = [
  { q: "Is there mobile or cross-device access available?", a: "Yes, LI is optimized for desktop, tablet, and mobile with synced real-time dashboards." },
  { q: "What happens if I change my subscription plan?", a: "Plan upgrades are immediate and downgrades apply at the next billing cycle." },
  { q: "Does the service support automated notifications?", a: "Yes, configure rule-based alerts for price moves, volume spikes, and custom triggers." },
  { q: "How do I get support if I run into an issue?", a: "You can reach support through in-app chat and email, with priority response on higher tiers." },
  { q: "Can I try the service before subscribing to a paid plan?", a: "Yes, start with the Starter plan and upgrade whenever you need advanced features." },
];

const starterPlanIcon =
  "data:image/png;base64,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";

const professionalPlanIcon =
  "data:image/png;base64,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";

const enterprisePlanIcon =
  "data:image/png;base64,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";

const pricing = [
  {
    title: "Starter Plan",
    icon: starterPlanIcon,
    price: "$0",
    subtitle: "Per month / free access",
    highlight: false,
    features: [
      "Real-time data (5 exchanges)",
      "Portfolio overview",
      "Custom watchlists",
      "Price alerts",
      "Secure API connection",
      "Dark mode interface",
      "Email notifications",
      "Responsive dashboard",
    ],
  },
  {
    title: "Professional Plan",
    icon: professionalPlanIcon,
    price: "$129",
    subtitle: "Per month / billed monthly",
    highlight: true,
    features: [
      "Everything in Starter",
      "AI-powered analytics",
      "Smart alert system",
      "Historical performance data",
      "Multi-exchange sync",
      "Mobile & web access",
      "Exportable reports",
      "Priority updates",
    ],
  },
  {
    title: "Enterprise Plan",
    icon: enterprisePlanIcon,
    price: "$199",
    subtitle: "Per month / billed monthly",
    highlight: false,
    features: [
      "Everything in Professional",
      "Unlimited exchange connections",
      "Team accounts & permissions",
      "Advanced API automation",
      "Dedicated account manager",
      "Custom data integrations",
      "24/7 priority support",
      "SLA-backed uptime",
    ],
  },
];

const bentoCards = [
  { title: "Real-time crypto price tracking", image: bento2 },
  { title: "Cross-platform compatibility", image: bento3 },
  { title: "Predictive price alerts", image: bento4 },
  { title: "Multi-chain token support", image: bento5 },
];

const generateStars = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    left: `${(index * 37) % 100}%`,
    top: `${(index * 59) % 100}%`,
    size: index % 3 === 0 ? 1 : 2,
    opacity: 0.2 + ((index * 13) % 8) / 10,
  } satisfies Star));

const sectionClass = "reveal";

const Index = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const heroStars = useMemo(() => generateStars(60), []);
  const pricingStars = useMemo(() => generateStars(36), []);
  const ctaStars = useMemo(() => generateStars(24), []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("reveal-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-x-clip bg-background text-foreground">
      <img
        src={rootFixedOverlay}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[60] w-[400px] opacity-80 md:w-[600px] lg:w-[800px]"
      />
      <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${scrolled ? "soft-border bg-background/80 backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
        <div className="mx-auto flex h-[92px] w-full max-w-[1440px] items-center justify-between px-6 lg:px-24">
          <div className="flex h-10 w-16 items-center justify-start">
            <div className="relative h-6 w-10">
              <span className="absolute inset-y-0 left-0 w-4 -skew-x-12 rounded-sm border border-border/50 bg-foreground/10" />
              <span className="absolute inset-y-0 left-3 w-4 -skew-x-12 rounded-sm border border-border/50 bg-foreground/25" />
            </div>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link, index) => (
              <div key={link} className="flex items-center gap-6">
                {link === "Contact" ? (
                  <Link to="/contact" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                    {link}
                  </Link>
                ) : link === "About" ? (
                  <Link to="/about" className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                    {link}
                  </Link>
                ) : (
                  <a href={`#${link.toLowerCase()}`} className="text-sm text-foreground/70 transition-colors hover:text-foreground">
                    {link}
                  </a>
                )}
                {index < navLinks.length - 1 ? <span className="h-5 w-[0.5px] bg-border/25" /> : null}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild className="hidden h-9 rounded-md bg-foreground px-5 text-background hover:bg-foreground/90 lg:inline-flex">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-md border border-border/20 lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {mobileOpen ? (
          <div className="border-t border-border/10 bg-card/95 px-6 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) =>
                link === "Contact" ? (
                  <Link key={link} to="/contact" className="text-sm text-foreground/80">
                    {link}
                  </Link>
                ) : link === "About" ? (
                  <Link key={link} to="/about" className="text-sm text-foreground/80">
                    {link}
                  </Link>
                ) : (
                  <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-foreground/80">
                    {link}
                  </a>
                ),
              )}
              <Button asChild className="mt-2 h-10 rounded-md bg-foreground text-background hover:bg-foreground/90">
                <Link to="/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="pb-16 pt-28">
        <section id="home" className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
          <div className="gradient-card relative overflow-hidden rounded-b-[35px] px-5 pb-6 pt-14 sm:px-8 lg:px-16 lg:pt-20">
            {heroStars.map((star, i) => (
              <span
                key={`hero-star-${i}`}
                className="star-dot"
                style={{ left: star.left, top: star.top, width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity }}
              />
            ))}

            <div data-reveal className={`${sectionClass} relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center`}>
              <div className="mb-8 flex items-center gap-3 rounded-[10px] border border-neutral-800 bg-foreground/5 px-2 py-2">
                <div className="flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-1.5 text-xs text-foreground/90">
                  <Sparkles className="h-3.5 w-3.5" />
                  New Update
                </div>
                <p className="text-xs text-foreground/75">
                  Introducing v3 — <a className="text-primary underline underline-offset-2">Try Now</a>
                </p>
              </div>

              <h1 className="text-balance text-4xl font-medium capitalize leading-tight md:text-6xl">
                Platform For Advanced Analytics To Grow Your Business
              </h1>
              <p className="mt-5 max-w-[541px] text-sm text-foreground/70 md:text-base">
                Lorem ipsum dolor sit amet consectetur adipiscing elit. In non purus elementum nunc, quis commodo.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="h-11 rounded-md bg-foreground px-8 text-background hover:bg-foreground/90">
                  <Link to="/sign-up">Start for free</Link>
                </Button>
                <Button className="h-11 rounded-md border border-border/10 bg-foreground/10 px-8 text-foreground hover:bg-foreground/20">Live Demo</Button>
              </div>
            </div>

            <div data-reveal className={`${sectionClass} relative z-10 mt-10 [perspective:1200px] lg:mt-14`}>
              <div className="mx-auto max-w-6xl origin-top [transform:rotateX(20deg)_scale(0.85)_skewX(-3deg)] rounded-t-2xl border border-border/10 bg-background inset-glow">
                <div className="flex min-h-[520px] gap-4 p-4">
                  <aside className="hidden w-48 rounded-xl border border-border/10 bg-card/55 p-3 lg:flex lg:flex-col">
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/10 bg-background/80 px-2 py-1.5 text-xs text-foreground/60">
                      <Search className="h-3.5 w-3.5" />
                      Search
                    </div>
                    <div className="space-y-1">
                      <p className="mb-2 text-[10px] uppercase tracking-wide text-foreground/45">General</p>
                      {[
                        [LayoutDashboard, "Dashboard"],
                        [Briefcase, "Portfolio"],
                        [CandlestickChart, "Market"],
                        [LineChart, "Watchlist"],
                        [Globe, "Exchange"],
                        [CircleDollarSign, "Transactions"],
                        [Wallet, "Wallets"],
                        [PieChart, "Analytics"],
                        [Newspaper, "News"],
                      ].map(([Icon, label], index) => (
                        <div
                          key={label as string}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${index === 0 ? "bg-primary/15 text-foreground" : "text-foreground/65"}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {label as string}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="mb-2 text-[10px] uppercase tracking-wide text-foreground/45">Top Features</p>
                      {[
                        "Smart Contract",
                        "Revenue Streams",
                        "Data Layers",
                        "Integrations",
                        "Scaling Solutions",
                        "Subscriptions",
                        "AI Features",
                        "Performance",
                      ].map((item) => (
                        <div key={item} className="rounded-md px-2 py-1 text-[11px] text-foreground/60">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto rounded-lg border border-border/20 bg-[radial-gradient(100%_100%_at_80%_0%,hsl(var(--glow)/0.45)_0%,transparent_70%),hsl(var(--primary)/0.18)] p-3">
                      <p className="text-xs font-medium">Ready to scale?</p>
                      <Button className="mt-2 h-8 w-full rounded-md bg-foreground text-xs text-background hover:bg-foreground/90">Upgrade Now</Button>
                    </div>
                  </aside>

                  <div className="flex-1 rounded-xl border border-border/[0.06] bg-card/50 p-4 inset-glow">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/10 pb-3">
                      <p className="text-xs text-foreground/65">Dashboard &gt; Assets Overview</p>
                      <div className="flex items-center gap-2">
                        <Button className="h-8 rounded-md border border-border/10 bg-foreground/10 px-3 text-xs text-foreground">Invite</Button>
                        <Button className="h-8 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90">Connect Wallet</Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium">Welcome Back, John!</h3>
                      <p className="mt-1 text-xs text-foreground/60">Your market summary and portfolio trends are refreshed.</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                      {stats.map((card, idx) => (
                        <article key={card.name} className="rounded-xl border border-border/[0.06] bg-card/40 p-3 inset-glow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-foreground/75">
                              {idx % 4 === 0 ? <Layers className="h-3.5 w-3.5" /> : idx % 4 === 1 ? <CircleDollarSign className="h-3.5 w-3.5" /> : idx % 4 === 2 ? <Gem className="h-3.5 w-3.5" /> : <Cpu className="h-3.5 w-3.5" />}
                              {card.name}
                            </div>
                            <button className="text-foreground/40">•••</button>
                          </div>
                          <p className="mt-2 text-[11px] text-foreground/50">{card.label}</p>
                          <p className="mt-1 text-sm font-semibold">{card.value}</p>
                          <p className={`mt-1 text-[11px] ${card.up ? "text-emerald-400" : "text-red-400"}`}>{card.change}</p>
                        </article>
                      ))}
                    </div>

                    <div className="mt-4 hidden rounded-xl border border-border/10 bg-background/35 p-3 xl:block">
                      <div className="mb-3 flex items-center gap-2 text-[11px]">
                        {[
                          ["Trending", true],
                          ["Gainers", false],
                          ["Decliner", false],
                          ["New-Launch", false],
                        ].map(([tab, active]) => (
                          <span
                            key={tab as string}
                            className={`rounded-md border px-2.5 py-1 ${active ? "border-border/30 bg-foreground/10 text-foreground" : "border-transparent text-foreground/60"}`}
                          >
                            {tab as string}
                          </span>
                        ))}
                      </div>
                      <div className="overflow-hidden rounded-lg border border-border/10">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-background/80 text-foreground/50">
                            <tr>
                              <th className="px-3 py-2">#</th>
                              <th className="px-3 py-2">Product</th>
                              <th className="px-3 py-2">Category</th>
                              <th className="px-3 py-2">Price</th>
                              <th className="px-3 py-2">Change</th>
                              <th className="px-3 py-2">Trend</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableRows.map((row) => (
                              <tr key={row.id} className="border-t border-border/10 text-foreground/80">
                                <td className="px-3 py-2">{row.id}</td>
                                <td className="px-3 py-2">{row.product}</td>
                                <td className="px-3 py-2">{row.category}</td>
                                <td className="px-3 py-2">{row.price}</td>
                                <td className={`px-3 py-2 ${row.up ? "text-emerald-400" : "text-red-400"}`}>{row.change}</td>
                                <td className="px-3 py-2">
                                  <svg viewBox="0 0 90 24" className="h-5 w-20">
                                    <polyline
                                      fill="none"
                                      stroke={row.up ? "hsl(142 70% 45%)" : "hsl(0 84% 65%)"}
                                      strokeWidth="2"
                                      points={row.up ? "2,20 16,18 28,14 40,16 52,10 64,12 88,4" : "2,6 16,8 28,11 40,10 52,16 64,15 88,20"}
                                    />
                                  </svg>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-auto h-20 max-w-6xl bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>
        </section>

        <section className="px-6 py-24" id="about">
          <div className="mx-auto max-w-[1100px] text-center">
            <h2 data-reveal className={`${sectionClass} text-4xl font-medium md:text-5xl`}>
              Simple, yet powerful features
            </h2>
            <p data-reveal className={`${sectionClass} mx-auto mt-4 max-w-xl text-foreground/60`}>
              It combines rich analytics, clean execution layers, and real-time collaboration in one secure dashboard.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-3">
            <article data-reveal className={`${sectionClass} gradient-card relative row-span-2 overflow-hidden rounded-2xl border border-border/10 p-6 pb-0 pr-0 inset-glow`}>
              <h3 className="max-w-xs text-xl font-medium">Unified asset overview</h3>
              <p className="mt-2 max-w-xs text-sm text-foreground/60">Monitor all tokens, balances, and exchange performance in one streamlined panel.</p>
              <div className="relative mt-8 h-60 w-full overflow-hidden rounded-tl-2xl border border-border/10 bg-background/40">
                <img src={bento1} alt="Unified asset overview dashboard" loading="lazy" className="absolute bottom-0 right-0 h-full w-auto max-w-none object-contain" />
              </div>
            </article>

            {bentoCards.map((card) => (
              <article key={card.title} data-reveal className={`${sectionClass} card-fill rounded-2xl border border-border/10 p-5 inset-glow`}>
                <img src={card.image} alt={card.title} loading="lazy" className="h-20 w-full rounded-xl border border-border/10 object-cover" />
                <h3 className="mt-4 text-base font-medium">{card.title}</h3>
                <p className="mt-2 text-sm text-foreground/60">Receive actionable context with precision visuals and resilient data syncing.</p>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="relative overflow-hidden px-6 py-24">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
          <div className="mx-auto max-w-6xl">
            <h2 data-reveal className={`${sectionClass} text-center text-4xl font-medium md:text-5xl`}>
              Trusted by many users
            </h2>
            <div className="relative mt-12 rounded-3xl bg-[radial-gradient(ellipse_80%_70%_at_center,transparent_30%,hsl(var(--background))_100%)]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {testimonials.map((item, idx) => (
                  <article
                    key={item.handle}
                    data-reveal
                    className={`${sectionClass} rounded-2xl border border-border/10 bg-muted/10 p-4`}
                    style={{ transitionDelay: `${(idx % 5) * 80}ms` }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <img
                        loading="lazy"
                        className="h-8 w-8 rounded-full border border-border/15"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seed}`}
                        alt={item.handle}
                      />
                      <p className="text-xs text-foreground/70">{item.handle}</p>
                    </div>
                    <p className="text-sm text-foreground/75">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="relative overflow-hidden px-6 py-24">
          {pricingStars.map((star, i) => (
            <span
              key={`pricing-star-${i}`}
              className="star-dot"
              style={{ left: star.left, top: star.top, width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity * 0.7 }}
            />
          ))}

          <div className="relative z-10 mx-auto max-w-6xl">
            <h2 data-reveal className={`${sectionClass} text-center text-4xl font-medium md:text-5xl`}>
              Power Your Trading Strategy <br /> with the Right Plan
            </h2>
            <p data-reveal className={`${sectionClass} mx-auto mt-4 max-w-xl text-center text-foreground/60`}>
              Structured for traders who need real-time monitoring, actionable insights, and scalable analytics.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pricing.map((plan, idx) => (
                <article
                  key={plan.title}
                  data-reveal
                  className={`${sectionClass} ${plan.highlight ? "gradient-card" : "card-fill"} rounded-2xl border border-border/10 p-6 inset-glow`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  {plan.icon ? (
                    <img src={plan.icon} alt="Starter plan icon" className="h-9 w-9 object-contain" loading="lazy" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/10 bg-foreground/10">
                      <img src={pricingDiamond} alt="Diamond icon" className="h-5 w-5 object-contain" loading="lazy" />
                    </div>
                  )}
                  <h3 className="mt-4 text-lg font-medium">{plan.title}</h3>
                  <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
                  <p className="mt-1 text-sm text-foreground/60">{plan.subtitle}</p>

                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/75">
                        <Check className="mt-0.5 h-4 w-4 text-foreground/60" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`mt-6 h-11 w-full rounded-md ${plan.highlight ? "bg-foreground text-background hover:bg-foreground/90" : "border border-border/10 bg-foreground/10 text-foreground hover:bg-foreground/20"}`}
                  >
                    <Link to="/sign-up">Get Started</Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 data-reveal className={`${sectionClass} text-center text-4xl font-medium md:text-5xl`}>
              Everything You Need to Know About <br /> Tools, Pricing, and Security
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Accordion type="single" defaultValue="left-0" collapsible className="space-y-4">
                {leftFaq.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`left-${idx}`}
                    data-reveal
                    className={`${sectionClass} card-fill overflow-hidden rounded-xl border border-border/10 px-4`}
                  >
                    <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-foreground/60">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Accordion type="single" collapsible className="space-y-4">
                {rightFaq.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`right-${idx}`}
                    data-reveal
                    className={`${sectionClass} card-fill overflow-hidden rounded-xl border border-border/10 px-4`}
                  >
                    <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-foreground/60">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="gradient-card relative overflow-hidden rounded-[35px]">
              {ctaStars.map((star, i) => (
                <span
                  key={`cta-star-${i}`}
                  className="star-dot"
                  style={{ left: star.left, top: star.top, width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity * 0.7 }}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_100%,hsl(var(--glow)/0.6)_0%,transparent_70%)]" />

              <div className="relative z-10 flex flex-col items-center px-6 py-20 text-center">
                <div data-reveal className={`${sectionClass} flex h-16 w-16 items-center justify-center rounded-2xl border border-border/10 bg-foreground/10`}>
                  <div className="relative h-7 w-10">
                    <span className="absolute inset-y-0 left-0 w-4 -skew-x-12 rounded-sm border border-border/50 bg-foreground/10" />
                    <span className="absolute inset-y-0 left-3 w-4 -skew-x-12 rounded-sm border border-border/50 bg-foreground/30" />
                  </div>
                </div>
                <h2 data-reveal className={`${sectionClass} mt-6 text-4xl font-medium md:text-5xl`}>
                  Ready to Start?
                </h2>
                <p data-reveal className={`${sectionClass} mt-4 max-w-xl text-foreground/60`}>
                  Join thousands of traders already powered by LI and unlock deeper analytics with faster execution.
                </p>
                <Button asChild data-reveal className={`${sectionClass} mt-8 h-11 rounded-md bg-foreground px-8 text-background hover:bg-foreground/90`}>
                  <Link to="/sign-up">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="mx-auto max-w-6xl border-t border-border/10 px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div className="flex h-10 w-16 items-center justify-start">
            <div className="relative h-6 w-10">
              <span className="absolute inset-y-0 left-0 w-4 -skew-x-12 rounded-sm border border-border/50 bg-foreground/10" />
              <span className="absolute inset-y-0 left-3 w-4 -skew-x-12 rounded-sm border border-border/50 bg-foreground/25" />
            </div>
          </div>

          <nav className="flex flex-wrap gap-4 text-sm text-foreground/70">
            {navLinks.map((link) =>
              link === "Contact" ? (
                <Link key={link} to="/contact" className="hover:text-foreground">
                  {link}
                </Link>
              ) : link === "About" ? (
                <Link key={link} to="/about" className="hover:text-foreground">
                  {link}
                </Link>
              ) : (
                <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-foreground">
                  {link}
                </a>
              ),
            )}
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <p className="text-sm text-foreground/60">
            ©2025. Designed by{" "}
            <a href="https://akashlayal.dev/" target="_blank" rel="noreferrer" className="underline">
              Sherlock
            </a>{" "}
            · Powered by Adscrush
          </p>
          <div className="flex items-center gap-2">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
              <button key={idx} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 text-foreground/70 hover:text-foreground">
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
```