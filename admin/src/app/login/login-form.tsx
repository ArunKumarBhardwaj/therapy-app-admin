'use client'

import { useActionState } from 'react'
import { signIn, type SignInState } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: SignInState = { error: null }

export function LoginForm({
  defaults,
}: {
  defaults?: { email: string; password: string }
}) {
  const [state, action, pending] = useActionState(signIn, initialState)
  const showPassword = Boolean(defaults?.password)

  return (
    <form action={action} className="space-y-4">
      {defaults ? (
        <p className="text-xs text-muted-foreground">
          Dev login is filled in. Password is visible on this machine only.
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaults?.email}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          defaultValue={defaults?.password}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
