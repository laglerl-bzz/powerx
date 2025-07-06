"use client"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Download, BarChart3 } from "lucide-react"
import { eslBigData } from "../data-esl-big"
import { sdatBig } from "../data-sdat-big"
import { sdatMonthlyData as sdatMonthlyDataFile } from "../data-sdat-monthly"
import { cn } from "@/lib/utils"

type ChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}

// Types for API responses
interface SDATResponse {
  "sdat-data": Array<{
    documentID: string;
    interval: {
      startDateTime: string;
      endDateTime: string;
    };
    resolution: number;
    data: Array<{
      sequence: number;
      volume: number;
    }>;
  }>;
}

interface ESLResponse {
  "esl-data": Array<{
    month: string;
    data: Array<{
      obis: string;
      value: number;
    }>;
  }>;
}

// Transform ESL data to chart format
const transformESLData = (data: ESLResponse["esl-data"]) => {
  return data.map((entry) => {
    // Convert ISO date to readable month
    const date = new Date(entry.month)
    const monthName = date.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric"
    })

    // Create flat object with OBIS values
    const flat: { [key: string]: any } = {
      month: entry.month, // Use parsable date for axis
      fullDate: monthName, // Use formatted name for tooltip
      date: entry.month // Keep original date for sorting
    }

    entry.data.forEach((item) => {
      flat[item.obis] = item.value
    })

    return flat
  })
}

// Transform SDAT data to chart format
const transformSDATData = (data: SDATResponse["sdat-data"]) => {
  // Group data by documentID to separate feed-in and feed-out
  const groupedData: { [key: string]: any[] } = {}

  data.forEach((entry) => {
    if (!groupedData[entry.documentID]) {
      groupedData[entry.documentID] = []
    }

    // Create time series data points for each sequence
    entry.data.forEach((point) => {
      const startDate = new Date(entry.interval.startDateTime)
      // Calculate time for this sequence (resolution is in minutes)
      const timeOffset = (point.sequence - 1) * entry.resolution * 60 * 1000 // Convert to milliseconds
      const pointTime = new Date(startDate.getTime() + timeOffset)

      const timeLabel = pointTime.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
      })

      groupedData[entry.documentID].push({
        time: timeLabel,
        sequence: point.sequence,
        volume: point.volume,
        timestamp: pointTime.getTime(),
        documentID: entry.documentID
      })
    })
  })

  // Combine data from both document IDs into a single time series
  const allTimePoints: { [key: string]: any } = {}

  Object.keys(groupedData).forEach(docId => {
    groupedData[docId].forEach(point => {
      const key = point.time
      if (!allTimePoints[key]) {
        allTimePoints[key] = {
          month: point.time,
          time: point.time,
          timestamp: point.timestamp
        }
      }
      if (docId.includes('ID735')) {
        allTimePoints[key]['bezug'] = point.volume
      } else if (docId.includes('ID742')) {
        allTimePoints[key]['einspeisung'] = point.volume
      }
    })
  })

  return Object.values(allTimePoints).sort((a: any, b: any) => a.timestamp - b.timestamp)
}

