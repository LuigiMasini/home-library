import { useState, useRef, useImperativeHandle, type Ref } from 'react';
import PerspT from 'perspective-transform';
import Styled from 'styled-components';
import Button from './button';

//TODO esc binding to cancel
//TODO update display image width & scale factor if component resize
//TODO move multiple handles at once (move line, move 3 points)

export type TransformImageRef = { transform: () => void };

type Matrix = number[][];
type Coords = [number, number]; // x y

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
const coord2Rect = ([width, height]: Coords): number[] =>
  [0,0,0,height,width,0,width,height]


export default ({
  src,
  handlePositions=[ [0, 0], [0, 0], [0, 0], [0, 0] ],
  setHandlePositions,
  setTransformedImage,
  margin=20,
  gridColumns=3,
  gridRows=5,
  handleRadius=12,
  previewZoom=1.5,
  ref,
}: {
  src: string;
  handlePositions?: Coords[];
  setHandlePositions?: (handlePositions: Coords[]) => void;
  setTransformedImage?: (src: string, blob?: Blob) => void;
  margin?: number;
  gridColumns?: number,
  gridRows?: number;
  handleRadius?: number;
  previewZoom?: number;
  ref?: Ref<TransformImageRef>;
}) => {
  //handles
  const [moving, setMoving] = useState<"" | "A" | "B" | "C" | "D">("");
  const [A, setA] = useState<Coords>(handlePositions[0]);
  const [B, setB] = useState<Coords>(handlePositions[1]);
  const [C, setC] = useState<Coords>(handlePositions[2]);
  const [D, setD] = useState<Coords>(handlePositions[3]);

  const [imgNaturalDimensions, setImgNaturalDimensions] = useState<Coords>([0,0]);
  const [imgDisplayDimensions, setImgDisplayDimensions] = useState<Coords>([0,0]);
  // ratio of naturalWidth/displayWidth
  const [scaleFactor, setScaleFactor] = useState<number>(1);

  const [resultImgNaturalDimensions, setResultImgDimensions] = useState<Coords>([0,0]);
  const [imageTransform, setImageTransform] = useState<string>(`matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -${margin}, -${margin}, 0, 1)`);

//   const [resultSrc, setResultSrc] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    transform: save
  }))


  // trasform control grid (CG)
  const CGSourceCorners = coord2Rect(imgNaturalDimensions);
  const CGDestCorners = A.concat(B,C,D);
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

    const imgDestCorners = coord2Rect([resultWidth, resultHeight]);

    const imageTransformMatrix = coeffs2Matrix(PerspT(imgSourceCorners, imgDestCorners).coeffs);

    setImageTransform(`matrix3d(${transpose(imageTransformMatrix)})`);
    setResultImgDimensions([resultWidth,resultHeight]);
  }


  const save = () => {
    if (!svgRef.current) return;

    const svgStr = new XMLSerializer().serializeToString(svgRef.current);
    const resUrl = URL.createObjectURL(
      new Blob([svgStr], { type: "image/svg+xml" })
    );

    //svg in img
//     setResultSrc(resUrl);

    //svg in img, copied in canvas to have png
    const img = new Image();
    img.onload = function () {
      canvasRef.current?.getContext('2d')?.drawImage(img, 0, 0);

      canvasRef.current?.toBlob(blob => {
        // update external handle position state
        setHandlePositions && setHandlePositions([A, B, C, D]);
        // update external image state
        setTransformedImage && setTransformedImage(canvasRef.current?.toDataURL() || "", blob || undefined )
      }, 'image/png', 1);
    };
    img.onerror = console.error;
    img.src = resUrl;
  }



  const ColoredDashedLine = ({
    color="white",
    backgroundColor="black",
    strokeDasharray=.04*resultImgNaturalDimensions[0],
    strokeWidth=.01*resultImgNaturalDimensions[0],
    d="",
  }) =>
    <>
      <path d={d} strokeWidth={strokeWidth} stroke={backgroundColor} />
      <path d={d} strokeWidth={strokeWidth} stroke={color} strokeDasharray={strokeDasharray} />
    </>

  return (
    <Container moving={moving} scaleFactor={scaleFactor}>
      <img
        src={src}
        width="100%"
        ref={imgRef}
        onLoad={e => {
          const width = e.target.naturalWidth;
          const height = e.target.naturalHeight;

          setImgNaturalDimensions([width, height]);

          // handle content-fit: contain
          // https://stackoverflow.com/a/52187440
          const ratio = width/height
          const displayWidth = Math.min(e.target.clientWidth, e.target.clientHeight*ratio);
          const displayHeight = Math.min(e.target.clientHeight, e.target.clientWidth/ratio);
          setImgDisplayDimensions([displayWidth,displayHeight]);

          const scaleFactor = width / displayWidth;
          setScaleFactor(scaleFactor);


          const scaledMargin = margin*scaleFactor;
          // initialize handle positions if initial values are all 0
          if ( !handlePositions.reduce((acc, cord) => acc || cord[0] || cord[1], 0) ) {
            setA([scaledMargin,scaledMargin]);
            setB([scaledMargin,height-scaledMargin]);
            setC([width-scaledMargin,scaledMargin]);
            setD([width-scaledMargin,height-scaledMargin]);
          }

          transformImage();
        }}
      />

      <svg
        className="controlGrid"
        width={imgDisplayDimensions[0]}
        style={{ left: `calc(50% - ${imgDisplayDimensions[0]/2}px)`, top: `calc(50% - ${imgDisplayDimensions[1]/2}px)` }}
        viewBox={`0 0 ${imgNaturalDimensions.join(' ')}`}
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
                  d={`M${Math.round(imgNaturalDimensions[0]/(gridColumns)*i)},0 V${imgNaturalDimensions[1]}`}
                />
              )
          }
          {
            [...Array(gridRows+1)]
              .map((a, i) =>
                <path
                  key={"r"+i}
                  className="line"
                  d={`M0,${Math.round(imgNaturalDimensions[1]/(gridRows)*i)} H${imgNaturalDimensions[0]}`}
                />
              )
          }
        </g>
        <circle
          r={handleRadius*scaleFactor}
          transform={`translate(${A.join(' ')})`}
          onMouseDown={() => setMoving("A")}
          />
        <circle
          r={handleRadius*scaleFactor}
          transform={`translate(${B.join(' ')})`}
          onMouseDown={() => setMoving("B")}
          />
        <circle
          r={handleRadius*scaleFactor}
          transform={`translate(${C.join(' ')})`}
          onMouseDown={() => setMoving("C")}
          />
        <circle
          r={handleRadius*scaleFactor}
          transform={`translate(${D.join(' ')})`}
          onMouseDown={() => setMoving("D")}
          />
      </svg>

      <div className="preview">
        <svg
          width={previewZoom*100+"%"}
          viewBox={`0 0 ${resultImgNaturalDimensions.join(' ')}`}
        >
          <image
            href={src}
            width={imgNaturalDimensions[0]}
            height={imgNaturalDimensions[1]}
            style={{ transform: imageTransform }}
          />
          <g>
            <ColoredDashedLine d={`M0,0 H${resultImgNaturalDimensions[0]/3}`}/>
            <ColoredDashedLine d={`M0,0 V${resultImgNaturalDimensions[0]/3}`}/>

            <ColoredDashedLine d={`M0,${resultImgNaturalDimensions[1]} H${resultImgNaturalDimensions[0]/3}`}/>
            <ColoredDashedLine d={`M0,${resultImgNaturalDimensions[1]} v-${resultImgNaturalDimensions[0]/3}`}/>

            <ColoredDashedLine d={`M${resultImgNaturalDimensions[0]},0 h-${resultImgNaturalDimensions[0]/3}`}/>
            <ColoredDashedLine d={`M${resultImgNaturalDimensions[0]},0 V${resultImgNaturalDimensions[0]/3}`}/>

            <ColoredDashedLine d={`M${resultImgNaturalDimensions[0]},${resultImgNaturalDimensions[1]} h-${resultImgNaturalDimensions[0]/3}`}/>
            <ColoredDashedLine d={`M${resultImgNaturalDimensions[0]},${resultImgNaturalDimensions[1]} v-${resultImgNaturalDimensions[0]/3}`}/>
          </g>
        </svg>
      </div>



      <div style={{ display: 'none' }}>
        {/*
          Here are some utility components,
          to be used for image transformation & debugging,
          not meant to be displayed
        */}
        <h4>SVG result (original image + transformation)</h4>
        <svg
          width={resultImgNaturalDimensions[0]}
          height={resultImgNaturalDimensions[1]}
          ref={svgRef}
          viewBox={`0 0 ${resultImgNaturalDimensions.join(' ')}`}
        >
          <image
            href={src}
            width={imgNaturalDimensions[0]}
            height={imgNaturalDimensions[1]}
            style={{ transform: imageTransform }}
          />
        </svg>

        {/*
        <div>
          <h4 style={{ display: 'inline', marginRight: 30 }}>Preview:</h4>
          <Button onClick={save}>save image</Button>
        </div>

        <h4>SVG result in img (original image + transformation)</h4>
        <img
          src={resultSrc}
          width={resultImgNaturalDimensions[0]}
          height={resultImgNaturalDimensions[1]}
        />
        */}

        <h4>PNG result</h4>
        <canvas
          ref={canvasRef}
          width={resultImgNaturalDimensions[0]}
          height={resultImgNaturalDimensions[1]}
          />
      </div>
    </Container>
  )
}

