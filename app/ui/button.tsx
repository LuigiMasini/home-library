'use client';

import Styled from "styled-components";

export default Styled.button<{
  enabled?: boolean;
}>`
  ${props => props.enabled && 'color: orange;'}
`;
