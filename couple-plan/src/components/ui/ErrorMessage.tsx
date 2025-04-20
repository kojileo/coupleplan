import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div role="alert" className="text-red-500 text-sm mt-2">
      {message}
    </div>
  );
};

export default ErrorMessage;
