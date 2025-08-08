export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* CSS変数を使用した統一背景 */}
      <div className="absolute inset-0 bg-background"></div>

      {/* Snow mountain inspired mesh gradient elements - 完全テーマ対応 */}
      <div className="absolute inset-0">
        {/* Soft pink accent - mountain glow */}
        <div
          className="absolute bg-pink-100/60 dark:bg-pink-900/40"
          style={{
            left: "20%",
            top: "15%",
            width: "40%",
            height: "50%",
            filter: "blur(120px)",
          }}
        />

        {/* Violet accent - aurora effect */}
        <div
          className="absolute bg-violet-100/50 dark:bg-violet-900/30"
          style={{
            left: "45%",
            top: "35%",
            width: "35%",
            height: "45%",
            filter: "blur(130px)",
          }}
        />

        {/* Cool blue - snow shadow */}
        <div
          className="absolute bg-blue-50/70 dark:bg-blue-950/50"
          style={{
            left: "10%",
            top: "60%",
            width: "50%",
            height: "40%",
            filter: "blur(140px)",
          }}
        />

        {/* Gentle cyan - ice reflection */}
        <div
          className="absolute bg-cyan-50/65 dark:bg-cyan-950/45"
          style={{
            left: "60%",
            top: "10%",
            width: "30%",
            height: "60%",
            filter: "blur(110px)",
          }}
        />
      </div>

      {/* Coarse noise texture overlay - テーマ対応 */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay dark:opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3Cfilter id='coarseNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='2' result='turbulence' stitchTiles='stitch'/%3E%3CfeColorMatrix in='turbulence' type='saturate' values='0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23888888' filter='url(%23coarseNoise)'/%3E%3C/svg%3E")`,
          backgroundSize: "400px 200px",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
