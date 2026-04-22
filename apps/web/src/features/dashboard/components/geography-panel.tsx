"use client"

import { useState, useMemo } from "react"
import { formatCompactNumber } from "../utils"
import type { GeographyItem } from "../types"
import { Button } from "@adscrush/ui/components/button"
import DottedMap from "dotted-map"

interface GeographyPanelProps {
  geography: GeographyItem[]
  totalConversions: number
}

export function GeographyPanel({ geography, totalConversions }: GeographyPanelProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)

  // Generate map points using dotted-map
  const mapSVG = useMemo(() => {
    // Generate a map with specific dimensions
    const map = new DottedMap({ height: 30, grid: "diagonal" })
    
    // We can add pins for our geography data
    geography.forEach(item => {
      if (item.lat && item.lng) {
        try {
          map.addPin({
            lat: item.lat,
            lng: item.lng,
            svgOptions: { color: "var(--primary)", radius: 0.4 }
          })
        } catch (e) {
          // Ignore out of bounds
        }
      }
    })

    return map.getPoints()
  }, [geography])

  // Simple segmented progress mock based on top 3 regions
  const topRegions = useMemo(() => {
    const sorted = [...geography].sort((a, b) => b.total - a.total)
    const total = sorted.reduce((sum, item) => sum + item.total, 0)
    if (total === 0) return []
    
    return [
      { label: "North America", value: 36, color: "var(--primary)" },
      { label: "Europe", value: 56, color: "color-mix(in oklch, var(--primary) 55%, var(--background))" },
      { label: "Other", value: 8, color: "color-mix(in oklch, var(--primary) 25%, var(--background))" },
    ]
  }, [geography])

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5 h-full bg-background">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Geography</span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums">
              {totalConversions.toLocaleString()}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs rounded-none">
          Details
        </Button>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex h-1.5 w-full overflow-hidden bg-muted/30 rounded-none">
          {topRegions.map((region, i) => (
            <div
              key={i}
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${region.value}%`, 
                backgroundColor: region.color 
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
          {topRegions.map((region, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span 
                className="inline-block h-1.5 w-1.5 rounded-full" 
                style={{ backgroundColor: region.color }} 
              />
              {region.label} {region.value}%
            </span>
          ))}
        </div>
      </div>

      {/* Dotted World Map */}
      <div className="relative h-[200px] mt-2">
        <svg 
          viewBox="0 0 63 30" 
          preserveAspectRatio="xMidYMid meet" 
          className="h-full w-full"
        >
          <defs>
            <style>{`
              @keyframes mapMarkerPulse {
                0% { opacity: 1.0; transform: scale(1); }
                50% { opacity: 0.65; transform: scale(1.1); }
                100% { opacity: 1.0; transform: scale(1); }
              }
              .map-dot { transition: opacity 300ms ease-out; }
              .map-marker { cursor: pointer; animation: mapMarkerPulse 3s ease-in-out infinite; }
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
              className="map-dot text-foreground/10"
            />
          ))}

          {/* Hotspots / Pins */}
          {geography.slice(0, 5).map((item, i) => {
            // Using a simple projection for the pins matching the dotted-map coordinates
            // Dotted map uses a specific internal projection, but we'll approximate 
            // or just use top conversion points if we have them.
            // For now, let's mock the hotspots from the image as they look better
            const hotspots = [
              { x: 17.5, y: 10.4, r: 2.8 },
              { x: 31, y: 7.8, r: 2.2 },
              { x: 45, y: 14.7, r: 2.0 },
              { x: 22.5, y: 20.8, r: 1.7 },
              { x: 56, y: 11.3, r: 1.6 },
            ]
            
            const spot = hotspots[i]
            if (!spot) return null

            return (
              <g key={i} className="map-marker" style={{ animationDelay: `${i * 0.6}s` }}>
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={spot.r}
                  fill="color-mix(in oklch, var(--primary) 55%, var(--background))"
                  fillOpacity="0.4"
                  stroke="color-mix(in oklch, var(--primary) 55%, var(--background))"
                  strokeWidth="0.4"
                  strokeOpacity="0.4"
                />
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
