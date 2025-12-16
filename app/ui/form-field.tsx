import Styled from 'styled-components';

// single field container inside forms,
// to contain label, input and description
export default Styled.div
.withConfig({
  shouldForwardProp: prop => ![
    'side'
  ].includes(prop),
})<{
  side?: boolean;
}>`

  margin: .6em 0;
  flex-grow: 1;
  flex-shrink: 1;

  &:has(input[type=number]) {
    flex: 1 2 70px;
  }

  input, textarea, select, .search_container, ul {
    width: 200px;
    color:white;
    background-color: unset;
    border: solid 1px grey;
    border-radius: .2em;
    display: inline-block;
    box-sizing: border-box;
  };

  input[type=number] {
    width: 100%;
    padding-right: 1px;
  }

  input, select {
    line-height: 1.5em;
    padding-inline: 4px;
    height: 22px;
  }

  textarea {
    resize: none;
    width: 100%;
    height: 100px;
    padding-inline: 4px;
  }

  label {
    vertical-align: top;
    display: block;
    margin-bottom: .5em;

    ${props => props.side && 'display: inline-block; width: 150px;'}
  }

  p {
    font-size: 12px;
    margin: .5em 0 0 0;
  }
`;
