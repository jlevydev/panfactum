import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { memo, useContext } from 'react'

import DefaultTooltip from '@/components/tooltip/DefaultTooltip'
import { TitleContext } from '@/lib/contexts/app/Title'

export default memo(function Title () {
  const { title } = useContext(TitleContext)
  const header = title?.header
  const id = title?.id

  return (
    <div className="flex flex-row flex-wrap items-baseline gap-x-4 w-full overflow-hidden">
      {header && (
        <>
          <h1 className="text-xl lg:text-2xl xl:text-3xl  max-w-[100%] lg:max-w-[50%] text-ellipsis overflow-hidden">
            {header}
          </h1>
          {id && (
            <div className="text-xs lg:text-sm xl:text-base text-ellipsis overflow-hidden flex gap-x-2 items-baseline">
              <span className="hidden sm:inline ">
                {id}
              </span>
              <DefaultTooltip title="Copy ID to clipboard">
                <ContentCopyIcon
                  fontSize={'10px' as 'small'}
                  onClick={() => {
                    void navigator.clipboard.writeText(id)
                  }}
                />
              </DefaultTooltip>
            </div>
          )}
        </>
      )}
    </div>
  )
})
