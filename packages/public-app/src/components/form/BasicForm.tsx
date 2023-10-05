import type { ReactElement } from 'react'
import React from 'react'
import { EditBase, Form, SaveButton } from 'react-admin'

import useDistanceFromScreenBottom from '@/lib/hooks/effects/useDistanceFromScreenBottom'

interface IBasicFormProps {
  resource: string;
  id: string;
  children: ReactElement
}

export default function BasicForm (props: IBasicFormProps) {
  const { resource, id, children } = props
  const [distanceFromBottom, contentRef] = useDistanceFromScreenBottom<HTMLDivElement>()
  return (
    <EditBase
      resource={resource}
      id={id}
      component="div"
    >
      <Form className="flex flex-col">
        <div
          className="flex flex-col gap-4 overflow-y-scroll p-4"
          ref={contentRef}
          style={{
            maxHeight: distanceFromBottom === 0 ? 'initial' : `calc(${distanceFromBottom}px - 4rem - 16px)`
          }}
        >
          {children}
        </div>
        <div
          className="flex flex-row bottom-0 bg-base-300 p-4 gap-4 h-[4rem]"
        >
          <SaveButton label="Save" />
        </div>
      </Form>
    </EditBase>
  )
}
