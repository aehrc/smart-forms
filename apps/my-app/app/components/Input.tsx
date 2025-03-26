// Input.tsx
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => {
  return (
    <input
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};
