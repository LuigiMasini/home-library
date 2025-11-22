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

  const _saveCollection = () => {
    try {
      updateCollection(collection.id, {name: newName})
      setisEditing(false);
    }
    catch (e) {
      if (!(e instanceof Error))
        e = new Error(e);

      console.error(e)
      setErrorMessage(e.message)
    }
  }


  const _deleteCollection = () => {
    try {
      deleteCollection(collection.id)
      setisEditing(false);
    }
    catch (e) {
      if (!(e instanceof Error))
        e = new Error(e);

      console.error(e)
      setErrorMessage(e.message)
    }
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
          <Button onClick={() => setisEditing(true)}>Edit 🖉</Button>
          :
          <>
            <Button onClick={_saveCollection}>Save 🖫</Button>
            <ConfirmationButton onClick={_deleteCollection}>
              Delete 🗑
            </ConfirmationButton>
            {errorMessage && <p>{errorMessage}</p>}
          </>
        }
      </td>
    </tr>
  );
}
