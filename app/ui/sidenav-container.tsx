'use client';

import Styled from 'styled-components';

export default Styled.div`
height: 100%;
padding: 60px 30px;
background: darkslategrey;
box-sizing: border-box;

color: white;
position: relative;

a {
  display: block;
  margin-bottom: 5px;
}

button {
  position: absolute;
  bottom: 60px;
  width: calc(100% - 30px*2);
}
`;

