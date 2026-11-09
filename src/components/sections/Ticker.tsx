import { services } from '@/content/services';
import { Marquee } from '../chrome/Marquee';

export function Ticker() {
  return (
    <div data-channel="1" data-segment="SERVICES" className="relative z-10 -mt-px overflow-hidden">
      <div className="-mx-4 -rotate-[1.4deg] bg-gold py-3 text-black shadow-[0_18px_60px_rgba(245,179,0,.18)] md:py-4">
        <Marquee speed={70} label={`Services: ${services.join(', ')}`}>
          {services.map((s) => (
            <span
              key={s}
              className="display flex items-center whitespace-nowrap text-[clamp(28px,4.2vw,64px)]"
              style={{ transform: 'skewX(var(--skew, 0deg))' }}
            >
              <span className="px-[0.45em]">{s}</span>
              <span aria-hidden className="text-[0.8em]">
                ⚡
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
