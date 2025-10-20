'use client';

import Styled from 'styled-components';
import Link from 'next/link';


export default Styled(Link).withConfig({
  shouldForwardProp: (prop) =>
    ![
      'currentPathname',
      'sub',
    ].includes(prop),
})<{
  currentPathname?: string;
  sub?: boolean;
}>`
  &:hover, &:active {
    text-decoration: underline;
  }

  ${props => props.href === props.currentPathname && 'font-weight: bold;'}

  ${props => props.sub && 'margin-left: 1em;'}

`
