import { useState, useImperativeHandle, useRef, type DragEvent, type Ref } from 'react';
import Styled from 'styled-components';
import Field from './form-field';
import ConfirmationButton from './confirmation-button';

export type ImageInputRef = { reset: () => void };

//TODO image edit (crop & skew), delete

export default function ({ defaultValue, ref }: {
  defaultValue?: string;
  ref?: Ref<ImageInputRef>;
}) {
  const [cover, setCover] = useState<string | null>(defaultValue || null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <InputContainer>
      <label htmlFor='cover' {...dropProps}>
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
                🗑️
              </ConfirmationButton>
            </>
            :
            <span>Upload a cover image</span>
          }
        </div>
      </label>
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
    </InputContainer>
  );
}

const InputContainer = Styled(Field)`
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
  justify-content: center;
  align-items: center;
  object-fit: contain;
  position: relative;
}

img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

`;
