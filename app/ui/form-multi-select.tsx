import { useState, useRef, useImperativeHandle, type Ref } from 'react';
import Styled from 'styled-components';
import Field from './form-field';
import Tag from './tag';
import Button from './button';

type Option =  {
  name: string;
  value: any;
  color?: string;
};

export type MultiSelectInputRef = { reset: () => void };

// TODO accessibility: aria-label, tab, arrow keys, enter on li
// TODO change color

export default function Selector({ options, addOption, name, label, ref, defaultValue }: {
  options: Option[];
  addOption: (name: string) => Promise<number>;
  name: string;
  label: string;
  ref?: Ref<MultiSelectInputRef>;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState<string>('');
  const [filtered, setFiltered] = useState<Option[]>([]);
  const [selected, setSelected] = useState<Option[]>(() => {
    if (!defaultValue) return [];
    try {
      return JSON.parse(defaultValue)
        .map((id: number) =>
          ({
            name: options.filter(({value}) => id === value)[0].name,
            value: id
          })
        );
    }
    catch {
      console.error('can\'t parse old tags, ignoring');
      return [];
    }
  });
  const TagsInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelected([]);
      setFiltered([]);
      setQuery('');
    },
  }), []);

  const onSelect = (s: Option[]) => {
    if (!TagsInputRef.current) return;

    TagsInputRef.current.value = JSON.stringify(s.map(({value}) => value))
  };

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
      <Field side>
        <label htmlFor={name}>{label}</label>
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
            <Button
              title='add a new tag'
              style={{ width: '2em' }}
              onClick={addNew}
              onKeyDown={e => {if (e.key === "Enter" && query.length && !filtered.length) addNew()}}
            >
              +
            </Button>
            {unselectedFiltered.length ?
              <ul>
                {unselectedFiltered
                  .map((option) => (
                    <li
                      key={option.value}
                      onClick={() => addSelected(option)}
                    >
                      <Tag tag={option}/>
                    </li>
                  ))}
              </ul>
              : <></>
            }
          </div>
        </div>
      </Field>

      <div className='tags_container'>
        {selected.map((option) => (
          <Tag key={option.value} tag={option}>
            <span
              style={{ paddingLeft: 3 }}
              onClick={() => removeSelected(option)}
            >
              🗙
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
  margin-top: -1px;
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

.search:has( *:focus, *:active ) ul {
  display: block;
}

ul li {
  width: 100%;
//   padding: 2px 10px;
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
}
`;
