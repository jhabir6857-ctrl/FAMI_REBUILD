'use client'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => void signOut({ callbackUrl: '/' })}>
      Sign out
    </Button>
  )
}
