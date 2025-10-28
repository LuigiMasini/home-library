import Styled from 'styled-components';

// single field container inside forms,
// to contain label, input and description
export default Styled.div`

  margin: .5em 0;
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
  }


  textarea {
    resize: none;
    width: 100%;
    height: 100px;
  }

  label, label span {
    vertical-align: top;
    display: block;
    margin-bottom: .5em;
  }

  label.side {
    display: inline-block;
    width: 150px;
  }

  p {
    font-size: 12px;
    margin: .5em 0 0 0;
  }
`;
