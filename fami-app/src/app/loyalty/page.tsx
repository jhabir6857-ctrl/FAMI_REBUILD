import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserById, getCategories } from '@/lib/data'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { CopyReferralButton } from '@/components/account/CopyReferralButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Loyalty & Rewards' }

export default async function LoyaltyPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/loyalty')

  const userId = Number(session.user.id)
  const [user, categories] = await Promise.all([
    getUserById(userId),
    getCategories(),
    ])
  if (!user) redirect('/login')

  const referralUrl = `https://famibd.shop/register?ref=${user.referralCode}`

  // Tier thresholds (illustrative — adjust when a real tier system is designed)
  type Tier = { name: string; min: number; max: number; color: string }
  const tiers: Tier[] = [
    { name: 'Silver', min: 0, max: 499, color: 'text-[var(--color-text-muted)]' },
    { name: 'Gold', min: 500, max: 1999, color: 'text-amber-500' },
    { name: 'Platinum', min: 2000, max: Infinity, color: 'text-[var(--color-ink-plum)]' },
  ]

  // Reduce to find the highest tier the user qualifies for (always defined since Silver.min = 0)
  const defaultTier = tiers[0] ?? { name: 'Silver', min: 0, max: 499, color: 'text-[var(--color-text-muted)]' }
  const currentTier = tiers.reduce<Tier>(
    (best, t) => (user.loyaltyPoints >= t.min ? t : best),
    defaultTier,
  )
  const currentIndex = tiers.findIndex(t => t.name === currentTier.name)
  const nextTier = currentIndex >= 0 && currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : undefined

  const progressToNext = nextTier
    ? Math.min(100, Math.round(((user.loyaltyPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100))
    : 100


  return (
    <>
      <Header categories={categories} isLoggedIn />
      <main className="container-fami py-10 md:py-16 pb-24 md:pb-16">
        {/* Hero */}
        <div className="mb-10">
          <span className="hallmark-stamp mb-4 inline-block">Members only</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-[var(--color-ink-plum)] leading-tight">
            Loyalty &amp; Rewards
          </h1>
          <p className="font-ui text-base text-[var(--color-text-muted)] mt-3 max-w-xl">
            Every purchase earns you points. Every point gets you closer to exclusive rewards.
          </p>
        </div>

        <hr className="divider-gold mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Points balance + tier */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Balance card */}
            <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-6 bg-[var(--color-parchment-100)]">
              <p className="font-ui text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Your balance</p>
              <p className="font-display text-5xl font-medium text-[var(--color-emerald)]">
                {user.loyaltyPoints.toLocaleString()}
                <span className="font-ui text-base font-normal text-[var(--color-text-muted)] ml-2">pts</span>
              </p>
              <p className={`font-ui text-sm font-medium mt-3 ${currentTier.color}`}>
                {currentTier.name} member
              </p>

              {nextTier && (
                <div className="mt-4">
                  <div className="flex justify-between font-ui text-xs text-[var(--color-text-muted)] mb-1.5">
                    <span>{user.loyaltyPoints} pts</span>
                    <span>{nextTier.min} pts for {nextTier.name}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-border-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-emerald)] transition-all"
                      style={{ width: `${progressToNext}%` }}
                      role="progressbar"
                      aria-valuenow={progressToNext}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="font-ui text-xs text-[var(--color-text-muted)] mt-1.5">
                    {nextTier.min - user.loyaltyPoints} points to reach {nextTier.name}
                  </p>
                </div>
              )}
            </div>

            {/* How to earn */}
            <div>
              <h2 className="font-display text-2xl font-medium text-[var(--color-ink-plum)] mb-5">How to earn points</h2>
              <div className="flex flex-col divide-y divide-[var(--color-border-muted)] border border-[var(--color-border-muted)] rounded-[var(--radius-md)]">
                {[
                  { action: 'Every purchase', points: '1 pt per ৳100 spent', note: 'Awarded automatically after your order is confirmed.' },
                  { action: 'Refer a friend', points: '100 bonus pts', note: 'When they register using your referral code and place their first order.' },
                  { action: 'More coming soon', points: '—', note: 'Birthday bonuses, review rewards and seasonal events are on the roadmap.' },
                ].map(row => (
                  <div key={row.action} className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                    <div>
                      <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{row.action}</p>
                      <p className="font-ui text-xs text-[var(--color-text-muted)] mt-0.5">{row.note}</p>
                    </div>
                    <p className="font-ui text-sm font-medium text-[var(--color-emerald)] flex-shrink-0">{row.points}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to redeem */}
            <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-6">
              <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-3">Redeeming points</h2>
              <p className="font-ui text-sm text-[var(--color-text-muted)]">
                Point redemption at checkout is coming soon. When it launches, you&apos;ll be able to use your points as a discount — e.g. 100 points = ৳10 off. Your points will never expire while you&apos;re an active member, so keep earning.
              </p>
            </div>
          </div>

          {/* Right: Referral code */}
          <div className="flex flex-col gap-6">
            <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-6 bg-[var(--color-parchment-100)]">
              <h2 className="font-display text-xl font-medium text-[var(--color-ink-plum)] mb-1">Your referral code</h2>
              <p className="font-ui text-xs text-[var(--color-text-muted)] mb-5">
                Share your code and earn 100 points when a friend registers and places their first order.
              </p>

              <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-3 text-center mb-4">
                <p className="font-ui text-lg font-medium text-[var(--color-ink-plum)] tracking-[0.2em]">{user.referralCode}</p>
              </div>

              <CopyReferralButton referralCode={user.referralCode} referralUrl={referralUrl} />
            </div>

            {/* Tier overview */}
            <div className="border border-[var(--color-border-muted)] rounded-[var(--radius-md)] p-6">
              <h2 className="font-display text-lg font-medium text-[var(--color-ink-plum)] mb-4">Membership tiers</h2>
              <div className="flex flex-col gap-3">
                {tiers.filter(t => t.max !== Infinity).map(tier => (
                  <div key={tier.name} className="flex justify-between items-center">
                    <p className={`font-ui text-sm font-medium ${tier.color}`}>{tier.name}</p>
                    <p className="font-ui text-xs text-[var(--color-text-muted)]">{tier.min}–{tier.max} pts</p>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <p className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">Platinum</p>
                  <p className="font-ui text-xs text-[var(--color-text-muted)]">2000+ pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav isLoggedIn />
    </>
  )
}

