import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', href, type = 'button', ...props }) {
  const className = `btn btn-${variant}`;
  if (href) {
    return (
      <a className={className} href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} type={type} {...props}>
      {children}
    </button>
  );
} 