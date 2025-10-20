import AddCollectionForm from '@/app/ui/add-collection-form';
import Collection from '@/app/ui/collection';

import { getCollections } from '@/app/lib/data';


export default async function Page() {

  const collections = await getCollections();

  return (
    <main>
      <p>Your collections:</p>
      { collections.length ?
        <table>
          <tbody>
            { collections.map((collection) => <Collection key={collection.id} collection={collection}/>) }
          </tbody>
        </table>
        :
          <p>No collections yet.</p>
      }

      <AddCollectionForm/>

    </main>
  )
}
