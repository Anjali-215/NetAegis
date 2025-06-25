import React from 'react';
import './InputField.css';

export default function InputField({ label, type = 'text', name, value, onChange, required, error }) {
  return (
    <div className="input-field">
      <label>
        {label}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={error ? 'input-error' : ''}
        />
      </label>
      {error && <div className="input-error-msg">{error}</div>}
    </div>
  );
} 