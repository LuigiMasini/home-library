import {
  useState,
  useImperativeHandle,
  useRef,
  type DragEvent,
  type Ref,
} from 'react';
import Styled from 'styled-components';
import Webcam from "react-webcam";
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
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<Webcam>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setCover(null);
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
      setCover(URL.createObjectURL(e.dataTransfer.files[0]));
    },
    onDragEnter: handle,
    onDragLeave: handle,
    onDragOver: handle,
  }

  const takePicture = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.getScreenshot();
      setCover(photo);
      setIsCameraOpen(false);
      setIsCameraLoading(true);
    }
  }

  return (
    <Container {...dropProps}>

      <span>Cover image</span>
      <div className='upload_cover'>
        { cover ?
          <>
            <img
              src={cover}
              alt='Book cover'
            />
            <ConfirmationButton
              onClick={() => setCover(null)}
              style={{ position: 'absolute', bottom: '20px' }}
              title='Remove cover'
            >
              🗑
            </ConfirmationButton>
          </>
          :
          isCameraOpen ?
          <>
            <Webcam
              disablePictureInPicture
              ref={cameraRef}
              style={{ width: '100%' }}
              onUserMedia={(...a) => setIsCameraLoading(false)}
              onUserMediaError={(...a) => {alert(a); setIsCameraLoading(false)}}
            />
            { isCameraLoading ?
              <Loading style={{ position: 'absolute', top: 'calc(50% - 15px)' }}/>
              :
              <Button onClick={takePicture} style={{ position: 'absolute', bottom: '20px' }}>📷︎</Button>
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
          setCover(files ? URL.createObjectURL(files[0]) : null);
        }}
      />
    </Container>
  );
}

const Container = Styled(Field)`
margin-bottom: 0;

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

  position: relative;
//   object-fit: contain; ??


  label, span {
    display: unset;
    margin-bottom: unset;
  }

  span label, span span {
    text-decoration: underline;
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
