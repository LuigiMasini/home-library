'use client';

import { useState } from 'react';
import Link from '@/app/ui/link';
import Button from '@/app/ui/button';
import ConfirmationButton from '@/app/ui/confirmation-button';

import { type Collection } from '@/app/lib/types';
import { deleteCollection, updateCollection } from '@/app/lib/actions';


export default function Collection({ collection }: { collection: Collection }) {
  const [isEditing, setisEditing] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = (e: unknown) => {
    if (!(e instanceof Error)) return;
    console.error(e)
    setErrorMessage(e.message)
  }

  const _saveCollection = () => {
    updateCollection(collection.id, {name: newName})
    .then(() => setisEditing(false))
    .catch(handleError);
  }

  const _deleteCollection = () => {
    deleteCollection(collection.id)
    .then(() => setisEditing(false))
    .catch(handleError);
  }


  return (
    <tr>
      <td style={{ minWidth: '30vw' }}>
        { !isEditing ?
          <Link href={'/collections/'+collection.id}>{ collection.name }</Link>
          :
          <input onChange={e => setNewName(e.target.value)} value={newName}/>
        }
      </td>

      <td style={{ display: 'flex', gap: '10px' }}>
        { !isEditing ?
          <Button onClick={() => setisEditing(true)} title='Edit collection'>Edit 🖉</Button>
          :
          <>
            <Button onClick={_saveCollection} title='Save changes'>Save 🖫</Button>
            <ConfirmationButton onClick={_deleteCollection} title='Delete collection'>
              Delete 🗑
            </ConfirmationButton>
            {errorMessage && <p>{errorMessage}</p>}
          </>
        }
      </td>
    </tr>
  );
}
