import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { SettingsClient } from './SettingsClient'

export const metadata = { title: 'Store Settings | Admin' }

export default async function AdminSettingsPage() {
  const [current] = await db.select().from(settings).limit(1)

  const defaultSettings = current || {
    deliveryChargeInside: 80,
    deliveryChargeOutside: 150,
    freeShippingThreshold: 5000
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-[var(--color-ink-plum)]">Store Settings</h1>
        <p className="font-ui text-sm text-[var(--color-text-muted)] mt-1">Configure global store behavior like delivery charges.</p>
      </div>
      <SettingsClient initialSettings={defaultSettings} />
    </div>
  )
}
