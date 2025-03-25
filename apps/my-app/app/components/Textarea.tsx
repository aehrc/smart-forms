// Textarea.tsx
export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500 ${className}`}
      {...props}
    />
  );
};
