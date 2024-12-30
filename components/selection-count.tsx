interface SelectionCountProps {
  count: number
}

export function SelectionCount({ count }: SelectionCountProps) {
  if (count <= 1) return null
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium z-50">
      {count} items selected
    </div>
  )
}

