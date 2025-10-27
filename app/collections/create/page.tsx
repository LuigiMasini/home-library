import { getTags, getCollections } from '@/app/lib/data';
import AddBookForm from '@/app/ui/add-book-form';

export default async function CreatePage() {

  const [tags, collections] = await Promise.all([getTags(), getCollections()]);

  return (
    <main>
      <h2>Insert a new book</h2>
      <AddBookForm tags={tags} collections={collections}/>
    </main>
  )
}
