'use client';

import Styled from 'styled-components';
import { useRouter } from 'next/navigation';
import type { Book, Tag, Collection } from '@/app/lib/types';
import TagComponent from './tag';
import { shortMonthsNames } from '@/app/lib/constants';

//TODO save if book has image & check before tryign to load it (string to save filename)
//TODO make group a link, search w/ books of the group
//TODO make collection a link

export default function Book ({
  book: {
    id,
    collection_id,
    title,
    authors,
    publisher,
    publish_year,
    publish_month,
    publish_day,
    language,
    isbn,
    pages,
    tags_ids,
    description,
    notes,
    group_name,
  },
  tags,
  collections,
  detailed=false,
}: {
  book: Book;
  tags: Tag[];
  collections?: Collection[];
  detailed?: boolean;
}) {

  const router = useRouter();
  const parsedTags = JSON.parse(tags_ids || '[]');

  return (
    <BookContainer onClick={() => !detailed && router.push(collection_id+'/'+id)} detailed={detailed}>
      <img src={'/uploads/'+id+'.jpg'} alt='book cover'/>
      <div>
        <h3>{title}</h3>
        <p>{authors}</p>

        <p className='metadata'>
          { !detailed ?
              [
                publisher,
                publish_year,
                pages && pages+' pages',
              ].filter(i => i).join(', ')
            :
              <>
                { collections && 'collection: '+collections.filter(({id}) => id===collection_id)[0].name+'\n' }
                { group_name && 'group: '+group_name+'\n' }
                { publisher && 'publisher: '+publisher+'\n' }
                { (publish_year || publish_month || publish_day) &&
                  `publish date: ${publish_day} ${publish_month && shortMonthsNames[publish_month-1]} ${publish_year}\n`
                }
                { pages && 'pages: '+pages+'\n' }
              </>
          }
          { language && 'language: '+language+'\n' }
          { isbn && 'ISBN-13: '+isbn+'\n' }
        </p>

        { tags_ids &&
          <p className='tags'>
            { tags.filter(({id}) => parsedTags.includes(id)).map(tag =>
                <TagComponent key={tag.id} tag={tag}/>
              )
            }
          </p>
        }
        { !detailed ?
            description &&
            <p>{description.slice(0,255) + (description.length > 255 ? '...' : '')}</p>
          :
            <>
              { description &&
                <>
                  <h4>Description:</h4>
                  <p>{description}</p>
                </>
              }
              { notes &&
                <>
                  <h4>Notes:</h4>
                  <p>{notes}</p>
                </>
              }
            </>
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
  white-space: pre-wrap;
}
`;
