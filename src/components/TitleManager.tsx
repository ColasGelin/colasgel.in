'use client'

import { useEffect, useState } from 'react'

interface PageTitle {
  id: string
  title: string
  fontSize?: string
  fontClass?: string
  color?: string
}

interface TitleManagerProps {
  activeTab: string
  pageTitles: PageTitle[]
}

export default function TitleManager({ activeTab, pageTitles }: TitleManagerProps) {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0)

  useEffect(() => {
    const newIndex = pageTitles.findIndex(page => page.id === activeTab)
    if (newIndex !== -1) {
      setCurrentTitleIndex(newIndex)
    }
  }, [activeTab, pageTitles])

  const getTransformClass = (index: number) => {
    if (index < currentTitleIndex) {
      // Previous titles go up and out
      return 'transform -translate-y-full opacity-0'
    } else if (index > currentTitleIndex) {
      // Future titles stay below
      return 'transform translate-y-full opacity-0'
    } else {
      // Current title in center
      return 'transform translate-y-0 opacity-100'
    }
  }

    return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {pageTitles.map((page, index) => (
        <div
          key={page.id}
          className={`absolute flex items-center justify-center transition-all duration-1000 ease-in-out ${getTransformClass(index)}`}
        >
          <h1 
            className={`font-bold select-none text-center ${page.fontClass || 'barber-font'}`}
            style={{
              fontSize: page.fontSize || '16rem',
              color: page.color || '#fefae0',
              whiteSpace: 'pre-line'
            }}
          >
            {page.title}
          </h1>
        </div>
      ))}
    </div>
  )
}