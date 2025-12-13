export const isValidId = (id: any) => Number.isInteger(id) && id > 0;

export function getFileExtension (filename: string, type?: string): string {
  const splittedFilename = filename.split('.');
  let extFromName='';
  let extFromType='';

  if (splittedFilename.length > 1)
    extFromName = '.'+splittedFilename[splittedFilename.length-1];

  if (type?.length) {
    const splittedType = type.split('/');
    switch (splittedType[1]) {
      case 'jpeg':
        extFromType='.jpg';
        break;
      default:
        extFromType='.'+splittedType[1];
    }
  }

  if (extFromName && extFromType && extFromName !== extFromType)
    console.warn("type mismatch between file extension and file type");

  // prefer file type over extension (arbitrarily)
  return extFromType || extFromName;
}
