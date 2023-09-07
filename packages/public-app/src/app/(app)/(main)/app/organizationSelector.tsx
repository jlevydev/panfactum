import { useContext, useEffect, useRef, useState } from 'react'
import {
  autoUpdate, FloatingFocusManager, FloatingPortal,
  useClick,
  useDismiss,
  useFloating, useInteractions,
  useListNavigation,
  useRole,
  useTypeahead
} from '@floating-ui/react'
import { Check, NavArrowDown } from 'iconoir-react'
import { ActiveOrganizationContext } from '@/lib/contexts/ActiveOrganizationContext'
import { useUserOrganizationsQuery } from '@/lib/hooks/queries/useUserOrganizationsQuery'

const UNITARY_ORG_DISPLAY_NAME = 'Personal'

export function OrganizationSelector () {
  // Global Data
  const { data: userOrgs = [], isLoading } = useUserOrganizationsQuery()
  const { setActiveOrganizationId, activeOrganizationId } = useContext(ActiveOrganizationContext)

  // Set the options for the selector
  const options = userOrgs.map(org => {
    return {
      name: org.isUnitary ? UNITARY_ORG_DISPLAY_NAME : org.name,
      id: org.id
    }
  }).sort(({ name }, { name: name2 }) => {
    // The unitary org should always come first
    return name === UNITARY_ORG_DISPLAY_NAME ? -1 : name2 === UNITARY_ORG_DISPLAY_NAME ? 1 : 0
  })

  // Local State
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // If the active organization id changes from an external source,
  // update the selected index in here
  useEffect(() => {
    setSelectedIndex(options.findIndex(({ id }) => id === activeOrganizationId))
  }, [activeOrganizationId, isLoading, options])

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate
  })

  const listRef = useRef<Array<HTMLElement | null>>([])
  const isTypingRef = useRef(false)

  const click = useClick(context, { event: 'mousedown' })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'listbox' })

  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    // This is a large list, allow looping.
    loop: true
  })

  const typeahead = useTypeahead(context, {
    listRef: useRef(options.map(({ name }) => name)),
    activeIndex,
    selectedIndex,
    onMatch: isOpen ? setActiveIndex : setSelectedIndex,
    onTypingChange (isTyping) {
      isTypingRef.current = isTyping
    }
  })

  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps
  } = useInteractions([dismiss, role, listNav, typeahead, click])

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    setIsOpen(false)
    const newOrgId = options[index]?.id
    if (newOrgId !== undefined) {
      setActiveOrganizationId(newOrgId)
    }
  }

  const selectedItemLabel =
    selectedIndex !== null ? options[selectedIndex]?.name : undefined

  return (
    <>
      <div
        tabIndex={0}
        ref={refs.setReference}
        aria-autocomplete="none"
        className="text-xl px-4 mt-2 hover:bg-neutral flex items-center justify-between"
        {...getReferenceProps()}
      >
        {selectedItemLabel || 'Loading...'}
        <NavArrowDown/>
      </div>
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
          >
            <div
              ref={refs.setFloating}
              className="bg-neutral shadow border-black rounded outline-none"
              style={{
                ...floatingStyles
              }}
              {...getFloatingProps()}
            >
              {options.map(({ name, id }, i) => (
                <div
                  key={id}
                  ref={(node) => {
                    listRef.current[i] = node
                  }}
                  role="option"
                  tabIndex={i === activeIndex ? 0 : -1}
                  aria-selected={i === selectedIndex && i === activeIndex}
                  className="p-2 flex justify-between"
                  {...getItemProps({
                    // Handle pointer select.
                    onClick () {
                      handleSelect(i)
                    },
                    // Handle keyboard select.
                    onKeyDown (event) {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleSelect(i)
                      }

                      if (event.key === ' ' && !isTypingRef.current) {
                        event.preventDefault()
                        handleSelect(i)
                      }
                    }
                  })}
                >
                  {name}
                  {i === selectedIndex && <Check/>}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}
