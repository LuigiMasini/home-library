'use client';

import Styled from "styled-components";

export default Styled.button
.attrs(props => ({ type: props.type || 'button' }))
<{
  enabled?: boolean;
}>`
  ${props => props.enabled && 'color: orange;'}
`;
