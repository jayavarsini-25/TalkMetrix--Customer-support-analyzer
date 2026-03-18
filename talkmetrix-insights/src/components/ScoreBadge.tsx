interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const ScoreBadge = ({ score, size = "md" }: ScoreBadgeProps) => {
  const cls = score >= 90 ? "score-high" : score >= 70 ? "score-mid" : "score-low";
  const sizeMap = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-md ${cls} ${sizeMap[size]}`}>
      {score}
    </span>
  );
};

export default ScoreBadge;
