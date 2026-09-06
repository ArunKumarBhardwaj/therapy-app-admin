import { setServiceActive } from '@/app/admin/services/actions'
import { Button } from '@/components/ui/button'

export function ToggleActiveButton({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const action = setServiceActive.bind(null, id, !isActive)

  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="sm">
        {isActive ? 'Deactivate' : 'Activate'}
      </Button>
    </form>
  )
}