const Container = Styled.div
.withConfig({
  shouldForwardProp: prop => ![
      'moving',
      'scaleFactor',
    ].includes(prop)
})<{
  moving: string;
  scaleFactor: number;
}>`
width: 100%;
height: 100%;
position: relative;

.controlGrid {
  position: absolute;
  top: 0;
  overflow: visible;

  path {
    stroke: blue;
    stroke-width: ${props => 3*props.scaleFactor}px;
    stroke-linecap: square;
    opacity: .8;
  }

  circle {
    fill: blue;
    pointer-events: all;
    stroke: blue;
    stroke-width: ${props => 2*props.scaleFactor}px;
    cursor: grab;
    opacity: 0.8;
  }
}

.preview {
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  ${props => !props.moving.length && 'display: none;'}

  background-color: #fff;
  background-image:  repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc);
  background-position: 0 0, 10px 10px;
  background-size: 20px 20px;

  svg{
    overflow: visible;
    position: absolute;

    ${props => {
      switch (props.moving) {
        default:
        case "A":
          return 'left: 30%; top: 30%;';
        case "B":
          return 'left: 30%; bottom: 30%;';
        case "C":
          return 'right: 30%; top: 30%;';
        case "D":
          return 'right: 30%; bottom: 30%;';
      }
    }}
  }
}
`;
