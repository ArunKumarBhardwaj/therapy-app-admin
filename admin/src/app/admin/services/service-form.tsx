'use client'

import { useActionState } from 'react'
import type { ServiceFormState } from '@/app/admin/services/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Service } from '@/lib/domain'

const initialState: ServiceFormState = { error: null }

export function ServiceForm({
  service,
  action,
  imageUrl,
  videoUrl,
}: {
  service?: Service
  action: (state: ServiceFormState, formData: FormData) => Promise<ServiceFormState>
  imageUrl?: string | null
  videoUrl?: string | null
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={service?.title}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={service?.description}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={service?.price ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration minutes</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={service?.durationMinutes ?? 60}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={service?.isActive ?? true}
          className="size-4 rounded border-input"
        />
        Active
      </label>
      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail</Label>
        {imageUrl ? (
          <p className="text-sm text-muted-foreground">
            Current file is stored. Upload a new image to replace it.
          </p>
        ) : null}
        <Input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="video">Video</Label>
        {videoUrl ? (
          <p className="text-sm text-muted-foreground">
            Current file is stored. Upload a new video to replace it.
          </p>
        ) : null}
        <Input id="video" name="video" type="file" accept="video/*" />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : service ? 'Save service' : 'Create service'}
      </Button>
    </form>
  )
}
