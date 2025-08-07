export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base slate-50 background */}
      <div className="absolute inset-0 bg-slate-50"></div>

      {/* Snow mountain inspired mesh gradient elements */}
      <div className="absolute inset-0">
        {/* Soft pink accent - mountain glow */}
        <div
          className="absolute bg-pink-100 opacity-60"
          style={{
            left: "20%",
            top: "15%",
            width: "40%",
            height: "50%",
            filter: "blur(120px)",
          }}
        ></div>

        {/* Violet accent - aurora effect */}
        <div
          className="absolute bg-violet-100 opacity-50"
          style={{
            left: "45%",
            top: "35%",
            width: "35%",
            height: "45%",
            filter: "blur(130px)",
          }}
        ></div>

        {/* Cool blue - snow shadow */}
        <div
          className="absolute bg-blue-50 opacity-70"
          style={{
            left: "10%",
            top: "60%",
            width: "50%",
            height: "40%",
            filter: "blur(140px)",
          }}
        ></div>

        {/* Gentle cyan - ice reflection */}
        <div
          className="absolute bg-cyan-50 opacity-65"
          style={{
            left: "60%",
            top: "10%",
            width: "30%",
            height: "60%",
            filter: "blur(110px)",
          }}
        ></div>
      </div>

      {/* Coarse noise texture overlay */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cdefs%3E%3Cfilter id='coarseNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='2' result='turbulence' stitchTiles='stitch'/%3E%3CfeColorMatrix in='turbulence' type='saturate' values='0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23888888' filter='url(%23coarseNoise)'/%3E%3C/svg%3E")`,
          backgroundSize: "400px 200px",
          backgroundRepeat: "repeat",
        }}
      ></div>
    </div>
  );
}
