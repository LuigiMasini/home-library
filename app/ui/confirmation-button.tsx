'use client';

import { useState } from 'react';
import Button from './button';

export default function ConfirmationButton({ onClick, children }) {
  const [isEnabled, setIsEnabled] = useState(false);

  const enable = () => {
    setIsEnabled(true);
    setTimeout(() => setIsEnabled(false), 3000);
  }

  return (
    <Button enabled={isEnabled} onClick={isEnabled ? onClick : enable}>
      { isEnabled ? 'Confirm' : children }
    </Button>
  );
}
