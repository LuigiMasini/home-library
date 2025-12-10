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

//TODO image edit (crop & skew), delete
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
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [handles, setHandles] = useState<[number, number][]>([ [0, 0], [0, 0], [0, 0], [0, 0] ]);

  const TransformImageRef = useRef<TransformImageRef>(null);


  useImperativeHandle(ref, () => ({
    reset: () => {
      setCover(null);
      setOriginalImage(null);
    },
  }), []);

  const handle = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const dropProps = {
    onDrop: (e: DragEvent) => {
      handle(e);
      inputRef.current.files = e.dataTransfer.files;

      const src = URL.createObjectURL(e.dataTransfer.files[0]);
      setCover(src);
      setOriginalImage(src);
    },
    onDragEnter: handle,
    onDragLeave: handle,
    onDragOver: handle,
  }

  const takePicture = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.getScreenshot();
      setCover(photo);
      setOriginalImage(photo);
      setIsCameraOpen(false);
      setIsCameraLoading(true);
    }
  }

  return (
    <Container {...dropProps}>

      <span>Cover image</span>
      <div className='upload_cover'>
        { cover ?
          isEditing && originalImage ?
          <>
            <TransformImage
              src={originalImage}
              ref={TransformImageRef}
              handlePositions={handles}
              setHandlePositions={setHandles}
              setTransformedImage={src => {
                setCover(src);
                setIsEditing(false);
              }}
            />
            <div className="buttons">
              <Button
                onClick={() => setIsEditing(false)}
                title="Cancel editing"
              >
                🗙
              </Button>
              <Button
                onClick={() => TransformImageRef.current?.transform()}
                title="Transform the image and exit"
              >
                ✓
              </Button>
            </div>
          </>
          :
          <>
            <img src={cover} alt='Book cover'/>
            <div className="buttons">
              <ConfirmationButton
                onClick={() => setCover(null)}
                title='Remove cover'
              >
                🗑
              </ConfirmationButton>
              <ConfirmationButton
                onClick={() => setCover(originalImage)}
                title='Reset changes'
              >
                ⭯
              </ConfirmationButton>
              <Button
                onClick={() => setIsEditing(true)}
                title="Edit image"
              >
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
              onUserMedia={(...a) => setIsCameraLoading(false)}
              onUserMediaError={(...a) => {alert(a); setIsCameraLoading(false); setIsCameraOpen(false)}}
            />
            { isCameraLoading ?
              <Loading style={{ position: 'absolute', top: 'calc(50% - 15px)' }}/>
              :
              <div className="buttons">
                <Button
                  onClick={takePicture}
                  title="Take picture"
                >
                  📷︎
                </Button>
                <Button
                  onClick={() => setIsCameraOpen(false)}
                  title="Close camera"
                >
                  🗙
                </Button>
              </div>
            }
          </>
          :
          <>
            Upload from
            <span>
              <label htmlFor='cover'>file</label>
              {' or '}
              <span onClick={() => setIsCameraOpen(true)}>camera</span>
            </span>
          </>
        }
      </div>


      <input
        type='file'
        accept='image/*'
        id='cover'
        name='cover'
        ref={inputRef}
        onChange={e => {
          const files = e.target.files;
          const src = files ? URL.createObjectURL(files[0]) : null;
          setCover(src);
          setOriginalImage(src);
        }}
      />
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
