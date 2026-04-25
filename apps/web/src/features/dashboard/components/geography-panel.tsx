"use client"

import { useState, useMemo } from "react"
import type { GeographyItem } from "../types"
import { Button } from "@adscrush/ui/components/button"
import { Badge } from "@adscrush/ui/components/badge"
import DottedMap from "dotted-map"
import { COUNTRIES } from "../countries"


interface GeographyPanelProps {
  geography: GeographyItem[]
  totalConversions: number
}

interface HoveredCountryInfo {
  name: string
  flag: string
  total: number
  clicks: number
  conversions: number
  x: number
  y: number
}

export function GeographyPanel({ geography, totalConversions }: GeographyPanelProps) {
  const [hoveredCountry, setHoveredCountry] = useState<HoveredCountryInfo | null>(null)

  // Map country codes to geographical data
  const mappedGeography = useMemo(() => {
    return geography
      .map((item) => {
        const countryData = COUNTRIES[item.countryCode.toUpperCase()]
        if (!countryData) return null
        return {
          ...item,
          name: countryData.name,
          flag: countryData.flag,
          lat: countryData.lat,
          lng: countryData.lng,
        }
      })
      .filter((item): item is GeographyItem & { name: string; flag: string } => item !== null)
  }, [geography])

  // Generate map points using dotted-map
  const mapSVG = useMemo(() => {
    const map = new DottedMap({ height: 30, grid: "diagonal" })
    return map.getPoints()
  }, [])

  // Coordinates mapping from lat/lng to the dotted map projection (63x30)
  const getCoordinates = (lat: number, lng: number) => {
    // Basic Equirectangular projection mapping to 63x30
    const x = ((lng + 180) * 63) / 360
    const y = ((90 - lat) * 30) / 180
    return { x, y }
  }

  // Summary breakdown of clicks vs conversions
  const totalClicks = mappedGeography.reduce((sum, item) => sum + item.clicks, 0)
  const totalConvs = mappedGeography.reduce((sum, item) => sum + item.conversions, 0)
  const totalActionCount = totalClicks + totalConvs

  const breakdown = [
    {
      label: "Click",
      value: totalActionCount > 0 ? (totalClicks / totalActionCount) * 100 : 0,
      color: "var(--primary)",
    },
    {
      label: "Conversion",
      value: totalActionCount > 0 ? (totalConvs / totalActionCount) * 100 : 0,
      color: "color-mix(in oklch, var(--primary) 55%, var(--background))",
    },
  ]

  return (
    <div className="relative flex h-full flex-col gap-4 bg-background p-4 sm:gap-5 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Geography</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums">
              {hoveredCountry ? hoveredCountry.total.toLocaleString() : totalConversions.toLocaleString()}
            </span>
            {hoveredCountry && (
              <Badge
                variant="outline"
                className="h-6 gap-1.5 rounded-none border-muted/50 bg-muted/5 px-2 font-normal text-muted-foreground"
              >
                <span className="text-xs">{hoveredCountry.flag}</span>
                <span className="text-xs">{hoveredCountry.name}</span>
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 rounded-none px-2 text-xs">
          Details
        </Button>
      </div>

      {/* Action Breakdown Progress Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex h-1.5 w-full overflow-hidden rounded-none bg-muted/30">
          {breakdown.map((item, i) => (
            <div
              key={i}
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${item.value}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium tracking-tight text-muted-foreground uppercase">
          {breakdown.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-none" style={{ backgroundColor: item.color }} />
              {item.label} {item.value.toFixed(1)}%
            </span>
          ))}
        </div>
      </div>

      {/* Dotted World Map */}
      <div className="group relative mt-2 h-[200px]">
        <svg viewBox="0 0 63 30" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
          <defs>
            <style>{`
              @keyframes mapMarkerPulse {
                0% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.5); opacity: 0.3; }
                100% { transform: scale(1); opacity: 0.8; }
              }
              .map-marker { cursor: pointer; }
              .marker-pulse { 
                animation: mapMarkerPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                transform-origin: center;
              }
            `}</style>
          </defs>

          {/* Background Dots */}
          {mapSVG.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={0.35}
              fill="currentColor"
              opacity="0.1"
              style={{ transition: "opacity 300ms ease-out" }}
            />
          ))}

          {/* Real Action Markers (Pins) */}
          {mappedGeography.map((item, i) => {
            const { x, y } = getCoordinates(item.lat, item.lng)
            const radius = Math.max(1, Math.min(3, Math.log10(item.clicks + 1) * 2))

            return (
              <g
                key={i}
                className="map-marker"
                onMouseEnter={() =>
                  setHoveredCountry({
                    name: item.name,
                    flag: item.flag,
                    total: item.clicks,
                    clicks: item.clicks,
                    conversions: item.conversions,
                    x,
                    y,
                  })
                }
                onMouseLeave={() => setHoveredCountry(null)}
              >
                {/* Pulse Effect */}
                <circle cx={x} cy={y} r={radius * 1.5} fill="var(--primary)" className="marker-pulse" />
                {/* Main Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="var(--primary)"
                  fillOpacity="0.8"
                  stroke="var(--background)"
                  strokeWidth="0.3"
                  className="transition-all duration-300 hover:fill-primary"
                />
              </g>
            )
          })}
        </svg>

        {/* Custom Tooltip */}
        {hoveredCountry && (
          <div
            className="pointer-events-none absolute z-50 min-w-[160px] border border-border bg-background p-3 shadow-xl"
            style={{
              left: `${(hoveredCountry.x / 63) * 100}%`,
              top: `${(hoveredCountry.y / 30) * 100}%`,
              transform: "translate(-50%, -110%)",
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{hoveredCountry.flag}</span>
                <span className="text-sm font-bold tracking-tight uppercase">{hoveredCountry.name}</span>
              </div>
              <div className="flex flex-col">
                <div className="font-mono text-2xl leading-none font-bold">{hoveredCountry.total.toLocaleString()}</div>
                <span className="mt-1 text-[10px] font-bold text-muted-foreground uppercase">Total Clicks</span>
              </div>

              <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-none bg-muted/30">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${(hoveredCountry.clicks / (hoveredCountry.clicks + hoveredCountry.conversions || 1)) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-primary opacity-50"
                  style={{
                    width: `${(hoveredCountry.conversions / (hoveredCountry.clicks + hoveredCountry.conversions || 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {hoveredCountry.clicks} Clicks
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-primary opacity-50" />
                  {hoveredCountry.conversions} Conv
                </span>
              </div>
            </div>

            {/* Tooltip Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-border bg-background" />
          </div>
        )}
      </div>
    </div>
  )
}
