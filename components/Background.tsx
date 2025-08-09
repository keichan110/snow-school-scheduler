export default function Background() {
  return (
    <>
      {/* CSS custom properties for theme-aware colors */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --bg-base: #F6F9FC;
            --color-1: rgba(179, 229, 252, 0.4);     /* 澄んだ空の青 */
            --color-2: rgba(129, 212, 250, 0.5);     /* 氷河ブルー */
            --color-3: rgba(168, 230, 207, 0.35);    /* 樹氷グリーン */
            --color-4: rgba(251, 194, 235, 0.45);    /* 夕焼けピンク */
            --color-5: rgba(255, 209, 148, 0.4);     /* 薄オレンジ */
            --color-6: rgba(240, 248, 255, 0.3);     /* アクセント白 */
            --color-7: rgba(230, 245, 255, 0.35);    /* 薄青白 */
          }
          
          [data-theme="dark"], .dark {
            --bg-base: #0F2027;
            --color-1: rgba(32, 58, 67, 0.6);        /* 群青ブルー */
            --color-2: rgba(44, 83, 100, 0.7);       /* 冬の星空ネイビー */
            --color-3: rgba(102, 252, 241, 0.4);     /* オーロラミント */
            --color-4: rgba(203, 166, 247, 0.5);     /* 氷河パープル */
            --color-5: rgba(255, 154, 158, 0.45);    /* ウィンターピンク */
            --color-6: rgba(15, 32, 39, 0.8);        /* 深いベース */
            --color-7: rgba(25, 42, 49, 0.6);        /* ミッドトーン */
          }

        `
      }} />
      
    <div className="fixed inset-0 -z-10">
      {/* Base background - Light: 雪の白, Dark: 深い夜空 */}
      <div 
        className="absolute inset-0" 
        style={{
          backgroundColor: '#F6F9FC'
        }}
      />
      
      {/* Dark theme base - applied via CSS variable */}
      <div 
        className="absolute inset-0 dark:block hidden" 
        style={{
          backgroundColor: '#0F2027'
        }}
      />

      {/* Ultra-Premium Mesh Gradient System */}
      <div className="absolute inset-0">
        {/* Layer 1: color-1 - Largest dominant base */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(ellipse 140% 100% at 30% 25%, var(--color-1), transparent 80%)`,
            left: "-25%",
            top: "-15%",
            width: "90%",
            height: "85%",
            filter: "blur(140px)",
            transform: "rotate(-15deg)",
          }}
        />

        {/* Layer 1b: color-1 - Additional coverage */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(ellipse 120% 90% at 70% 60%, var(--color-1), transparent 75%)`,
            right: "-20%",
            bottom: "-10%",
            width: "80%",
            height: "75%",
            filter: "blur(130px)",
            transform: "rotate(20deg)",
          }}
        />

        {/* Layer 2: color-2 - Second largest */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(ellipse 110% 85% at 60% 40%, var(--color-2), transparent 78%)`,
            right: "-15%",
            top: "-5%",
            width: "75%",
            height: "70%",
            filter: "blur(125px)",
            transform: "rotate(25deg)",
          }}
        />

        {/* Layer 3: color-3 - Medium-large */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 40% 70%, var(--color-3), transparent 75%)`,
            left: "-10%",
            bottom: "-15%",
            width: "70%",
            height: "65%",
            filter: "blur(115px)",
            transform: "rotate(-20deg)",
          }}
        />

        {/* Layer 4: color-4 - Medium */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(ellipse 85% 70% at 80% 30%, var(--color-4), transparent 72%)`,
            left: "10%",
            top: "15%",
            width: "60%",
            height: "55%",
            filter: "blur(105px)",
            transform: "rotate(30deg)",
            mixBlendMode: "screen",
          }}
        />

        {/* Layer 5: color-5 - Medium-small */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(circle at 30% 80%, var(--color-5), transparent 68%)`,
            right: "20%",
            bottom: "5%",
            width: "50%",
            height: "45%",
            filter: "blur(95px)",
            transform: "rotate(-35deg)",
          }}
        />

        {/* Layer 6: color-6 - Small */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(circle at 70% 50%, var(--color-6), transparent 65%)`,
            left: "25%",
            top: "10%",
            width: "40%",
            height: "35%",
            filter: "blur(85px)",
            transform: "rotate(15deg)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* Layer 7: color-7 - Smallest accent */}
        <div
          className="absolute"
          style={{
            background: `radial-gradient(circle at center, var(--color-7), transparent 60%)`,
            right: "30%",
            top: "40%",
            width: "25%",
            height: "20%",
            filter: "blur(70px)",
            transform: "rotate(-10deg)",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Premium Texture System - Subtle & Sophisticated */}
      <div className="absolute inset-0">
        {/* Ultra-fine grain - Paper texture */}
        <div
          className="absolute inset-0 opacity-12 dark:opacity-8 mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cdefs%3E%3Cfilter id='ultraFineNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='8' result='turbulence' stitchTiles='stitch'/%3E%3CfeColorMatrix in='turbulence' type='saturate' values='0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23888888' filter='url(%23ultraFineNoise)' opacity='0.6'/%3E%3C/svg%3E")`,
            backgroundSize: "500px 250px",
            backgroundRepeat: "repeat",
          }}
        />
        
        {/* Medium organic texture */}
        <div
          className="absolute inset-0 opacity-8 dark:opacity-5 mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3Cfilter id='organicNoise'%3E%3CfeTurbulence type='turbulence' baseFrequency='1.5' numOctaves='4' result='turbulence' stitchTiles='stitch'/%3E%3CfeColorMatrix in='turbulence' type='saturate' values='0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23777777' filter='url(%23organicNoise)' opacity='0.7'/%3E%3C/svg%3E")`,
            backgroundSize: "400px 200px",
            backgroundRepeat: "repeat",
          }}
        />
      </div>

    </div>
    </>
  );
}
