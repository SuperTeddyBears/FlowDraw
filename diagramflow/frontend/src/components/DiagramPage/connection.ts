import {ExtendedDiagramElementProps} from "./Canvas/Canvas.tsx";

interface connectionData {
  elementId: string;
  position: string;
}

interface position {
  x: number;
  y: number;
}

export enum lineTypes {
  straight = 'straight',
  jagged = 'jagged',
}

export class connection {
  id: number;
  start: connectionData | position;
  end: connectionData | position;
  lineType: lineTypes;

  constructor(id: number, startX: number, startY: number, endX: number, endY: number, lineType: lineTypes) {
    this.id = id;
    this.start = {x: startX, y: startY};
    this.end = {x: endX, y: endY};
    this.lineType = lineType;
  }
  
  getConnectionCoordinates(diagramElements: ExtendedDiagramElementProps[]): [number, number, number, number] {
    const startX = 'x' in this.start
      ? this.start.x
      : diagramElements.find(el => el.id === (this.start as connectionData).elementId)?.posX ?? 0;
  
    const startY = 'y' in this.start
      ? this.start.y
      : diagramElements.find(el => el.id === (this.start as connectionData).elementId)?.posY ?? 0;
  
    const endX = 'x' in this.end
      ? this.end.x
      : diagramElements.find(el => el.id === (this.end as connectionData).elementId)?.posX ?? 0;
  
    const endY = 'y' in this.end
      ? this.end.y
      : diagramElements.find(el => el.id === (this.end as connectionData).elementId)?.posY ?? 0;
  
    return [startX, startY, endX, endY];
  }
  
  setStart(elementId: string | null, position: string | null) {
    if (elementId === null || position === null) {
      return;
    }
    this.start = {elementId: elementId as string, position: position as string};
  }
  
  setEnd(elementId: string | null, position: string | null) {
    if (elementId === null || position === null) {
      return;
    }
    this.end = {elementId: elementId as string, position: position as string};
  }
  
  getStartPosition(): string | null {
    if ('x' in this.start) {
      return null;
    }
    const startElement = this.start as connectionData;
    return startElement.position;
  }
  
  getEndPosition(): string | null {
    if ('x' in this.end) {
      return null;
    }
    const endElement = this.end as connectionData;
    return endElement.position;
  }
  
  getStartSnappedElementId(): string | null {
    if ('x' in this.start) {
      return null;
    }
    const startElement = this.start as connectionData;
    return startElement.elementId;
  }
  
  getEndSnappedElementId(): string | null {
    if ('x' in this.end) {
      return null;
    }
    const endElement = this.end as connectionData;
    return endElement.elementId;
  }
}
