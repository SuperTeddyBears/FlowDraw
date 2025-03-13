import './App.css'
import {AppSideBar} from "./AppSideBar.tsx";
import {Layer, Line, Rect, Stage} from "react-konva";
import {useState} from "react";
import { KonvaEventObject } from 'konva/lib/Node';

const SIDEBAR_WIDTH = '0.1';

type shape = {
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  const [shape, setShape] = useState<shape>({ x: 100, y: 100, width: 100, height: 100 });
  const [visible, setVisible] = useState<boolean>(false);
  
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    // Update shape position when the rectangle is dragged
    setShape({
      ...shape,
      x: e.target.x(),
      y: e.target.y()
    });
  };
  
  return (
    <div className="App">
      <div className={'sidebar'} style={{width: SIDEBAR_WIDTH}}>
        <AppSideBar width={window.innerWidth * parseFloat(SIDEBAR_WIDTH)}/>
      </div>
      
      <div className={"main"} style={{marginLeft: SIDEBAR_WIDTH}}>
        <Stage width={window.innerWidth * (1. - parseFloat(SIDEBAR_WIDTH))} height={window.innerHeight}>
          <GridLayer />
          
          <Layer>
            <Rect
              draggable={true}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              stroke={'black'}
              fill={'transparent'}
              onDragMove={handleDragMove}
              onCLick={() => setVisible(prevState => !prevState)}
            />
            <ShapeSizeInterface
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              visible={visible}
            />
          </Layer>
        
        </Stage>
      </div>
    </div>
  );
}

export default App



const ShapeSizeInterface = ({ x, y, width, height, visible }: { x: number; y: number; width: number; height: number, visible: boolean }) => {
  const padding = 20;
  const points = [
    0,                    0,
    width + 2 * padding,  0,
    width + 2 * padding,  height + 2 * padding,
    0,                    height + 2 * padding,
    0,                    0,
  ]

  return (
    <>
      <Line x={x - padding} y={y - padding} points={points} stroke="blue" visible={visible} />
    </>
  )
}

const GridLayer = () => {
  return (
    <Layer>
      {Array.from({length: Math.ceil(window.innerWidth / 20)}).map((_, i) => (
        <Rect
          key={`v-line-${i}`}
          x={i * 20}
          y={0}
          width={1}
          height={window.innerHeight}
          fill="gray"
          opacity={0.5}
        />
      ))}
      {Array.from({length: Math.ceil(window.innerHeight / 20)}).map((_, i) => (
        <Rect
          key={`h-line-${i}`}
          x={0}
          y={i * 20}
          width={window.innerWidth}
          height={1}
          fill="gray"
          opacity={0.5}
        />
      ))}
    </Layer>
  )
}