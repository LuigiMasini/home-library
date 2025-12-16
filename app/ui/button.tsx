'use client';

import Styled from "styled-components";

export default Styled.button
.attrs(props => ({ type: props.type || 'button' }))
.withConfig({
    shouldForwardProp: (prop) =>
    ![
      'enabled',
    ].includes(prop),
})
<{
  enabled?: boolean;
}>`
  ${props => props.enabled && 'color: orange;'}
  height: 22px;
  line-height: 18px;
//   box-sizing: border-box;
  padding: 0 4px;
`;
