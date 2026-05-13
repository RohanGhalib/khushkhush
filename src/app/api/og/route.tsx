import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    // Load the font from the public directory
    const fontData = await fetch(
      new URL('../../../../public/fonts/Twelny-BF661c3bbd2a8b3.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#C8FF00', // Acid Green
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 160,
              fontFamily: 'Twenly',
              color: '#111111', // Void Black
              textAlign: 'center',
              letterSpacing: '-0.02em',
              textTransform: 'lowercase',
            }}
          >
            khushkhush.
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Twenly',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
