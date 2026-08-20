export default function Skeleton({ className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}
