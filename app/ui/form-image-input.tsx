import {
  useState,
  useImperativeHandle,
  useRef,
  type DragEvent,
  type Ref,
} from 'react';
import Styled from 'styled-components';

import Webcam from 'react-webcam';
import TransformImage, { type TransformImageRef } from './transformImage';

import Field from './form-field';
import Button from './button';
import ConfirmationButton from './confirmation-button';
import Loading from './loading';


export type ImageInputRef = { reset: () => void };

//TODO reimplement webcam, too slow (class -> function, no audio, no json etc)

export default function ({ defaultValue, ref }: {
  defaultValue?: string;
  ref?: Ref<ImageInputRef>;
}) {
  const [cover, setCover] = useState<string | null>(defaultValue || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const cameraRef = useRef<Webcam>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  // image w/out edits, if img replaced, also originalImage changes
  const [originalImage, setOriginalImage] = useState<[File | null, string] | null>(defaultValue ? [null, defaultValue] : null);
  const [handles, setHandles] = useState<[number, number][]>([[0,0],[0,0],[0,0],[0,0]]);
  const TransformImageRef = useRef<TransformImageRef>(null);


  const setFile = (file: File | null) => {
    if (!inputRef.current) return;

    // https://dev.to/code_rabbi/programmatically-setting-file-inputs-in-javascript-2p7i
    const dataTransfer = new DataTransfer();
    file && file.size && dataTransfer.items.add(file);

    inputRef.current.files = dataTransfer.files;
  }


  useImperativeHandle(ref, () => ({
    reset: () => {
      setCover(null);
      setFile(null);
      setOriginalImage(null);
      //TODO revokeObjectUrls
    },
  }), []);


  const handle = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const dropProps = {
    onDrop: (e: DragEvent) => {
      handle(e);

      //setFile
      if (inputRef.current)
        inputRef.current.files = e.dataTransfer.files;

      const src = URL.createObjectURL(e.dataTransfer.files[0]);
      setCover(src);
      setOriginalImage([e.dataTransfer.files[0], src]);
    },
    onDragEnter: handle,
    onDragLeave: handle,
    onDragOver: handle,
  }

  const takePicture = () => {
    if (!cameraRef.current || !isCameraOpen || isCameraLoading) return;

    const photo = cameraRef.current.getScreenshot(); // base64
    setIsCameraOpen(false);
    setIsCameraLoading(true); // for next time

    if (!photo){
      setCover(null);
      setFile(null);
      setOriginalImage(null);
      return;
    }

    // base64 to file (https://stackoverflow.com/questions/68248551/base64-to-image-file-convertion-in-js)
    // Uint8Array.fromBase64 is too much new for now
    //blob = Uint8Array.fromBase64(photo.replace('ata:image/webp;base64,', '') )
    const imageContent = atob(photo.replace('data:image/webp;base64,', ''));
    const buffer = Uint8Array.from(imageContent, (m, k) => m.charCodeAt(0)/*imageContent.charCodeAt(k)*/);
    const file = new File([buffer], 'cover.webp', { type: 'image/webp' });

//     const url = URL.createObjectURL(file);
    setCover(photo);
    setFile(file);
    setOriginalImage([file, photo]);
  }


  return (
    <Container {...dropProps}>

      <span>Cover image</span>
      <div className='upload_cover'>
        { cover ?
          isEditing && originalImage ?
          <>
            <div className="buttons">
              <Button onClick={() => setIsEditing(false)} title="Cancel editing">
                🗙
              </Button>
              <Button
                onClick={() => TransformImageRef.current?.transform()}
                title="Transform the image"
              >
                ✓
              </Button>
            </div>
            <TransformImage
              src={originalImage[1]}
              ref={TransformImageRef}
              handlePositions={handles}
              setHandlePositions={setHandles}
              setTransformedImage={(base64, blob) => {
                setIsEditing(false);
                setCover(base64);
                setFile(new File(
                  [blob || ''],
                  'cover.png',
                  { type: blob?.type || 'image/png' }
                ));
              }}
            />
          </>
          :
          <>
            <img src={cover} alt='Book cover'/>
            <div className="buttons">
              <ConfirmationButton
                title='Remove cover'
                onClick={() => {
                  setCover(null);
                  setFile(null);
                }}
              >
                🗑
              </ConfirmationButton>
              <ConfirmationButton
                title='Reset changes'
                onClick={() => {
                  setCover(originalImage?.[1] || null);
                  setFile(originalImage?.[0] || null);
                }}
              >
                ⭯
              </ConfirmationButton>
              <Button onClick={() => setIsEditing(true)} title="Edit image">
                🖉
              </Button>
            </div>
          </>
          :
          isCameraOpen ?
          <>
            <Webcam
              disablePictureInPicture
              ref={cameraRef}
              style={{ width: '100%' }}
              onUserMedia={() => setIsCameraLoading(false)}
              onUserMediaError={(...a) => {alert(a); setIsCameraLoading(false); setIsCameraOpen(false)}}
            />
            { isCameraLoading ?
              <Loading style={{ position: 'absolute', top: 'calc(50% - 15px)' }}/>
              :
              <div className="buttons">
                <Button onClick={takePicture} title="Take picture">📷︎</Button>
                <Button onClick={() => setIsCameraOpen(false)} title="Close camera">
                  🗙
                </Button>
              </div>
            }
          </>
          :
          <>
            Upload from
            <span>
              <label htmlFor='cover_file'>file</label>
              {' or '}
              <span onClick={() => setIsCameraOpen(true)}>camera</span>
            </span>
            {defaultValue &&
              <div className='buttons'>
                <ConfirmationButton
                  title='Reset changes'
                  onClick={() => {
                    setCover(defaultValue);
                    setFile(null);
                    setOriginalImage([null, defaultValue]);
                  }}
                >
                  ⭯
                </ConfirmationButton>
              </div>
            }
          </>
        }
      </div>


      <input
        type='file'
        accept='image/*'
        id='cover_file'
        name='cover_file'
        ref={inputRef}
        onChange={e => {
          const files = e.target.files;

          if (!files) {
            setCover(null);
            !defaultValue && setOriginalImage(null);
            return;
          }

          const src = URL.createObjectURL(files[0]);
          setCover(src);
          setOriginalImage([files[0], src]);
        }}
      />

      <input type='hidden' name='delete_cover' value={defaultValue && !cover ? 'true': 'false'}/>
    </Container>
  );
}

const Container = Styled(Field)`
margin-bottom: 0;
position: relative;

input[type=file] {
  display: none;
}

.upload_cover {
  width: 180px;
  height: 250px;

  border: solid 1px grey;
  border-radius: .2em;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

//   position: relative;
//   object-fit: contain; ??


  label, span {
    display: unset;
    margin-bottom: unset;
  }

  span label, span span {
    text-decoration: underline;
  }

  .buttons {
    position: absolute;
    //bottom: 20px;
    top: 0;
    right: 0;

    button {
      line-height: 1.5em;
    }
  }
}

img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

span {
  vertical-align: top;
  display: block;
  margin-bottom: .5em;
}
`;
