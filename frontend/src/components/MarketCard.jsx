export default function MarketCard({
  market,
  crop,
  price,
  change,
  location,
  distance,
  verified = false,
}) {
  const isPositive = Number(change) >= 0;

  return (
    <div
      className="
        sf-card sf-card-hover sf-card-animate
        group relative overflow-hidden
        p-5
      "
    >
      {/* Decorative glow */}
      <div
        className="
          pointer-events-none absolute
          -right-10 -top-10
          h-28 w-28
          rounded-full
          bg-[#8bd45b]/[0.08]
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      {/* HEADER */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="
                truncate
                text-[15px]
                font-extrabold
                text-[#172018]
              "
            >
              {market}
            </h3>

            {verified && (
              <span
                className="
                  shrink-0 rounded-full
                  bg-[#eaf7ed]
                  px-2 py-1
                  text-[9px]
                  font-extrabold
                  text-[#218044]
                "
              >
                ✓ Verified
              </span>
            )}
          </div>

          {location && (
            <p className="mt-1 text-[11px] font-medium text-[#7b877e]">
              {location}
            </p>
          )}
        </div>

        {distance && (
          <span
            className="
              shrink-0 rounded-full
              bg-[#f3f7f3]
              px-2.5 py-1.5
              text-[9px]
              font-bold
              text-[#657169]
            "
          >
            {distance}
          </span>
        )}
      </div>

      {/* CROP */}
      <div
        className="
          relative mt-5
          rounded-[17px]
          border border-[#e8eee7]
          bg-gradient-to-br
          from-[#f7faf5]
          to-[#eef7ef]
          p-4
          transition-all duration-300
          group-hover:border-[#d5e7d7]
        "
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className="
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.1em]
                text-[#8a958d]
              "
            >
              Crop
            </p>

            <p
              className="
                mt-1
                text-[15px]
                font-extrabold
                text-[#26372c]
              "
            >
              {crop}
            </p>
          </div>

          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-[13px]
              bg-white
              text-xl
              shadow-sm
              transition duration-300
              group-hover:scale-110
              group-hover:-rotate-2
            "
          >
            🌾
          </div>
        </div>
      </div>

      {/* PRICE */}
      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div>
          <p
            className="
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.1em]
              text-[#8a958d]
            "
          >
            Market Price
          </p>

          <p
            className="
              mt-1
              text-[24px]
              font-extrabold
              tracking-[-0.03em]
              text-[#176b3a]
            "
          >
            {price}
          </p>

          <p className="mt-0.5 text-[10px] text-[#8a958d]">
            per quintal
          </p>
        </div>

        {change !== undefined && change !== null && (
          <div
            className={`
              inline-flex items-center gap-1.5
              rounded-full
              px-2.5 py-1.5
              text-[10px]
              font-extrabold
              ${
                isPositive
                  ? "bg-[#eaf7ed] text-[#218044]"
                  : "bg-[#fff0ee] text-[#c33d35]"
              }
            `}
          >
            <span>{isPositive ? "↑" : "↓"}</span>
            {Math.abs(Number(change))}%
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        className="
          relative mt-5
          flex items-center
          justify-between
          border-t border-[#edf1ed]
          pt-4
        "
      >
        <span
          className="
            flex items-center gap-1.5
            text-[10px]
            font-semibold
            text-[#7b877e]
          "
        >
          <span className="sf-live-dot !h-[6px] !w-[6px]" />
          Updated today
        </span>

        <span
          className="
            text-[10px]
            font-extrabold
            text-[#176b3a]
            transition-transform duration-300
            group-hover:translate-x-1
          "
        >
          View details →
        </span>
      </div>

      {/* Bottom animation */}
      <div
        className="
          absolute bottom-0 left-5 right-5
          h-[2px]
          origin-left
          scale-x-0
          rounded-full
          bg-gradient-to-r
          from-[#176b3a]
          to-[#8bd45b]
          transition-transform duration-500
          group-hover:scale-x-100
        "
      />
    </div>
  );
}