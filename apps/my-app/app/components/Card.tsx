// Card.tsx
export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => {
  return <div className={`rounded-lg border bg-white shadow ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
