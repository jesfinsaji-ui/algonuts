import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'

export function NotFound() {
  return (
    <div className="py-16">
      <EmptyState
        title="Signal lost"
        description="This route is outside the current mission. Return to the overview to re-establish telemetry."
        action={
          <Link to="/">
            <Button size="sm">Return to overview</Button>
          </Link>
        }
      />
    </div>
  )
}
