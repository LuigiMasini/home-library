import { useState, useRef, useImperativeHandle, type Ref } from 'react';
import PerspT from 'perspective-transform';
import Styled from 'styled-components';

//TODO esc binding to cancel
//TODO update display image width & scale factor if component resize
//TODO zoom lens near mouse when moving handles (zoomed image in a circle, original or preview with overflow: visible and corner lines?)

export type TransformImageRef = { transform: () => void };

type Matrix = number[][];

const transpose = (array: Matrix): Matrix =>
  array[0].map((_, colIndex) => array.map((row) => row[colIndex]));

const coeffs2Matrix = (H: number[]): Matrix =>
  ([
    [H[0],   H[1],   0, H[2]],
    [H[3],   H[4],   0, H[5]],
    [   0,      0,   1,    0],
    [H[6],   H[7],   0, H[8]]
  ]);

//rect with horizontal width & vertical height
const dim2Coord = (width: number, height: number): number[] =>
  [0,0,0,height,width,0,width,height]

export default ({
  src,
  handlePositions=[ [0, 0], [0, 0], [0, 0], [0, 0] ],
  setHandlePositions,
  setTransformedImage,
  margin=40,
  gridColumns=3,
  gridRows=5,
  handleRadius=20,
  ref,
}: {
  src: string;
  handlePositions?: [number, number][];
  setHandlePositions?: (handlePositions: [number, number][]) => void;
  setTransformedImage?: (src: string) => void;
  margin?: number;
  gridColumns?: number,
  gridRows?: number;
  handleRadius?: number;
  ref?: Ref<TransformImageRef>;
}) => {
  //handles
  const [moving, setMoving] = useState<"" | "A" | "B" | "C" | "D">("");
  const [A, setA] = useState<[number, number]>(handlePositions[0]);
  const [B, setB] = useState<[number, number]>(handlePositions[1]);
  const [C, setC] = useState<[number, number]>(handlePositions[2]);
  const [D, setD] = useState<[number, number]>(handlePositions[3]);

  // natural image dimensions
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  // display image width
  const [displayImgWidth, setDisplayImgWidth] = useState<number>(0);

  const [scaleFactor, setScaleFactor] = useState<number>(1);

  //results
  const [resultWidth, setResultWidth] = useState<number>(0);
  const [resultHeight, setResultHeight] = useState<number>(0);
  const [imageTransform, setImageTransform] = useState<string>(`matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -${margin}, -${margin}, 0, 1)`);
//   const [resultSrc, setResultSrc] = useState("");


  useImperativeHandle(ref, () => ({
    transform: save
  }))


  const imgRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  // trasform control grid
  const CGSourceCorners = dim2Coord(imgWidth, imgHeight);
  const CGDestCorners = A.concat(B,C,D);

  // control grid (CG) transform
  const CGTransformMatrix = coeffs2Matrix(PerspT(CGSourceCorners, CGDestCorners).coeffs);
  const CGTransform = `matrix3d(${transpose(CGTransformMatrix)})`;


  const transformImage = () => {
    const imgSourceCorners = CGDestCorners;

    const wx = Math.abs(A[0] - C[0]);
    const wy = Math.abs(A[1] - C[1]);
    const hx = Math.abs(A[0] - B[0]);
    const hy = Math.abs(A[1] - B[1]);

    const resultWidth = Math.sqrt(wx*wx + wy*wy) * scaleFactor;
    const resultHeight = Math.sqrt(hx*hx + hy*hy) * scaleFactor;

    const imgDestCorners = dim2Coord(resultWidth, resultHeight);

    const imageTransformMatrix = coeffs2Matrix(PerspT(imgSourceCorners, imgDestCorners).coeffs);

    setImageTransform(`matrix3d(${transpose(imageTransformMatrix)})`);
    setResultWidth(resultWidth);
    setResultHeight(resultHeight);
  }


  const save = () => {
    if (!svgRef.current) return;

    const svgStr = new XMLSerializer().serializeToString(svgRef.current);
    console.log(svgStr)
    /*
    const resUrl = URL.createObjectURL(
      new Blob([svgStr], { type: "image/svg+xml" })
    );

    //svg in img
    setResultSrc(resUrl);
    */

    //svg in img, copied in canvas to have png
    const img = new Image();
    img.onload = function () {
      canvasRef.current?.getContext('2d')?.drawImage(img, 0, 0);

      // update external handle position state
      setHandlePositions && setHandlePositions([A, B, C, D]);
      // update external image state
      setTransformedImage && setTransformedImage(canvasRef.current?.toDataURL() || "")
    };
    img.onerror = console.error;
    img.src = URL.createObjectURL(
      new Blob([svgStr], { type: "image/svg+xml" })
    );
  }


  return (
    <Container>
      <img
        src={src}
        width="100%"
        ref={imgRef}
        onLoad={e => {
          const width = e.target.naturalWidth;
          const height = e.target.naturalHeight;

          setImgWidth(width);
          setImgHeight(height);

          // initialize handle positions if initial values are all 0
          if ( !handlePositions.reduce((acc, cord) => acc || cord[0] || cord[1], 0) ) {
            setA([margin,margin]);
            setB([margin,height-margin]);
            setC([width-margin,margin]);
            setD([width-margin,height-margin]);
          }

          // handle content-fit: contain
          // https://stackoverflow.com/a/52187440
          const ratio = width/height
          const displayWidth = Math.min(e.target.clientWidth, e.target.clientHeight*ratio);

          setDisplayImgWidth(displayWidth);
          setScaleFactor(width / displayWidth);
          transformImage();
        }}
      />

      <svg
        className="controlGrid"
        width={displayImgWidth}
        style={{ left: `calc(50% - ${displayImgWidth/2}px)` }}
        viewBox={`0 0 ${imgWidth} ${imgHeight}`}
        onMouseUp={() => moving && setMoving("")}
        onMouseLeave={() => moving && setMoving("")}
        onMouseMove={e => {
          //for some reason doesn't work, oldvalue is undefined
          //const update = ([x,y]) => ([x+e.movementX,y+e.movementY])
          switch (moving) {
            case "A":
              setA([A[0]+e.movementX*scaleFactor,A[1]+e.movementY*scaleFactor]);
              break;
            case "B":
              setB([B[0]+e.movementX*scaleFactor,B[1]+e.movementY*scaleFactor]);
              break;
            case "C":
              setC([C[0]+e.movementX*scaleFactor,C[1]+e.movementY*scaleFactor]);
              break;
            case "D":
              setD([D[0]+e.movementX*scaleFactor,D[1]+e.movementY*scaleFactor]);
              break;
            default:
              return;
          }
          transformImage()
        }}
        >
        <g style={{ transform: CGTransform }}>
          {
            [...Array(gridColumns+1)]
              .map((a, i) =>
                <path
                  key={"c"+i}
                  className="line"
                  d={`M${Math.round(imgWidth/(gridColumns)*i)},0 V${imgHeight}`}
                />
              )
          }
          {
            [...Array(gridRows+1)]
              .map((a, i) =>
                <path
                  key={"r"+i}
                  className="line"
                  d={`M0,${Math.round(imgHeight/(gridRows)*i)} H${imgWidth}`}
                />
              )
          }
        </g>
        <circle
          r={handleRadius}
          transform={`translate(${A.join(' ')})`}
          onMouseDown={() => setMoving("A")}
          />
        <circle
          r={handleRadius}
          transform={`translate(${B.join(' ')})`}
          onMouseDown={() => setMoving("B")}
          />
        <circle
          r={handleRadius}
          transform={`translate(${C.join(' ')})`}
          onMouseDown={() => setMoving("C")}
          />
        <circle
          r={handleRadius}
          transform={`translate(${D.join(' ')})`}
          onMouseDown={() => setMoving("D")}
          />
      </svg>

      <div style={{ display: 'none' }}>
        {/*
        <div>
          <h4 style={{ display: 'inline', marginRight: 30 }}>Preview:</h4>
          <button onClick={save}>save image</button>
        </div>
        */}
        <svg
          style={{ /*width: `min(100%, ${resultWidth}px)`*/ }}
          width={resultWidth}
          height={resultHeight}
          ref={svgRef}
          className="preview"
          viewBox={`0 0 ${resultWidth} ${resultHeight}`}
          >
          <image
            href={src}
            width={imgWidth}
            height={imgHeight}
            style={{ transform: imageTransform }}
            />
        </svg>
      </div>

      {/*
      <div>
        <h4>SVG result (original image + transformation)</h4>
        <img
          src={resultSrc}
          style={{ width: `min(100%, ${resultWidth}px)` }}
          />
      </div>
      */}

      <div style={{ display: 'none' }}>
        <h4>PNG result</h4>
        <canvas
          ref={canvasRef}
          width={resultWidth}
          height={resultHeight}
          style={{ width: `min(100%, ${resultWidth}px)` }}
          />
      </div>
    </Container>
  )
}

const Container = Styled.div`
width: 100%;
height: 100%;
position: relative;

.controlGrid {
  position: absolute;
  top: 0;
  overflow: visible;
}

.line {
  stroke: blue;
  stroke-width: 4px;
  stroke-linecap: square;
  opacity: .8;
}

circle {
  fill: blue;
  pointer-events: all;
  stroke: blue;
  stroke-width: 2px;
  cursor: grab;
  opacity: 0.8;
}
`;
