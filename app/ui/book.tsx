'use client';

import Styled from 'styled-components';
import Link from '@/app/ui/link';
import type { Book, Tag } from '@/app/lib/types';
import TagComponent from './tag';

//TODO save if book has image & check before tryign to load it

export default function Book ({ book, tags }: { book: Book, tags: Tag[] }) {
  return (
    <BookContainer href={book.collection_id+'/'+book.id}>
      <img src={'/uploads/'+book.id+'.jpg'} alt={'book cover'+(book.title ? 'for '+book.title : '')}/>
      <div>
        <h3>{book.title}</h3>
        {book.group_name && <span className='group'>📚 {book.group_name}</span>}
        <p>{book.authors}</p>

        <p className='metadata'>
          {
            [
              book.publisher,
              book.publish_year,
              book.pages && book.pages+' pages',
            ].filter(i => i).join(', ')
          }
          <br/>
          {book.language && 'language: '+book.language}
          <br/>
          {book.isbn && 'ISBN-13: '+book.isbn}
        </p>

        <p>{book.description}</p>
        {
          book.tags_ids &&
          <p className='tags'>
          {JSON.parse(book.tags_ids).map((id: number) =>
            <TagComponent key={id}>{tags.filter(tag => tag.id===id)[0].name}</TagComponent>
          )}
          </p>
        }
      </div>
    </BookContainer>
  );
}


const BookContainer =  Styled(Link)`
display: flex;
gap: 20px;
align-items: flex-start;

border: solid 1px grey;
border-radius: 10px;
padding: 15px;

text-decoration: none !important;
&:hover h3, &:active h3 {
  text-decoration: underline !important;
}

h3 {
  margin: 0;
  display: inline;
}

.group {
  margin-left: 2em;
}

img {
  flex: 0 0 120px;
  height: 180px;
  width: 120px;
  border: solid 1px grey;
  border-radius: .2em;
  display: flex;
  justify-content: center;
  align-items: center;
  object-fit: contain;
}

.metadata {
  color: grey;
}
`;
