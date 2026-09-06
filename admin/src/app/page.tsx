import Image from 'next/image'
import Link from 'next/link'
import { publicMediaUrl, type Service } from '@/lib/domain'
import { formatDuration, formatPrice } from '@/lib/format'
import { listServices } from '@/lib/services'
import { publicEnv } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function loadFeaturedServices(): Promise<Service[]> {
  const supabase = await createClient()
  if (!supabase) return []
  try {
    return await listServices(supabase, { activeOnly: true })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const services = await loadFeaturedServices()
  const env = publicEnv()

  return (
    <div className="min-h-full bg-background text-foreground">
      <section className="relative min-h-[100svh] text-[#f4f6f3]">
        <Image
          src="/landing/haven-hero-room.png"
          alt="Two chairs facing each other in a quiet room, a box of tissues on the table between them."
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />

        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-7 sm:px-10">
          <p className="text-[15px] font-medium tracking-tight">Haven</p>
          <p className="text-sm text-white/70">Private practice</p>
        </header>

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-16 sm:px-10 sm:pb-20">
          <h1 className="max-w-[14ch] font-serif text-[2.75rem] leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl">
            Come in. Sit down. Say the thing you have been carrying.
          </h1>
          <p className="mt-6 max-w-[36ch] text-base leading-7 text-white/80 sm:text-lg">
            One room. One hour. Yours.
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="relative min-h-[70vh] lg:min-h-[92vh]">
          <Image
            src="/landing/haven-still-life.png"
            alt="A ceramic cup and a green cloth-bound book on a dark wooden table."
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-end bg-[#1f3d32] px-6 py-16 text-[#eef1ee] sm:px-12 lg:px-16 lg:py-24">
          <h2 className="max-w-[16ch] font-serif text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
            You book a time. You arrive. We sit with whatever you brought.
          </h2>
          <p className="mt-8 max-w-[38ch] text-base leading-7 text-[#c5d0c8]">
            Haven is a one-to-one therapy room for adults. We talk about what
            is happening now, not a script. You leave with something you can
            use the rest of the week.
          </p>
        </div>
      </section>

      <section className="relative h-[64vh] min-h-[420px] sm:h-[78vh]">
        <Image
          src="/landing/haven-doorway.png"
          alt="An open wooden door looking into a sunlit room with a single chair by the window."
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </section>

      {services.length > 0 ? (
        <section className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-10">
          <h2 className="font-serif text-3xl font-medium tracking-[-0.02em]">
            Offerings
          </h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {services.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                supabaseUrl={env?.url}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="flex items-center justify-between px-6 py-8 text-sm text-muted-foreground sm:px-10">
        <p>Haven</p>
        <Link href="/login" className="hover:text-foreground">
          Staff
        </Link>
      </footer>
    </div>
  )
}

function ServiceRow({
  service,
  supabaseUrl,
}: {
  service: Service
  supabaseUrl: string | undefined
}) {
  const imageUrl = publicMediaUrl(service.imagePath, supabaseUrl)

  return (
    <li className="flex gap-5 py-5">
      {imageUrl ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-base font-medium tracking-tight">{service.title}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDuration(service.durationMinutes)} {formatPrice(service.price)}
          </p>
        </div>
        {service.description ? (
          <p className="mt-1 max-w-[48ch] text-sm leading-6 text-muted-foreground">
            {service.description}
          </p>
        ) : null}
      </div>
    </li>
  )
}
