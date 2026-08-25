'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CopyReferralButtonProps {
  referralCode: string
  referralUrl: string
}

export function CopyReferralButton({ referralCode, referralUrl }: CopyReferralButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = referralCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function shareUrl() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join FaMi — ৳100 off your first order',
          text: `Use my referral code ${referralCode} to get a welcome bonus when you join FaMi.`,
          url: referralUrl,
        })
        return
      } catch {
        // User cancelled share or share not supported — fall through to copy
      }
    }
    // Fallback: copy the full URL
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* non-fatal */
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        size="md"
        onClick={() => void copyCode()}
        className="w-full"
      >
        {copied ? (
          <>
            <Check size={16} aria-hidden="true" />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} aria-hidden="true" />
            Copy code
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="md"
        onClick={() => void shareUrl()}
        className="w-full"
      >
        <Share2 size={16} aria-hidden="true" />
        Share referral link
      </Button>
    </div>
  )
}
