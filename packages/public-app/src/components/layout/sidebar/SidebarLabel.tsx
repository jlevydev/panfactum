import { memo, useContext } from 'react'

import { SidebarOpenContext } from '@/lib/contexts/app/SidebarOpen'

export default memo(function SidebarLabel ({ label }: {label: string}) {
  const { open } = useContext(SidebarOpenContext)
  return (
    <div className="flex mb-1 mt-3 gap-3">
      {open && (
        <div className="uppercase text-sm lg:text-base xl:text-lg text-secondary font-bold ">
          {label}
        </div>
      )}
      <div className="border-0 h-0.5 bg-base-300 mx-0 my-3 grow"/>
    </div>
  )
})
