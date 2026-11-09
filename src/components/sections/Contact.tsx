'use client';
import { useActionState } from 'react';
import { contact, site } from '@/content/site';
import { sendInquiry, type InquiryState } from '@/app/actions';
import { Bolt } from '../brand/Bolt';
import { Magnetic } from '../chrome/Magnetic';

const field =
  'w-full rounded-none border-0 border-b-2 border-black/25 bg-transparent px-0 py-3 text-[17px] text-black placeholder:text-black/40 focus:border-black focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#9b1c1c]';
const label = 'mono mb-1 block text-[11px] font-medium tracking-[0.1em] text-black/70';

export function Contact() {
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, { status: 'idle' });
  const err = (k: string) => state.errors?.[k];

  return (
    <section
      id="ch-contact"
      data-channel="6"
      data-channel-start="6"
      data-segment="INQUIRY"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden bg-gold px-[var(--gutter)] py-[clamp(110px,13vw,180px)] text-black"
    >
      {/* black brush + halftone on gold, inverted from their card */}
      <div aria-hidden className="brush-tl left-0 top-0 h-[42%] w-[24%] opacity-25 [filter:brightness(0)]" />
      <div aria-hidden className="brush-br bottom-0 right-0 h-[45%] w-[26%] opacity-80 [filter:brightness(0)]" />
      <div className="relative mx-auto grid max-w-[1400px] gap-[clamp(40px,6vw,100px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          <p className="mono mb-5 text-[12px] font-medium">CH 06 · START A PROJECT</p>
          <h2 id="contact-title" className="display distress text-[clamp(64px,8.4vw,150px)]">
            <span className="block">{contact.title[0]}</span>
            <span className="block text-paper [-webkit-text-stroke:3px_#050505] [paint-order:stroke_fill]">{contact.title[1]}</span>
            <span className="block">{contact.title[2]}</span>
          </h2>
          <Bolt className="mt-6 h-12 w-8" />
          <p className="mt-6 max-w-[34ch] text-[clamp(18px,1.7vw,23px)] font-medium leading-snug">{contact.body}</p>
          <a
            href={site.inquiryForm}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-black px-6 py-3.5 font-[family-name:var(--font-display)] text-[16px] font-extrabold italic tracking-[0.06em] transition-colors hover:bg-black hover:text-gold"
          >
            {contact.secondary}
          </a>
        </div>

        <form
          action={action}
          noValidate
          className="relative rounded-[6px] bg-gold-hot/40 p-[clamp(20px,3vw,40px)] shadow-[0_30px_80px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
        >
          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
            <div>
              <label htmlFor="f-name" className={label}>
                NAME *
              </label>
              <input
                id="f-name"
                name="name"
                autoComplete="name"
                required
                aria-invalid={!!err('name')}
                aria-describedby={err('name') ? 'e-name' : undefined}
                className={field}
              />
              {err('name') && (
                <p id="e-name" className="mt-1 text-[13px] text-[#7a1010]">
                  {err('name')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="f-email" className={label}>
                EMAIL *
              </label>
              <input
                id="f-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={!!err('email')}
                aria-describedby={err('email') ? 'e-email' : undefined}
                className={field}
              />
              {err('email') && (
                <p id="e-email" className="mt-1 text-[13px] text-[#7a1010]">
                  {err('email')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="f-phone" className={label}>
                PHONE
              </label>
              <input id="f-phone" name="phone" type="tel" autoComplete="tel" className={field} />
            </div>
            <div>
              <label htmlFor="f-type" className={label}>
                PROJECT TYPE
              </label>
              <select id="f-type" name="type" defaultValue="" aria-invalid={!!err('type')} className={`${field} cursor-pointer`}>
                <option value="" disabled>
                  Choose one…
                </option>
                {contact.projectTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-budget" className={label}>
                BUDGET RANGE
              </label>
              <select id="f-budget" name="budget" defaultValue="" className={`${field} cursor-pointer`}>
                <option value="" disabled>
                  Choose a range…
                </option>
                {contact.budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-date" className={label}>
                SHOOT DATE
              </label>
              <input id="f-date" name="date" type="date" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="f-location" className={label}>
                LOCATION
              </label>
              <input id="f-location" name="location" placeholder="DMV, or wherever the story is" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="f-message" className={label}>
                THE STORY *
              </label>
              <textarea
                id="f-message"
                name="message"
                rows={4}
                required
                aria-invalid={!!err('message')}
                aria-describedby={err('message') ? 'e-message' : undefined}
                placeholder="What are we making?"
                className={`${field} resize-y`}
              />
              {err('message') && (
                <p id="e-message" className="mt-1 text-[13px] text-[#7a1010]">
                  {err('message')}
                </p>
              )}
            </div>
            <div aria-hidden className="absolute left-[-9999px]">
              <label htmlFor="f-hp">Company site</label>
              <input id="f-hp" name="company_site" tabIndex={-1} autoComplete="off" />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Magnetic>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 font-[family-name:var(--font-display)] text-[18px] font-extrabold italic tracking-[0.08em] text-gold transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                {pending ? 'TRANSMITTING…' : 'SEND IT'} <span aria-hidden>⚡</span>
              </button>
            </Magnetic>
            <p role="status" aria-live="polite" className="max-w-[40ch] text-[14px] font-medium">
              {state.message}
              {state.status === 'unconfigured' && (
                <>
                  {' '}
                  <a className="underline" href={site.inquiryForm} target="_blank" rel="noopener noreferrer">
                    Open the inquiry form ↗
                  </a>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
      <p className="display relative mt-[clamp(70px,9vw,120px)] text-center text-[clamp(30px,4.6vw,72px)]">
        FROM CONCEPT TO <span className="text-paper [-webkit-text-stroke:2px_#050505] [paint-order:stroke_fill]">FINAL CUT.</span>
      </p>
    </section>
  );
}
