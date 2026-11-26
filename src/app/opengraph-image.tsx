import { ImageResponse } from 'next/og';

export const alt = 'XTTECH ERP - Platform for Aluminum, Glass & Construction';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#045863',
          backgroundImage: 'linear-gradient(135deg, #045863 0%, #033d45 60%, #02272c 100%)',
          padding: '64px 72px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: '#d6ff3d',
                color: '#045863',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 800,
              }}
            >
              XT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '1px' }}>
                XTTECH ERP
              </span>
              <span style={{ fontSize: '16px', color: '#99f6e4' }}>
                xttech.vn • Cloud Enterprise Platform
              </span>
            </div>
          </div>
          <div
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(214, 255, 61, 0.15)',
              border: '1px solid rgba(214, 255, 61, 0.45)',
              color: '#d6ff3d',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            CAD 2D/3D • BOM • QR • GPS
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '980px' }}>
          <div
            style={{
              fontSize: '58px',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#ffffff',
            }}
          >
            XMS Fab • XMS Build • XMS Biz
          </div>
          <div
            style={{
              fontSize: '26px',
              lineHeight: 1.4,
              color: '#e2e8f0',
            }}
          >
            All-in-One ERP for Aluminum &amp; Glass Manufacturing, Construction &amp; Enterprise Operations
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            paddingTop: '24px',
            fontSize: '20px',
            color: '#cbd5e1',
          }}
        >
          <span>2D/3D Door Studio &amp; Auto BOM</span>
          <span>•</span>
          <span>Smart Quotation &amp; E-Sign</span>
          <span>•</span>
          <span>GPS Attendance &amp; QR Warranty</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
