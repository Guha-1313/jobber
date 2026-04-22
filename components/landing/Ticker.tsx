'use client'

const companies = [
  'Google',
  'Stripe',
  'Figma',
  'Notion',
  'OpenAI',
  'Airbnb',
  'Apple',
  'Uber',
  'Meta',
  'Netflix',
  'Shopify',
  'Spotify',
  'Linear',
  'Vercel',
  'GitHub',
]

export function Ticker() {
  /* Double the list for a seamless infinite loop */
  const items = [...companies, ...companies]

  return (
    <div className="overflow-hidden">
      <div className="ticker-track flex items-center gap-10 whitespace-nowrap">
        {items.map((company, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 text-sm font-medium text-white/20 tracking-wide select-none"
          >
            {company}
            <span className="w-1 h-1 rounded-full bg-white/[0.12]" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  )
}
