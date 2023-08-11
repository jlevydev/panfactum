import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import DashboardBoxChart, { AggregateStatsType } from '../components/dashboardBoxChart'
import MainLayout from './main'

/*******************************************************
 * Dashboard Switcher
 *******************************************************/

const DASHBOARD_PATH = '/dashboard'
const DASHBOARDS = [
  {
    name: 'All',
    path: '/all'
  },
  {
    name: 'Youtube',
    path: '/youtube'
  },
  {
    name: 'Tiktok',
    path: '/tiktok'
  },
  {
    name: 'Instagram',
    path: '/instagram'
  }
]

/*******************************************************
 * Filters
 *
 * TODO: We should probably be getting this dynamically
 * from the backend based on the platform
 *******************************************************/
const INDUSTRIES = [
  {
    id: '0',
    text: 'All'
  },
  {
    id: '1',
    text: 'Industry 1'
  },
  {
    id: '2',
    text: 'Industry 2'
  },
  {
    id: '3',
    text: 'Industry 3'
  },
  {
    id: '4',
    text: 'Industry 4'
  },
  {
    id: '5',
    text: 'Industry 5'
  }
]

const REACHES = [
  {
    id: '0',
    text: 'All'
  },
  {
    id: '1',
    text: '<100k'
  },
  {
    id: '2',
    text: '100-500k'
  },
  {
    id: '3',
    text: '500k-1.5M'
  },
  {
    id: '4',
    text: '1.5M+'
  }
]

const DEAL_TYPES = [
  {
    id: '0',
    text: 'All'
  },
  {
    id: '1',
    text: 'Embedded Content'
  },
  {
    id: '2',
    text: 'User-generated Content'
  },
  {
    id: '3',
    text: 'Ad Read'
  }
]

/*******************************************************
 * Main Layout Component
 *******************************************************/

// Renders a chip showing what platform page we are currently on
// and allows users to change switch the page
function PlatformChip (props: {path: string, name: string}) {
  const pathname = usePathname()
  const { path, name } = props
  return (
    <Link
      href={`${DASHBOARD_PATH}${path}`}
      className={'flex text-sm md:text-base justify-center items-center cursor-pointer rounded-full border border-gray-300 h-4/5 py-2 px-4 hover:bg-gray-300 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out ' + ((pathname || '').endsWith(path) ? 'bg-primary text-white' : 'bg-white')}
      style={{ minWidth: '5rem' }}
      key={name}
    >
      {name}
    </Link>
  )
}

// Wrapper for labeling and spacing of a filter for the dashboard data
function Filter (props: {name: string, children: React.ReactNode}) {
  const { name, children } = props
  return (
    <div
      className="flex flex-col md:text-base items-center gap-1"
    >
      <div
        className="font-bold text-base md:text-lg text-center"
      >
        {name}
      </div>
      <div className="flex-grow"/>
      {children}
    </div>
  )
}

interface IBooleanFilterProps {
  value: boolean;
  setter: (newValue: boolean) => void;
  name: string;
}
function BooleanFilter (props: IBooleanFilterProps) {
  const { value, setter, name } = props
  return (
    <Filter name={name}>
      <input
        type="checkbox"
        className="h-4 w-4 md:h-6 md:w-6 m-2"
        checked={value}
        onChange={e => setter(e.target.checked)}
      />
    </Filter>
  )
}

interface ISingleSelectFilterProps {
  value: string;
  setter: (newValue: string) => void;
  options: {text: string, id: string}[]
  name: string;
}
function SingleSelectFilter (props: ISingleSelectFilterProps) {
  const { value, setter, options, name } = props
  return (
    <Filter name={name}>
      <select
        className="rounded-full text-xs md:text-sm text-black bg-white"
        value={value}
        onChange={e => {
          const newValue = e.target.value as unknown
          if (typeof newValue === 'string') {
            setter(newValue)
          }
        }}
      >
        {options.map(({ id, text }) => (
          <option
            value={id}
            key={id}
          >
            {text}
          </option>
        ))}
      </select>
    </Filter>
  )
}

/*******************************************************
 * Main Layout Component
 *******************************************************/
export default function Dashboard () {
  const [industry, setIndustry] = useState<string>('0')
  const [brandMatchesCreator, setBrandMatchesCreator] = useState<boolean>(false)
  const [reach, setReach] = useState<string>('0')
  const [dealType, setDealType] = useState<string>('0')

  return (
    <MainLayout>
      <div
        className="flex grow flex-col"
      >
        <div
          className="font-bold text-base md:text-lg text-left pl-5 pt-5"
        >
          Platform
        </div>
        <div
          className="h-10 md:h-12 flex flex-row justify-start items-center gap-4 pl-4"
        >
          {
            DASHBOARDS.map(({ name, path }) => (
              <PlatformChip
                key={path}
                name={name}
                path={path}
              />
            ))
          }
        </div>
        <div
          className="grow flex flex-col mt-3"
        >
          <div
            className="basis-24 flex flex-row gap-6 md:gap-12 justify-left pl-4 mb-6"
          >
            <SingleSelectFilter
              name="Brand Industry"
              options={INDUSTRIES}
              setter={setIndustry}
              value={industry}
            />
            <BooleanFilter
              name="Brand Matches Creator"
              value={brandMatchesCreator}
              setter={setBrandMatchesCreator}
            />
            <SingleSelectFilter
              name="Creator Reach"
              options={REACHES}
              setter={setReach}
              value={reach}
            />
            <SingleSelectFilter
              name="Deal Type"
              options={DEAL_TYPES}
              setter={setDealType}
              value={dealType}
            />
          </div>
          <hr className="mb-6"/>
        </div>
        <div
          className="flex flex-row flex-wrap"
        >
          <div
            className="w-full md:basis-2/3"
          >
            <DashboardBoxChart
              title="Dollars per Video by Video Count"
              type={AggregateStatsType.BY_COUNT}
              brandMatchesCreatorFilter={brandMatchesCreator}
              industryFilter={industry}
              reachFilter={reach}
              dealTypeFilter={dealType}
            />
            <DashboardBoxChart
              title="Dollars per Video by Effort"
              type={AggregateStatsType.BY_EFFORT}
              brandMatchesCreatorFilter={brandMatchesCreator}
              industryFilter={industry}
              reachFilter={reach}
              dealTypeFilter={dealType}
            />
            <DashboardBoxChart
              title="Dollars per Video by Creator Team Size"
              type={AggregateStatsType.BY_TEAMSIZE}
              brandMatchesCreatorFilter={brandMatchesCreator}
              industryFilter={industry}
              reachFilter={reach}
              dealTypeFilter={dealType}
            />
            <DashboardBoxChart
              title="Dollars per Video by Sellout Score"
              type={AggregateStatsType.BY_SELLOUT}
              brandMatchesCreatorFilter={brandMatchesCreator}
              industryFilter={industry}
              reachFilter={reach}
              dealTypeFilter={dealType}
            />
          </div>
          <div
            className="w-full md:basis-1/3 flex-col items-center"
          >
            <div className="text-2xl font-bold">
              Selected Deals
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
