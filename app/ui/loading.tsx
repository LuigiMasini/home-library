import { type HTMLAttributes } from 'react';
import Styled, {keyframes} from 'styled-components'

export default function Loading (props: HTMLAttributes<HTMLDivElement>) {
  return (
    <Container {...props}>
      <div className="spinner"/>
    </Container>
  );
}


const spin = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
`;

const Container = Styled.div`
display: flex;
justify-content: center;

.spinner {
  width: 30px;
  height: 30px;

  border-radius: 50%;
  border-top: 2px solid grey;

  transform-origin: 50% 50%;
  animation: ${spin} 2s linear infinite;
}
`;
