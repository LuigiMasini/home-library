'use client';

import { useState, type PropsWithChildren, type MouseEventHandler } from 'react';
import Button from './button';

export default function ConfirmationButton(
  { onClick, children }: PropsWithChildren<{ onClick: MouseEventHandler }>
) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

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
