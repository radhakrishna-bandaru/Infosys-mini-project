export default function CropCard({
  emoji,
  name,
  quantity,
  price,
  status,
  statusType = "good",
}) {
  const statusStyles = {
    good: {
      badge: "bg-[#eaf7ed] text-[#218044]",
      dot: "bg-[#3ca761]",
    },
    warning: {
      badge: "bg-[#fff5df] text-[#9a6500]",
      dot: "bg-[#e2a52f]",
    },
    danger: {
      badge: "bg-[#fff0ee] text-[#c33d35]",
      dot: "bg-[#e0524d]",
    },
  };

  const currentStatus =
    statusStyles[statusType] || statusStyles.good;

  return (
    <div
      className="
        sf-card sf-card-hover sf-card-animate
        group relative overflow-hidden
        p-5
      "
    >
      {/* Background decoration */}

      <div
        className="
          pointer-events-none
          absolute -right-10 -top-10
          h-28 w-28
          rounded-full
          bg-[#8bd45b]/[0.07]
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      {/* TOP */}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Crop visual */}

          <div
            className="
              relative flex h-14 w-14
              shrink-0 items-center justify-center
              overflow-hidden
              rounded-[17px]
              border border-[#e3ebe2]
              bg-gradient-to-br
              from-[#f5faef]
              to-[#e8f4e8]
              text-[28px]
              shadow-sm
              transition-all duration-300
              group-hover:-translate-y-1
              group-hover:scale-105
            "
          >
            <span className="relative z-10">
              {emoji}
            </span>

            <span
              className="
                absolute -bottom-4 -right-4
                h-10 w-10
                rounded-full
                bg-[#8bd45b]/10
              "
            />
          </div>

          {/* Crop name */}

          <div className="min-w-0">
            <h3
              className="
                truncate
                text-[15px]
                font-extrabold
                tracking-[-0.015em]
                text-[#172018]
              "
            >
              {name}
            </h3>

            <p
              className="
                mt-1
                truncate
                text-[11px]
                font-medium
                text-[#7b877e]
              "
            >
              Available quantity:{" "}
              <span className="font-bold text-[#536158]">
                {quantity}
              </span>
            </p>
          </div>
        </div>

        {/* STATUS */}

        {status && (
          <span
            className={`
              inline-flex shrink-0
              items-center gap-1.5
              rounded-full
              px-2.5 py-1.5
              text-[9px]
              font-extrabold
              ${currentStatus.badge}
            `}
          >
            <span
              className={`
                h-1.5 w-1.5
                rounded-full
                ${currentStatus.dot}
              `}
            />

            {status}
          </span>
        )}
      </div>

      {/* PRICE */}

      <div
        className="
          relative mt-5
          border-t border-[#edf0ed]
          pt-4
        "
      >
        <div className="flex items-end justify-between gap-3">
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
              Current market price
            </p>

            <p
              className="
                mt-1
                text-[21px]
                font-extrabold
                tracking-[-0.025em]
                text-[#176b3a]
              "
            >
              {price}
            </p>
          </div>

          {/* Market indicator */}

          <div
            className="
              flex items-center gap-1.5
              rounded-full
              bg-[#f3f8f3]
              px-2.5 py-1.5
              text-[9px]
              font-bold
              text-[#5f7165]
              transition-all duration-300
              group-hover:bg-[#eaf6ed]
              group-hover:text-[#176b3a]
            "
          >
            <span
              className="
                flex h-4 w-4
                items-center justify-center
                rounded-full
                bg-[#dff1e2]
                text-[#218044]
              "
            >
              ↑
            </span>

            Market
          </div>
        </div>
      </div>

      {/* Hover accent */}

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