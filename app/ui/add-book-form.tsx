'use client';

import {
  useActionState,
  useState,
  useRef,
  startTransition,
} from 'react';
import Styled from 'styled-components';

import Button from './button';
import Field from './form-field';
import ImageInput, { type ImageInputRef } from './form-image-input';
import MultiSelect, { type MultiSelectInputRef } from './form-multi-select';

import { createUpdateBook, insertTag } from '@/app/lib/actions';

import type { Collection, Tag, Book, ActionState } from '@/app/lib/types';
import { shortTextLength, longTextLength, year_min, year_max } from '@/app/lib/constants';


export default function AddBookForm({ tags, collections, book }: {
  tags: Tag[];
  collections: Collection[];
  book?: Book;
}) {

  //TODO disable if no collection yet
  //TODO set a default collection from query params
  //TODO add isbn lookup & fill fields
  //TODO add ocr to fill fields

  const CoverInputRef = useRef<ImageInputRef>(null);

  const [tagsCopy, setTags] = useState<Tag[]>(tags);
  const tagsInputRef = useRef<MultiSelectInputRef>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const [actionState, formAction, isPending] = useActionState<Omit<ActionState, 'payload'>, FormData>(
    async function (state, formData) {
      const res = await createUpdateBook(formData);

      if (res.ok) {
        // successful submission, reset the form
        formRef.current?.reset();
        // reset states of stateful components
        CoverInputRef.current?.reset();
        tagsInputRef.current?.reset();
      }

      return res;
    },
    {
      ok: true,
      message: '',
    },
  );


  const addTag = async (name: string) => {
    if (!name || tags.map(({name}) => name).includes(name))
      throw new Error();
    const id = await insertTag({name});
    setTags(t => t.concat({name, id}));
    return id;
  }


  return (
    <Form
      action={formAction}
      onSubmit={e => {
        // prevent form reset
        // https://github.com/facebook/react/issues/29034#issuecomment-2873390387
        e.preventDefault()
        startTransition(() => {
          formAction(new FormData(e.currentTarget))
        })
      }}
      ref={formRef}
    >
      <input type='hidden' name='id' value={book?.id}/>

      <div className='block'>

        <ImageInput defaultValue={book?.cover} ref={CoverInputRef}/>

        <div>
          <Field side>
            <label htmlFor='collection_id'>Collection</label>
            <select
              id='collection_id'
              name='collection_id'
              required
              defaultValue={book?.collection_id}
            >
              {collections.map(({ name, id }) =>
                <option value={id} key={id}>{name}</option>
              )}
            </select>
          </Field>

          <Field side>
            <label htmlFor='isbn'>ISBN</label>
            <input
              type='text'
              id='isbn'
              name='isbn'
              placeholder='ISBN-10 or ISBN-13'
              defaultValue={book?.isbn}
            />
          </Field>

          <Field side>
            <label htmlFor='title'>Title</label>
            <input
              type='text'
              id='title'
              name='title'
              maxLength={shortTextLength}
              defaultValue={book?.title}
            />
          </Field>

          <Field side>
            <label htmlFor='authors'>Authors</label>
            <input
              type='text'
              id='authors'
              name='authors'
              maxLength={longTextLength}
              placeholder='Comma separated authors'
              defaultValue={book?.authors}
            />
          </Field>

          <Field side>
            <label htmlFor='publisher'>Publisher</label>
            <input
              type='text'
              id='publisher'
              name='publisher'
              maxLength={shortTextLength}
              defaultValue={book?.publisher}
            />
          </Field>

          <fieldset>
            <div className='legendContainer'>
              <legend>Date of publication:</legend>
            </div>

            <div className='dateInputContainer'>
              <Field>
                <label htmlFor='year'>Year</label>
                <input
                  type='number'
                  id='year'
                  name='publish_year'
                  min={year_min}
                  max={year_max}
                  defaultValue={book?.publish_year}
                />
              </Field>

              <Field>
                <label htmlFor='month'>Month</label>
                <input
                  type='number'
                  id='month'
                  name='publish_month'
                  min={1}
                  max={12}
                  defaultValue={book?.publish_month}
                />
              </Field>

              <Field>
                <label htmlFor='day'>Day</label>
                <input
                  type='number'
                  id='day'
                  name='publish_day'
                  min={1}
                  max={31}
                  defaultValue={book?.publish_day}
                />
              </Field>
            </div>
          </fieldset>

          <MultiSelect
            name='tags_ids'
            label='Tags'
            options={tagsCopy.map(({name, id, color}) => ({name, value: id, color}))}
            addOption={addTag}
            ref={tagsInputRef}
            defaultValue={book?.tags_ids}
          />
        </div>
      </div>

      <div className='block horizontal'>
        <Field>
          <label htmlFor='group'>Group</label>
          <input
            type='text'
            id='group_name'
            name='group_name'
            maxLength={shortTextLength}
            defaultValue={book?.group_name}
          />
        </Field>

        <Field>
          <label htmlFor='language'>Language</label>
          <input
            type='text'
            id='language'
            name='language'
            maxLength={shortTextLength}
            defaultValue={book?.language}
          />
        </Field>

        <Field>
          <label htmlFor='pages'>Pages</label>
          <input
            type='number'
            id='pages'
            name='pages'
            min={0}
            defaultValue={book?.pages}
          />
        </Field>
      </div>

      <div className='block horizontal'>
        <Field>
          <label htmlFor='Description'>Description</label>
          <textarea
            id='description'
            name='description'
            maxLength={longTextLength}
            defaultValue={book?.description}
          />
        </Field>

        <Field>
          <label htmlFor='notes'>Notes</label>
          <textarea
            id='notes'
            name='notes'
            maxLength={longTextLength}
            defaultValue={book?.notes}
          />
        </Field>
      </div>

      <div>
        <Button aria-disabled={isPending} type='submit' title='Save book'>
          {book?.id ? 'Update' : 'Insert'}
        </Button>

        <div aria-live='polite' aria-atomic='true'>
          {actionState?.message && <p style={{ whiteSpace: 'pre' }}>{actionState?.message}</p>}
        </div>
      </div>
    </Form>
  );
}


const Form = Styled.form`
width: 560px;
display: flex;
flex-direction: column;

fieldset {
  all: unset;
  display: flex;
  margin-bottom: 1em;

  .legendContainer {
    width: 150px;
    display: flex;
    align-items: end;
  }

  .dateInputContainer {
    display: flex;
    width: 200px;

    div {
      margin: 0;
    }
  }
}

.block {
  display: flex;
  gap: 30px;
}

.horizontal {
  div {
    flex-grow: 1;

    input {
      width: 100%;
    }
  }
}
`;
