import { useState } from "react"
import { ChartComp, obisConfig, sdatConfig } from "./chart"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"

type ChartConfig = {
    [key: string]: {
        label: string
        color: string
    }
}

export default function HomePage() {
    const [preset, setPreset] = useState<string>("")
    const [currentTimespan, setCurrentTimespan] = useState<string>("month")
    const [currentConfig, setCurrentConfig] = useState<ChartConfig>(sdatConfig);

    const handlePresetChange = (value: string) => {
        setPreset(value)
    }

    const handleTimespanChange = (timespan: string) => {
        setCurrentTimespan(timespan)
        setPreset("")
    }

    const handleConfigChange = (config: ChartConfig) => {
        setCurrentConfig(config);
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="flex xl:flex-row flex-col-reverse gap-4 mb-10 px-8 max-w-7xl mx-auto">
                <ChartComp preset={preset} onTimespanChange={handleTimespanChange} onConfigChange={handleConfigChange} className="xl:w-10/12 w-full" />
                <Card className="xl:w-2/12 w-full xl:h-fit h-full">
                    <CardContent className="flex xl:flex-col flex-row items-center gap-8 xl:gap-4">
                        <CardTitle>Diagramm-Optionen</CardTitle>
                        <div className="flex-shrink-0 xl:w-full">
                            <Select value={preset} onValueChange={handlePresetChange}>
                                <SelectTrigger className="xl:w-full w-[200px]">
                                    <SelectValue placeholder="Darstellung auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(currentConfig).includes('bezug') ? (
                                    <>
                                      <SelectItem value=" ">Standard</SelectItem>
                                      <SelectItem value="purchase">Bezug</SelectItem>
                                      <SelectItem value="feedIn">Einspeisung</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value=" ">Standard</SelectItem>
                                      <SelectItem value="purchaseHighTariff">Bezug Hochtarif</SelectItem>
                                      <SelectItem value="purchaseLowTariff">Bezug Niedertarif</SelectItem>
                                      <SelectItem value="feedInHighTariff">Einspeisung Hochtarif</SelectItem>
                                      <SelectItem value="feedInLowTariff">Einspeisung Niedertarif</SelectItem>
                                      <SelectItem value="purchase">Bezug</SelectItem>
                                      <SelectItem value="feedIn">Einspeisung</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="xl:mt-4 xl:w-full flex-1">
                            <h3 className="font-semibold text-sm mb-2 xl:block hidden">Legende</h3>
                            <div className="flex flex-row flex-wrap gap-4">
                                {Object.entries(currentConfig).map(([key, config]) => (
                                    <div key={key} className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: config.color }}
                                        />
                                        <span className="text-sm whitespace-nowrap">{config.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
