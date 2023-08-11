import ReactECharts from 'echarts-for-react'
import { useEffect, useState } from 'react'
import { API_URL } from '../../lib/constants'

export enum AggregateStatsType {
    BY_COUNT = 'by-count',
    BY_EFFORT = 'by-effort',
    BY_TEAMSIZE = 'by-teamsize',
    BY_SELLOUT = 'by-sellout'
}

export interface IDashboardBoxChartProps {
    title: string;
    type: AggregateStatsType;
    industryFilter: string;
    reachFilter: string;
    dealTypeFilter: string;
    brandMatchesCreatorFilter: boolean;
}

export default function DashboardBoxChart (props: IDashboardBoxChartProps) {
  const {
    title,
    type,
    industryFilter,
    reachFilter,
    dealTypeFilter,
    brandMatchesCreatorFilter
  } = props

  const [aggregateData, setAggregateData] = useState<(string|number)[][]>([])
  const [creatorData, setCreatorData] = useState<(string|number)[][]>([])

  useEffect(() => {
    const params = (new URLSearchParams({
      brandIndustry: industryFilter,
      brandMatchesCreator: brandMatchesCreatorFilter.toString(),
      creatorReach: reachFilter,
      dealType: dealTypeFilter
    })).toString()

    const fetchAggregateData = async () => {
      const response = await fetch(`${API_URL}/v1/stats/aggregate/${type}?${params}`)
      const { data, labels } = await response.json() as {data: number[][], labels: string[]}
      setAggregateData(labels.map((label, i) => [label, ...(data[i]!)] as (string|number)[]))
    }
    const fetchCreatorData = async () => {
      const response = await fetch(`${API_URL}/v1/stats/creator/1/${type}?${params}`)
      const { data, labels } = await response.json() as {data: number[][], labels: string[]}
      setCreatorData(labels.map((label, i) => (data[i]!).map(value => [label, value])).flat(1))
    }
    void fetchAggregateData()
    void fetchCreatorData()
  }, [
    type,
    industryFilter,
    reachFilter,
    dealTypeFilter,
    brandMatchesCreatorFilter
  ])

  if (aggregateData.length === 0) return null

  return (
  // For some damn reason, the content width MUST be set here in order for chart resizing
  // to work properly. Additionally, it MUST be done via a class in order to not
  // bork the user's CPU for redraw events.
    <div
      className="flex flex-col items-center relative mx-auto h-min-48 w-content-width-sm md:content-2col-width-lg"
    >
      <div className="font-bold text-2xl text-center">
        {title}
      </div>
      <ReactECharts
        style={{
          width: '100%' // This MUST BE set here in order for resizing to work properly
        }}
        option={ {
          dataset: [
            {
              source: aggregateData
            },
            {
              source: creatorData
            }
          ],
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: 0,
            right: 0,
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              fontSize: 20
            }
          },
          yAxis: {
            type: 'value',
            name: '$',
            splitArea: {
              show: true
            },
            axisLabel: {
              fontSize: 20
            }
          },
          series: [
            {
              name: 'boxplot',
              type: 'boxplot',
              datasetIndex: 0
            },
            {
              name: 'test',
              type: 'scatter',
              datasetIndex: 1
            }
          ]
        }}
        notMerge={true}
      />
    </div>
  )
}
