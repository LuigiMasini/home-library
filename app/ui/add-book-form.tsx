'use client';

import {
  useActionState,
  useState,
  useRef,
  startTransition,
} from 'react';

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
  //TODO use styled-components

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
    <form
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
      style={{ display: 'flex', flexDirection: 'column', width: '560px' }}
    >
      <input type='hidden' name='id' value={book?.id}/>

      <div style={{ display: 'flex', gap: '30px' }}>

        <ImageInput
          defaultValue={book?.cover}
          ref={CoverInputRef}
        />

        <div>
          <Field>
            <label htmlFor="collection_id" className='side'>Collection</label>
            <select
              id="collection_id"
              name="collection_id"
              required
              defaultValue={book?.collection_id}
            >
              {collections.map(({ name, id }) =>
                <option value={id} key={id}>{name}</option>
              )}
            </select>
          </Field>

          <Field>
            <label htmlFor="isbn" className='side'>ISBN</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              placeholder='ISBN-10 or ISBN-13'
              defaultValue={book?.isbn}
            />
          </Field>

          <Field>
            <label htmlFor="title" className='side'>Title</label>
            <input
              type="text"
              id="title"
              name="title"
              maxLength={shortTextLength}
              defaultValue={book?.title}
            />
          </Field>

          <Field>
            <label htmlFor="authors" className='side'>Authors</label>
            <input
              type="text"
              id="authors"
              name="authors"
              maxLength={longTextLength}
              placeholder='Comma separated authors'
              defaultValue={book?.authors}
            />
          </Field>

          <Field>
            <label htmlFor="publisher" className='side'>Publisher</label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              maxLength={shortTextLength}
              defaultValue={book?.publisher}
            />
          </Field>

          <fieldset style={{ all: 'unset',display: 'flex', marginBottom: '1em' }}>
            <div style={{ width: '150px', display: 'flex', alignItems: 'end' }}>
              <legend>Date of publication:</legend>
            </div>

            <div style={{ display: 'flex', width: 200 }}>
              <Field style={{ margin: 0 }}>
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="publish_year"
                  min={year_min}
                  max={year_max}
                  defaultValue={book?.publish_year}
                />
              </Field>

              <Field style={{ margin: 0 }}>
                <label htmlFor="month">Month</label>
                <input
                  type="number"
                  id="month"
                  name="publish_month"
                  min={1}
                  max={12}
                  defaultValue={book?.publish_month}
                />
              </Field>

              <Field style={{ margin: 0 }}>
                <label htmlFor="day">Day</label>
                <input
                  type="number"
                  id="day"
                  name="publish_day"
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

      <div style={{ display: 'flex', gap: 30 }}>
        <Field>
          <label htmlFor="group">Group</label>
          <input
            type="text"
            id="group_name"
            name="group_name"
            maxLength={shortTextLength}
            style={{ width: '100%' }}
            defaultValue={book?.group_name}
          />
        </Field>

        <Field>
          <label htmlFor="language">Language</label>
          <input
            type="text"
            id="language"
            name="language"
            maxLength={shortTextLength}
            style={{ width: '100%' }}
            defaultValue={book?.language}
          />
        </Field>

        <Field>
          <label htmlFor="pages">Pages</label>
          <input
            type="number"
            id="pages"
            name="pages"
            min={0}
            style={{ width: '100%' }}
            defaultValue={book?.pages}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 30 }}>
        <Field style={{ flexGrow: 1 }}>
          <label htmlFor="Description">Description</label>
          <textarea
            id="description"
            name="description"
            maxLength={longTextLength}
            defaultValue={book?.description}
          />
        </Field>

        <Field style={{ flexGrow: 1 }}>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            maxLength={longTextLength}
            defaultValue={book?.notes}
          />
        </Field>
      </div>

      <div>
        <Button aria-disabled={isPending} type='submit' title="Save book">
          {book?.id ? 'Update' : 'Insert'}
        </Button>

        <div
          aria-live="polite"
          aria-atomic="true"
        >
          {actionState?.message && <p style={{ whiteSpace: 'pre' }}>{actionState?.message}</p>}
        </div>
      </div>
    </form>
  );
}
