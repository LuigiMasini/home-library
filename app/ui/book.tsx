'use client';

import Styled from 'styled-components';
import { useRouter } from 'next/navigation';
import type { Book, Tag, Collection } from '@/app/lib/types';
import TagComponent from './tag';

//TODO save if book has image & check before tryign to load it -> string to save ext

export default function Book ({ book, tags, collections, detailed=false }: {
  book: Book;
  tags: Tag[];
  collections?: Collection[];
  detailed?: boolean;
}) {

  const router = useRouter();
  const parsedTags = JSON.parse(book.tags_ids || '[]');

  return (
    <BookContainer onClick={() => !detailed && router.push(book.collection_id+'/'+book.id)} detailed={detailed}>
      <img src={'/uploads/'+book.id+'.jpg'} alt='book cover'/>
      <div>
        <h3>{book.title}</h3>
        {/*book.group_name && <span className='group'>📚 {book.group_name}</span>*/}
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

        {
          book.tags_ids &&
          <p className='tags'>
          {tags.filter(({id}) => parsedTags.includes(id)).map(tag =>
            <TagComponent key={tag.id} tag={tag}/>
          )}
          </p>
        }
        {book.description &&
          <p>{book.description.slice(0,255) + (book.description.length > 255 ? '...' : '')}</p>
        }
      </div>
    </BookContainer>
  );
}


const BookContainer =  Styled.div
.withConfig({
  shouldForwardProp: name =>
    ![
      'detailed',
    ].includes(name),
})<{
  detailed?: boolean;
}>`
display: flex;
gap: 20px;
align-items: flex-start;

${props => props.detailed ? '' : `
  border: solid 1px grey;
  border-radius: 10px;
  padding: 15px;

  text-decoration: none !important;
  &:hover h3, &:active h3 {
    text-decoration: underline !important;
  }`
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
