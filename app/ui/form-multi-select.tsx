import { useState, useRef, useImperativeHandle, type Ref } from 'react';
import Styled from 'styled-components';
import Field from '@/app/ui/form-field';
import Tag from '@/app/ui/tag';

type Option =  {
  name: string
  value: any
};

export type MultiSelectInputRef = { reset: () => void };

// TODO accessibility: aria-label, tab, arrow keys, enter on li

export default function Selector({ options, addOption, name, label, ref }: {
  options: Option[];
  addOption: (name: string) => Promise<number>;
  name: string;
  label: string;
  ref?: Ref<MultiSelectInputRef>;
}) {
  const [query, setQuery] = useState<string>('');
  const [filtered, setFiltered] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option[]>([]);
  const TagsInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelected([]);
      setFiltered([]);
      setQuery('');
    },
  }), []);


  const onSelect = (s: Option[]) => {TagsInputRef.current.value = JSON.stringify(s.map(({value}) => value))};

  const addSelected = (option: Option) => {
    setSelected((s) => {
      if (s.includes(option)) return s;
      const n = s.concat(option);
      onSelect && onSelect(n);
      return n;
    });
  };

  const removeSelected = (option: Option) => {
    setSelected((s) => {
      if (!s.includes(option)) return s;
//       console.log(s, name, s.indexOf(option), s.toSpliced(s.indexOf(option), 1));
      const n = s.toSpliced(s.indexOf(option), 1);
      onSelect && onSelect(n);
      return n;
    });
  };

  const addNew = async () => {
    addOption(query)
    .then(value => addSelected({ name: query, value }))
    .catch();
  }

  const unselectedFiltered = filtered.filter((option) => !selected.includes(option));

  return (
    <Container onKeyDown={e => {if (e.key === "Enter") { e.preventDefault(); e.stopPropagation();}}}>
      <Field>
        <label htmlFor={name} className='side'>{label}</label>
        <input
          type="hidden"
          name={name}
          id={name}
          ref={TagsInputRef}
          onChange={e => !e.target.value && setSelected([])}
        />
        <div className='search_container'>
          <div className='search'>
            <input
              type='text'
              placeholder='Search tags'
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.length)
                  setFiltered(
                    options.filter(({name}) => name.includes(e.target.value))
                  );
                else setFiltered([]);
              }}
            />
            <button
              title='add a new tag'
              type='button'
              style={{ width: '2em' }}
              onClick={addNew}
              onKeyDown={e => {if (e.key === "Enter" && query.length && !filtered.length) addNew()}}
            >
              +
            </button>
            {unselectedFiltered.length ?
              <ul>
                {unselectedFiltered
                  .map((option) => (
                    <li
                      key={option.value}
                      onClick={() => addSelected(option)}
                    >{option.name}</li>
                  ))}
              </ul>
              : <></>
            }
          </div>
        </div>
      </Field>

      <div className='tags_container'>
        {selected.map((option) => (
          <Tag key={option.value}>
            {option.name}
            <span
              style={{ color: 'white', paddingLeft: 5, cursor: 'pointer' }}
              onClick={() => removeSelected(option)}
            >
              x
            </span>
          </Tag>
        ))}
      </div>
    </Container>
  );
}

const Container = Styled.div`
width: 100%;

.search {
  position: relative;
  display: flex;
  width: 100%;
}

.search_container:has(input:focus) {
  outline: 1px auto;
}

.search_container input {
  border: none;
  outline: none;
}

ul {
  display: none;
  position: absolute;
  top: 22px;
  width: 100%;
  margin: 0;
  padding: 1px;
  box-sizing: border-box;
  background-color: var(--background);
  list-style-type: none;
}

&:has( *:focus, *:active ) ul {
  display: block;
}

ul li {
  width: 100%;
  padding: 2px 10px;
  border-width: 2px;
  border-radius: 0.2em;
  border-style: solid;
  border-color: transparent;
  box-sizing: border-box;
  cursor: pointer;
}

ul li:hover {
  border-color: dodgerblue;
}

.tags_container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
`;
