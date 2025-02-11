import type React from "react";

interface AnimatedHourglassProps {
  remainingTime: number;
  totalTime: number;
}

const AnimatedHourglass: React.FC<AnimatedHourglassProps> = ({
  remainingTime,
  totalTime,
}) => {
  const percentage = (remainingTime / totalTime) * 100;

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle with a playful yellow glow */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#fef08a"
          strokeWidth="8"
          className="opacity-30"
        />
        {/* Gradient definition for the progress circle */}
        <defs>
          <linearGradient id="hourglassGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
        {/* Progress circle with animated stroke */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#hourglassGradient)"
          strokeWidth="8"
          strokeDasharray={`${percentage * 2.827} 282.7`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000 ease-in-out"
        />
        {/* Playful falling sand grains with staggered animation delays */}
        <g>
          <circle
            cx="50"
            cy="20"
            r="2"
            fill="#f87171"
            className="sand"
            style={{ animationDelay: "0s" }}
          />
          <circle
            cx="55"
            cy="25"
            r="1.5"
            fill="#f87171"
            className="sand"
            style={{ animationDelay: "0.5s" }}
          />
          <circle
            cx="45"
            cy="27"
            r="1.2"
            fill="#f87171"
            className="sand"
            style={{ animationDelay: "1s" }}
          />
        </g>
        {/* Centered, bouncy time text to capture attention */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          className="text-2xl font-extrabold text-purple-600 drop-shadow-lg animate-bounce"
        >
          {remainingTime}
        </text>
      </svg>
      <style jsx>{`
        .sand {
          animation: sand-fall 2s infinite;
        }
        @keyframes sand-fall {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(20px) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(40px) scale(0.6);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedHourglass;
