import {Menu, Sidebar, SubMenu} from "react-pro-sidebar";
import {Stage, Layer, Rect} from "react-konva";

export function AppSideBar({width}: {width: number}) {
  
  return (
    <div>
      <Sidebar backgroundColor={'#202020'}>
        <img src={'src/assets/react.svg'} width={'50%'} alt={'react logo'} draggable={"false"} style={{display: 'block', margin: '0 auto'}}/>
        <div style={{height: '100px'}} />
        <Menu>
          <SubMenu label={'Shapes :D'}>
            <div style={{padding: '10px', backgroundColor: '#202020'}}>
              <div style={{ display: "flex", gap: "10px" }}>
                <ShapeOption width={width / 3 - 20} />
                <ShapeOption width={width / 3 - 20} />
                <ShapeOption width={width / 3 - 20} />
              </div>
            </div>
          </SubMenu>
        </Menu>
      </Sidebar>
    </div>
  )
}

const ShapeOption = ({width}: {width: number}) => {
  return (
    <div draggable={true} className="shape-option">
      <Stage width={width} height={width}>
        <Layer>
          <Rect x={0} y={0} width={width} height={width} stroke={'white'} fill={'transparent'} />
        </Layer>
      </Stage>
    </div>
  )
}
