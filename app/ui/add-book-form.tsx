'use client';

import { useActionState, useState, useRef, type DragEvent } from 'react';
import Image from 'next/image';
import Button from '@/app/ui/button';
import Field from '@/app/ui/form-field';
import MultiSelect, { type MultiSelectInputRef } from '@/app/ui/form-multi-select';
import { createBook, insertTag } from '@/app/lib/actions';
import type { Collection, Tag } from '@/app/lib/types';
import { shortTextLength, longTextLength } from '@/app/lib/constants';


export default function AddBookForm({ tags, collections }: { tags: Tag[], collections: Collection[] }) {

  //TODO disable if no collection yet
  //TODO set a default collection from query params
  //TODO add isbn lookup & fill fields
  //TODO add ocr to fill fields
  //TODO add cover image support (from file or camera)
  //TODO add image crop & skew

  const [cover, setCover] = useState<string | null>(null);
  const CoverInputRef = useRef<HTMLInputElement>(null);
  const [tagsCopy, setTags] = useState<Tag[]>(tags);
  const tagsInputRef = useRef<MultiSelectInputRef>(null);
  const [errorMessage, formAction, isPending] = useActionState(
    async function (state, formData) {
      const err = await createBook(state, formData);
      if (err) return err;
      // manualy reset controlled inputs
      setCover(null);
      tagsInputRef.current?.reset()
    },
    undefined,
  );

  const handle = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const dropProps = {
    onDrop: (e: DragEvent) => {
      handle(e);
      CoverInputRef.current.files = e.dataTransfer.files;
      setCover(URL.createObjectURL(e.dataTransfer.files[0]));
    },
    onDragEnter: handle,
    onDragLeave: handle,
    onDragOver: handle,
  }

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
      style={{ display: 'flex', flexDirection: 'column', width: '560px' }}
    >

      <p>Insert a new book</p>

      <div style={{ display: 'flex', gap: '30px' }}>

        <Field style={{ marginBottom: 0 }}>
          <label htmlFor='cover' {...dropProps}>
            <span>Cover image</span>
            { cover ?
              <Image src={cover} alt='Book cover' width={180} height={250} className='upload_cover'/>
              :
              <div className='upload_cover'>Upload a cover image</div>
            }
          </label>
          <input
            type='file'
            accept='image/*'
            id='cover'
            name='cover'
            ref={CoverInputRef}
            onChange={e => {
              const files = e.target.files;
              setCover(files ? URL.createObjectURL(files[0]) : null);
            }}
          />
        </Field>

        <div>
          <Field>
            <label htmlFor="collection_id" className='side'>Collection</label>
            <select id="collection_id" name="collection_id" required>
              {collections.map(({ name, id }) => <option value={id} key={id}>{name}</option>)}
            </select>
          </Field>

          <Field>
            <label htmlFor="isbn" className='side'>ISBN</label>
            <input type="text" id="isbn" name="isbn" placeholder='ISBN-10 or ISBN-13'/>
          </Field>

          <Field>
            <label htmlFor="title" className='side'>Title</label>
            <input type="text" id="title" name="title" maxLength={shortTextLength}/>
          </Field>

          <Field>
            <label htmlFor="authors" className='side'>Authors</label>
            <input
              type="text"
              id="authors"
              name="authors"
              maxLength={longTextLength}
              placeholder='Comma separated authors'
            />
          </Field>

          <Field>
            <label htmlFor="publisher" className='side'>Publisher</label>
            <input type="text" id="publisher" name="publisher" maxLength={shortTextLength}/>
          </Field>

          <fieldset style={{ all: 'unset',display: 'flex', marginBottom: '1em' }}>
            <div style={{ width: '150px', display: 'flex', alignItems: 'end' }}>
              <legend>Date of publication:</legend>
            </div>

            <div style={{ display: 'flex', width: 200 }}>
              <Field style={{ margin: 0 }}>
                <label htmlFor="year">Year</label>
                <input type="number" id="year" name="publish_year"/>
              </Field>

              <Field style={{ margin: 0 }}>
                <label htmlFor="month">Month</label>
                <input type="number" id="month" name="publish_month" min={1} max={12}/>
              </Field>

              <Field style={{ margin: 0 }}>
                <label htmlFor="day">Day</label>
                <input type="number" id="day" name="publish_day" min={1} max={31}/>
              </Field>
            </div>
          </fieldset>

          <MultiSelect
            name='tags_ids'
            label='Tags'
            options={tagsCopy.map(({name, id}) => ({name, value: id}))}
            addOption={addTag}
            ref={tagsInputRef}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 30 }}>
        <Field>
          <label htmlFor="group">Group</label>
          <input
            type="text"
            id="group"
            name="group"
            maxLength={shortTextLength}
            style={{ width: '100%' }}
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
          />
        </Field>

        <Field>
          <label htmlFor="pages">Pages</label>
          <input type="number" id="pages" name="pages" min={0} style={{ width: '100%' }}/>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 30 }}>
        <Field style={{ flexGrow: 1 }}>
          <label htmlFor="Description">Description</label>
          <textarea id="description" name="description" maxLength={longTextLength}/>
        </Field>

        <Field style={{ flexGrow: 1 }}>
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" maxLength={longTextLength}/>
        </Field>
      </div>

      <div>
        <Button aria-disabled={isPending}>
          Insert
        </Button>

        <div
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && <p>{errorMessage}</p>}
        </div>
      </div>
    </form>
  );
}
