const PHRASES = [
  "uy break na",
  "uminom ka ng tubig",
  "miss na kita",
  "ang galing mo",
  "balik ka agad ha",
  "wag kang puyat",
];

/**
 * The strip of running text Juice uses between sections. The list is rendered
 * twice and translated by exactly -50%, so the loop is seamless.
 */
export function Marquee() {
  const strip = [...PHRASES, ...PHRASES];

  return (
    <div className="overflow-hidden border-y-2 border-ink bg-green py-3">
      <div
        className="flex w-max gap-8 whitespace-nowrap"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {strip.map((phrase, index) => (
          <span
            key={`${phrase}-${index}`}
            className="font-display-wide flex items-center gap-8 text-2xl text-cream"
          >
            {phrase}
            <span aria-hidden className="text-orange">
              ✳
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
