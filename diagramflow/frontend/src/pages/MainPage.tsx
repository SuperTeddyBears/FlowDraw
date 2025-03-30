import {AppSideBar} from "../components/AppSideBar.tsx";
import {Layer, Stage} from "react-konva";
import {GridLayer} from "../components/GridLayer.tsx";
import {KonvaShape} from "../components/KonvaShape.tsx";

export function MainPage() {
  const SIDEBAR_WIDTH = '0.1';
  
  return (
    <div className="App">
      <div className={'sidebar'} style={{ width: SIDEBAR_WIDTH }}>
        <AppSideBar width={window.innerWidth * parseFloat(SIDEBAR_WIDTH)} />
      </div>
      
      <div className={'main'} style={{ marginLeft: SIDEBAR_WIDTH }}>
        <Stage
          width={window.innerWidth * (1 - parseFloat(SIDEBAR_WIDTH))}
          height={window.innerHeight}
        >
          <GridLayer density={20} />
          
          <Layer>
            <KonvaShape />
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
