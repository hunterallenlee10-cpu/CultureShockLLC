import { ImageResponse } from 'next/og';
import path from 'node:path';
import sharp from 'sharp';

export const alt = 'Culture Shock — Film, Content & Media Production, DMV';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const asDataUrl = async (file: string) => {
  const png = await sharp(path.join(process.cwd(), 'public', file))
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
};

/** Wordmark on black with their gold brush slashes and halftone. */
export default async function OG() {
  const [logo, tl, br] = await Promise.all([
    asDataUrl('media/brand/logo.svg'),
    asDataUrl('media/brand/brush-tl.webp'),
    asDataUrl('media/brand/brush-br.webp'),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#050505',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img alt="" src={tl} width={330} height={405} style={{ position: 'absolute', left: 0, top: 0 }} />
      <img alt="" src={br} width={360} height={378} style={{ position: 'absolute', right: 0, bottom: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img alt="Culture Shock" src={logo} width={760} height={347} />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 34, color: '#F5B300', fontSize: 26, letterSpacing: 8 }}>
          <div style={{ width: 120, height: 2, background: '#F5B300', marginRight: 22 }} />
          FILM • CONTENT • CULTURE — DMV
          <div style={{ width: 120, height: 2, background: '#F5B300', marginLeft: 22 }} />
        </div>
      </div>
    </div>,
    size,
  );
}