// Transform SDAT data for monthly view
const transformSDATMonthly = (data: SDATResponse["sdat-data"]) => {
  const dayMap: { [day: string]: { bezug: number; einspeisung: number; timestamp: number; readings: number } } = {};

  data.forEach((entry) => {
    const dateObj = new Date(entry.interval.startDateTime);
    const dayStr = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD

    if (!dayMap[dayStr]) {
      const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      dayMap[dayStr] = {
        bezug: 0,
        einspeisung: 0,
        timestamp: startOfDay.getTime(),
        readings: 0
      };
    }

    if (entry.data) {
      const dailySum = entry.data.reduce((sum: number, point) => sum + point.volume, 0);
      if (entry.documentID.includes("ID735")) {
        dayMap[dayStr].bezug += dailySum;
      } else if (entry.documentID.includes("ID742")) {
        dayMap[dayStr].einspeisung += dailySum;
      }
      dayMap[dayStr].readings += entry.data.length;
    }
  });

  return Object.entries(dayMap).map(([day, vals]) => {
    const [year, monthNum, dayNum] = day.split('-').map(num => parseInt(num, 10));
    const dateObj = new Date(year, monthNum - 1, dayNum);

    return {
      month: day, // YYYY-MM-DD for formatXAxisTick
      fullDate: dateObj.toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      time: dateObj.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
      timestamp: vals.timestamp,
      bezug: +vals.bezug.toFixed(2),
      einspeisung: +vals.einspeisung.toFixed(2),
      totalReadings: vals.readings
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}

// Get transformed data
const eslTransformedData = transformESLData(eslBigData["esl-data"])
const sdatTransformedData = transformSDATData(sdatBig["sdat-data"])
const sdatMonthlyData = transformSDATMonthly(sdatBig["sdat-data"])

// OBIS code mappings for ESL data
export const obisConfig = {
  "1-1:1.8.1": {
    label: "Bezug Hochtarif",
    color: "#93c5fd", // blue-300
  },
  "1-1:1.8.2": {
    label: "Bezug Niedertarif",
    color: "#2563eb", // blue-600
  },
  "1-1:2.8.1": {
    label: "Einspeisung Hochtarif",
    color: "#10b981", // green-500
  },
  "1-1:2.8.2": {
    label: "Einspeisung Niedertarif",
    color: "#14532d", // green-900
  },
} satisfies ChartConfig

// SDAT document ID mappings for SDAT data
export const sdatConfig = {
  "bezug": {
    label: "Bezug",
    color: "#2563eb",
  },
  "einspeisung": {
    label: "Einspeisung",
    color: "#10b981",
  },
} satisfies ChartConfig

// Map options to datafiels 
const presetKeyMap: { [key: string]: string[] } = {
  purchaseHighTariff: ["1-1:1.8.1"],
  purchaseLowTariff: ["1-1:1.8.2"],
  feedInHighTariff: ["1-1:2.8.1"],
  feedInLowTariff: ["1-1:2.8.2"],
  purchase: ["bezug"],
  feedIn: ["einspeisung"],
}

export function ChartComp({ preset = "", onTimespanChange, onConfigChange, className }: { preset?: string; onTimespanChange?: (timespan: string) => void, onConfigChange?: (config: ChartConfig) => void, className?: string }) {
  const [currentData, setCurrentData] = useState<any[]>([])
  const [currentConfig, setCurrentConfig] = useState<ChartConfig>(sdatConfig)
  const [selectedTimespan, setSelectedTimespan] = useState("month")
  const [key, setKey] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch data from the API
  const fetchData = async (timespan: string) => {
    setIsLoading(true)
    setError(null)
    try {
      if (timespan === "year") {
        const response = await fetch('/api/data-esl')
        if (!response.ok) throw new Error('Failed to fetch ESL data')
        const data: ESLResponse = await response.json()
        return transformESLData(data["esl-data"])
      } else {
        const response = await fetch('/api/data-sdat')
        if (!response.ok) throw new Error('Failed to fetch SDAT data')
        const data: SDATResponse = await response.json()
        if (timespan === "month" || timespan === "total") {
          return transformSDATMonthly(data["sdat-data"])
        } else {
          return transformSDATData(data["sdat-data"])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Function to determine which data to use based on timespan
  const getDataForTimespan = async (timespan: string) => {
    if (timespan === "day" || timespan === "month") {
      const sdatData = await fetchData(timespan);

      if (sdatData.length === 0) {
        return { data: [], config: sdatConfig as ChartConfig };
      }

      if (timespan === "day") {
        // Only process the last 5000 entries for performance
        const sortedData = sdatData.sort((a: any, b: any) => b.timestamp - a.timestamp);
        const recentData = sortedData.slice(0, 5000);

        // Find the latest timestamp in the recent data
        const latestTimestamp = Math.max(...recentData.map((d: any) => d.timestamp));
        const latestDate = new Date(latestTimestamp);

        const startOfLatestDay = new Date(
          latestDate.getFullYear(),
          latestDate.getMonth(),
          latestDate.getDate()
        );

        const filteredData = recentData.filter((d: any) => {
          const itemDate = new Date(d.timestamp);
          return itemDate.getTime() >= startOfLatestDay.getTime();
        });
        return { data: filteredData, config: sdatConfig as ChartConfig };
      }

      if (timespan === "month") {
        const latestTimestamp = Math.max(...sdatData.map((d: any) => d.timestamp));
        const thirtyDaysBefore = new Date(latestTimestamp);
        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
        thirtyDaysBefore.setHours(0, 0, 0, 0);

        const filteredData = sdatData.filter((d: any) => {
          return d.timestamp >= thirtyDaysBefore.getTime();
        });
        return { data: filteredData, config: sdatConfig as ChartConfig };
      }
    }

    if (timespan === "year") {
      const eslData = await fetchData("year");
      if (eslData.length === 0) {
        return { data: [], config: obisConfig as ChartConfig, error: null };
      }
      // Get all unique months, sorted ascending
      const uniqueMonths = Array.from(
        new Set(eslData.map((d: any) => d.month.slice(0, 7)))
      ).sort();
      if (uniqueMonths.length < 2) {
        // Not enough data for a year
        return { data: [], config: obisConfig as ChartConfig, error: "Es gibt zu wenig Daten, um einen vernünftigen Graphen darzustellen. Bitte fügen Sie mehr Daten hinzu." };
      }
      // Only consider the last 12 months
      const last12Months = uniqueMonths.slice(-12);
      // Check if these 12 months are consecutive
      let consecutive = true;
      for (let i = 1; i < last12Months.length; i++) {
        const [prevY, prevM] = last12Months[i - 1].split('-').map(Number);
        const [currY, currM] = last12Months[i].split('-').map(Number);
        const diff = (currY - prevY) * 12 + (currM - prevM);
        if (diff !== 1) {
          consecutive = false;
          break;
        }
      }
      if (!consecutive || last12Months.length < 12) {
        return { data: [], config: obisConfig as ChartConfig, error: "Es gibt zu wenig Daten, um einen vernünftigen Graphen darzustellen. Bitte fügen Sie mehr Daten hinzu." };
      }
      // Filter data to only those months
      const filteredData = eslData.filter((d: any) => last12Months.includes(d.month.slice(0, 7)));
      // Sort filtered data by month ascending
      filteredData.sort((a: any, b: any) => a.month.localeCompare(b.month));
      return { data: filteredData, config: obisConfig as ChartConfig, error: null };
    }

    if (timespan === "total") {
      const eslData = await fetchData("year");
      // Get all unique months in ESL data
      const uniqueMonths = Array.from(new Set(eslData.map((d: any) => d.month))).sort();
      if (uniqueMonths.length >= 3) {
        // Use ESL data if there are at least 3 months
        return { data: eslData, config: obisConfig as ChartConfig };
      }
      // Otherwise, use SDAT data
      const sdatData = await fetchData("total");
      return { data: sdatData, config: sdatConfig as ChartConfig };
    }

    return { data: [], config: obisConfig };
  }

  // For SDAT data (smaller values), use different scaling
  const isSDATData = currentConfig.hasOwnProperty('bezug');

  useEffect(() => {
    const loadData = async () => {
      const result = await getDataForTimespan(selectedTimespan)
      const { data, config, error: customError } = result
      let filteredData = data
      let filteredConfig = config
      if (preset && presetKeyMap[preset]) {
        let keys = presetKeyMap[preset]
        // For ESL charts, expand 'purchase' and 'feedIn' to both tariffs
        if (!isSDATData) {
          if (preset === 'purchase') {
            keys = ['1-1:1.8.1', '1-1:1.8.2']
          } else if (preset === 'feedIn') {
            keys = ['1-1:2.8.1', '1-1:2.8.2']
          }
        }
        // Konfiguration auf ausgewählte Datenreihen begrenzen
        filteredConfig = Object.fromEntries(
          Object.entries(config).filter(([key]) => keys.includes(key))
        ) as typeof sdatConfig | typeof obisConfig
        // Nur die relevanten Werte aus jedem Eintrag behalten
        filteredData = data.map(entry => {
          const newEntry: any = {}
          for (const key of ["month", "fullDate", "timestamp", "time", "totalReadings", ...keys]) {
            if (entry[key] !== undefined) newEntry[key] = entry[key]
          }
          return newEntry
        })
      }
      setCurrentData(filteredData)
      setCurrentConfig(filteredConfig)
      setError(customError || null)
      onConfigChange?.(filteredConfig)
      setKey(prev => prev + 1)
    }
    loadData()
  }, [selectedTimespan, preset])


  // Format x-axis ticks based on timespan
  const formatXAxisTick = (value: string) => {
    if (selectedTimespan === "month") {
      // For monthly view (last 30 days of SDAT), show DD.MM.YYYY
      const date = new Date(value);
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
      });
    } else if (selectedTimespan === "day") {
      // For daily view, show time HH:mm
      return value;
    } else if (selectedTimespan === "total") {
      // For "total" view, format depends on the data being shown
      const date = new Date(value);
      // When showing daily SDAT data
      if (currentConfig.hasOwnProperty('bezug')) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      }
      // When showing monthly ESL data
      return date.toLocaleDateString("de-DE", {
        month: "2-digit",
        year: "numeric"
      });
    } else if (selectedTimespan === "year") {
      // For yearly view, show abbreviated month from a parsable date string
      const date = new Date(value);
      return date.toLocaleDateString("de-DE", { month: "short" });
    }
    // Fallback for other cases
    return value;
  };

  // Handle timespan change
  const handleTimespanChange = (value: string) => {
    setSelectedTimespan(value)
    onTimespanChange?.(value) // Notify parent component
  }

  // Function to download data as CSV
  const downloadCSV = () => {
    // Create CSV header row
    const headers = Object.keys(currentData[0]).join(',');

    // Create CSV content rows
    const csvRows = currentData.map((row: any) =>
      Object.values(row).join(',')
    );

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join('\n');

    // Create downloadable blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `power-data-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download data as JSON
  const downloadJSON = () => {
    // Create JSON string from data
    const jsonContent = JSON.stringify(currentData, null, 2);

    // Create downloadable blob
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `power-data-${new Date().toISOString().slice(0, 10)}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <Card className={cn("w-10/12", className)}>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          {isSDATData ? "Verbrauchsdiagramm" : "Leistungsdiagramm"}
        </CardTitle>
        <Tabs value={selectedTimespan} onValueChange={handleTimespanChange} className="w-[400px]">
          <TabsList className="w-full">
            <TabsTrigger value="day">Tag</TabsTrigger>
            <TabsTrigger value="month">Monat</TabsTrigger>
            <TabsTrigger value="year">Jahr</TabsTrigger>
            <TabsTrigger value="total">Gesamt</TabsTrigger>
          </TabsList>
        </Tabs>
        <DropdownMenu>
          <DropdownMenuTrigger className="border px-3 py-1 rounded-sm font-medium flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Herunterladen
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={downloadCSV}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadJSON}>
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-[400px] text-destructive">
            {error}
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-[400px] text-muted-foreground">
            <div className="text-center space-y-3">
              <div className="mb-4">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">Keine Daten verfügbar</h3>
              <p className="text-sm max-w-md">
                Es sind noch keine {isSDATData ? 'SDAT' : 'ESL'}-Daten vorhanden.
                Bitte laden Sie zunächst entsprechende Dateien über die Upload-Seite hoch.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg text-xs">
                <strong>Hinweis:</strong> {isSDATData ? 'SDAT' : 'ESL'}-Dateien werden für die {isSDATData ? 'Tages- und Monatsansicht' : 'Jahresansicht'} benötigt.
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChartContainer config={currentConfig}>
                <AreaChart
                  accessibilityLayer
                  data={currentData}
                  margin={{
                    left: 60,
                    right: 12,
                    top: 20,
                    bottom: 5
                  }}
                  height={400}
                >
                  <CartesianGrid
                    vertical={false}
                    className="stroke-muted-foreground/20"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatXAxisTick}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickCount={6}
                    domain={[0, 'dataMax']}
                    allowDataOverflow={false}
                    tickFormatter={(value) =>
                      isSDATData
                        ? `${value.toFixed(1)} kWh`
                        : `${(value / 1000).toFixed(1)}k kWh`
                    }
                    className="fill-muted-foreground"
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    {Object.keys(currentConfig).map((key) => (
                      <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={currentConfig[key].color}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={currentConfig[key].color}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  {Object.keys(currentConfig).map((key) => (
                    <Area
                      key={key}
                      dataKey={key}
                      type="monotone"
                      fill={`url(#fill-${key})`}
                      fillOpacity={0.4}
                      stroke={currentConfig[key].color}
                      strokeWidth={2}
                      connectNulls={false}
                      baseLine={0}
                    />
                  ))}
                </AreaChart>
              </ChartContainer>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}

// Update the ChartTooltipContent component to show correct data for all views
function ChartTooltipContent({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  // Determine if we're in SDAT view (monthly/daily) or ESL view (yearly)
  const isSDATView = data.hasOwnProperty('bezug') || data.hasOwnProperty('einspeisung');
  const currentConfig: ChartConfig = isSDATView ? sdatConfig : obisConfig;

  return (
    <div className="rounded-lg bg-white/25 dark:bg-black/25 p-4 shadow-lg border border-gray-200 backdrop-blur-sm">
      <p className="font-semibold mb-2">{data.fullDate || data.month}</p>
      {payload.map((entry: any) => {
        const configKey = entry.dataKey as string;
        const itemConfig = currentConfig[configKey];
        if (!itemConfig) return null;
        const value = isSDATView
          ? `${entry.value.toFixed(2)} kWh`
          : `${(entry.value / 1000).toFixed(1)}k kWh`;
        return (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">
              {itemConfig.label}: {value}
            </span>
          </div>
        );
      })}
      {data.totalReadings && (
        <p className="text-xs text-gray-500 mt-2">
          Tagessumme aus {data.totalReadings} Messungen
        </p>
      )}
    </div>
  );
}