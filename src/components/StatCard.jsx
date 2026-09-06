export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  positive = true,
}) {
  return (
    <div
      className="
        sf-card sf-card-hover sf-stat-card sf-card-animate
        group relative overflow-hidden
        p-5 sm:p-6
      "
    >
      {/* Decorative background */}
      <div
        className="
          pointer-events-none absolute
          -right-8 -top-8
          h-28 w-28
          rounded-full
          bg-[#8bd45b]/[0.07]
          transition-transform duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-10 -left-10
          h-24 w-24
          rounded-full
          bg-[#176b3a]/[0.025]
        "
      />

      <div className="relative flex items-start justify-between gap-4">
        {/* LEFT */}
        <div className="min-w-0">
          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[#7b877e]
            "
          >
            {title}
          </p>

          <h3
            className="
              mt-2
              truncate
              text-[27px]
              font-extrabold
              tracking-[-0.035em]
              text-[#172018]
              sm:text-[30px]
            "
          >
            {value}
          </h3>

          {subtitle && (
            <p
              className="
                mt-1.5
                truncate
                text-[11px]
                font-medium
                text-[#7b877e]
              "
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* ICON */}
        {Icon && (
          <div
            className="
              relative flex
              h-12 w-12
              shrink-0
              items-center justify-center
              rounded-[15px]
              bg-[#eaf6ed]
              text-[#176b3a]
              transition-all duration-300
              group-hover:scale-110
              group-hover:rotate-2
              group-hover:bg-[#176b3a]
              group-hover:text-white
              group-hover:shadow-[0_10px_24px_rgba(23,107,58,.20)]
            "
          >
            {/* Glow */}
            <span
              className="
                absolute inset-0
                rounded-[15px]
                bg-[#8bd45b]/20
                opacity-0
                blur-md
                transition-opacity duration-300
                group-hover:opacity-100
              "
            />

            <Icon
              size={21}
              strokeWidth={2.2}
              className="relative z-10"
            />
          </div>
        )}
      </div>

      {/* TREND */}
      {trend && (
        <div className="relative mt-5 flex items-center justify-between gap-3">
          <div
            className={`
              inline-flex items-center
              rounded-full
              px-2.5 py-1
              text-[10px]
              font-extrabold
              ${
                positive
                  ? "bg-[#eaf7ed] text-[#218044]"
                  : "bg-[#fff0ee] text-[#c33d35]"
              }
            `}
          >
            <span
              className={`
                mr-1.5
                h-1.5 w-1.5
                rounded-full
                ${
                  positive
                    ? "bg-[#39a65d]"
                    : "bg-[#e0524d]"
                }
              `}
            />

            {trend}
          </div>

          <span
            className="
              text-[10px]
              font-semibold
              text-[#a0aaa3]
            "
          >
            vs last period
          </span>
        </div>
      )}

      {/* Bottom accent */}
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