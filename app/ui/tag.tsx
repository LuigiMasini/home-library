'use client';

import { type PropsWithChildren } from 'react';
import Styled from 'styled-components';
import { type Tag } from '@/app/lib/types';

export default ({
  tag,
  children,
  ...props
}: PropsWithChildren<{ tag: Partial<Tag> }>) =>
  <TagContainer color={tag.color} {...props}>{tag.name} {children}</TagContainer>

const TagContainer = Styled.span
.withConfig({
  shouldForwardProp: (prop) =>
    ![
      'color',
    ].includes(prop),
})<{
  color?: string;
}>`
display: inline-block;
border-radius: 15px;
background-color: ${props => '#'+(props.color || 'DF6C5E')};
padding: 2px 8px;
margin: 5px;
word-break: break-word;
`;
