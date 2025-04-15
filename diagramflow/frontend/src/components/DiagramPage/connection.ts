import {ExtendedDiagramElementProps} from "./Canvas/Canvas.tsx";

enum connectionPosition {
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
}

interface connectionData {
  elementId: string;
  position: connectionPosition;
}

interface position {
  x: number;
  y: number;
}

export class connection {
  id: number;
  start: connectionData | position;
  end: connectionData | position;

  constructor(id: number, startX: number, startY: number, endX: number, endY: number) {
    this.id = id;
    this.start = {x: startX, y: startY};
    this.end = {x: endX, y: endY};
  }
  
  getConnectionCoordinates(diagramElements: ExtendedDiagramElementProps[]): [number, number, number, number] {
    const startX = 'x' in this.start
      ? this.start.x
      : diagramElements.find(el => el.id === (this.start as connectionData).elementId)!.posX;
  
    const startY = 'y' in this.start
      ? this.start.y
      : diagramElements.find(el => el.id === (this.start as connectionData).elementId)!.posY;
  
    const endX = 'x' in this.end
      ? this.end.x
      : diagramElements.find(el => el.id === (this.end as connectionData).elementId)!.posX;
  
    const endY = 'y' in this.end
      ? this.end.y
      : diagramElements.find(el => el.id === (this.end as connectionData).elementId)!.posY;
  
    return [startX, startY, endX, endY];
  }
}
