import { startTransition, useActionState } from 'react'

export type FormResult = { tone: 'error' | 'notice'; message: string } | null

export const fail = (message: string): FormResult => ({ tone: 'error', message })
export const notice = (message: string): FormResult => ({ tone: 'notice', message })

export function useFormAction(action: () => Promise<FormResult>) {
  const [result, dispatch, pending] = useActionState<FormResult, void>(action, null)
  const submit = () => startTransition(dispatch)
  return [pending ? null : result, submit, pending] as const
}
