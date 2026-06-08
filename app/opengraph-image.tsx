import { ImageResponse } from 'next/og';

// Dynamically generated 1200x630 social-share image. Next.js wires this into
// the page's Open Graph metadata automatically (Twitter falls back to og:image).
export const alt = 'World Cup 2026 Bracket Predictor';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #0a1d1a 0%, #06100f 100%)',
          color: '#ecf6f2',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#27e0c8',
              fontWeight: 700,
            }}
          >
            FIFA World Cup 2026
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 24, fontSize: 92, fontWeight: 800, lineHeight: 1.02 }}>
            <span style={{ color: '#f6c945' }}>Bracket</span>
            <span style={{ color: '#ff2d72' }}>Predictor</span>
          </div>
          <div style={{ fontSize: 34, color: '#9fb8b1', maxWidth: 900, lineHeight: 1.3 }}>
            Rank all 12 groups, pick the 8 best third-placed teams, and play out the knockout stage
            to the Final.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26 }}>
          <div
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              border: '1px solid rgba(246,201,69,0.5)',
              color: '#f6c945',
              fontWeight: 700,
            }}
          >
            R32 → Final
          </div>
          <div style={{ color: '#7e9a93' }}>FIFA official Annex C seeding</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
