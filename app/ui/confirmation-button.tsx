'use client';

import { useState, type PropsWithChildren, type MouseEventHandler, type ButtonHTMLAttributes } from 'react';
import Button from './button';

export default function ConfirmationButton(
  { onClick, children, ...props }: PropsWithChildren<{ onClick: MouseEventHandler } & ButtonHTMLAttributes<HTMLButtonElement>>
) {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const enable = () => {
    setIsEnabled(true);
    setTimeout(() => setIsEnabled(false), 3000);
  }

  const confirmed: MouseEventHandler = e => {
    onClick(e);
    setIsEnabled(false);
  }

  return (
    <Button enabled={isEnabled} onClick={isEnabled ? confirmed : enable} {...props}>
      { isEnabled ? 'Confirm' : children }
    </Button>
  );
}
