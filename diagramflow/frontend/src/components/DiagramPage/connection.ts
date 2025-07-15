import { ExtendedDiagramElementProps } from "./Canvas/Canvas.tsx";
import { ConnectionType } from "./Canvas/ConnectionUtils.ts";

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
  connectionType: ConnectionType;

  constructor(
    id: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    lineType: lineTypes,
    connectionType: ConnectionType = ConnectionType.Default
  ) {
    this.id = id;
    this.start = { x: startX, y: startY };
    this.end = { x: endX, y: endY };
    this.lineType = lineType;
    this.connectionType = connectionType;
  }

  clone(): connection {
    const cloned = new connection(
      this.id,
      // Use fallback coordinates for constructor; will be overridden
      'x' in this.start ? this.start.x : 0,
      'y' in this.start ? this.start.y : 0,
      'x' in this.end ? this.end.x : 0,
      'y' in this.end ? this.end.y : 0,
      this.lineType,
      this.connectionType
    );
    // Deep copy start and end to preserve state
    cloned.start = 'x' in this.start ? { x: this.start.x, y: this.start.y } : { ...this.start };
    cloned.end = 'x' in this.end ? { x: this.end.x, y: this.end.y } : { ...this.end };
    return cloned;
  }

  getConnectionCoordinates(diagramElements: ExtendedDiagramElementProps[]): [number, number, number, number] {
    let startX: number, startY: number, endX: number, endY: number;

    if ('x' in this.start) {
      // Unsnapped start: use coordinates directly
      startX = this.start.x;
      startY = this.start.y;
    } else {
      // Snapped start: find diagram element and calculate wall coordinates
      const startElement = diagramElements.find((el) => el.id === (this.start as connectionData).elementId);
      if (!startElement) {
        console.warn(`Diagram element ${this.start.elementId} not found for start`);
        startX = 0;
        startY = 0;
      } else {
        const coords = this.getWallCoordinates(startElement, (this.start as connectionData).position);
        startX = coords.x;
        startY = coords.y;
      }
    }

    if ('x' in this.end) {
      // Unsnapped end: use coordinates directly
      endX = this.end.x;
      endY = this.end.y;
    } else {
      // Snapped end: find diagram element and calculate wall coordinates
      const endElement = diagramElements.find((el) => el.id === (this.end as connectionData).elementId);
      if (!endElement) {
        console.warn(`Diagram element ${this.end.elementId} not found for end`);
        endX = 0;
        endY = 0;
      } else {
        const coords = this.getWallCoordinates(endElement, (this.end as connectionData).position);
        endX = coords.x;
        endY = coords.y;
      }
    }

    return [startX, startY, endX, endY];
  }

  private getWallCoordinates(element: ExtendedDiagramElementProps, wall: string): { x: number; y: number } {
    const { posX, posY, width, height } = element;
    switch (wall) {
      case 'left':
        return { x: posX, y: posY + height / 2 };
      case 'right':
        return { x: posX + width, y: posY + height / 2 };
      case 'top':
        return { x: posX + width / 2, y: posY };
      case 'bottom':
        return { x: posX + width / 2, y: posY + height };
      default:
        console.warn(`Invalid wall position: ${wall}`);
        return { x: posX + width / 2, y: posY + height / 2 }; // Fallback to center
    }
  }

  setStart(elementId: string | null, position: string | null): connection {
    if (elementId && position) {
      this.start = { elementId, position };
    } else if ('x' in this.start) {
      // Preserve existing coordinates if unsnapping
      this.start = { x: this.start.x, y: this.start.y };
    } else {
      // Fallback to (0, 0) if no coordinates exist
      this.start = { x: 0, y: 0 };
    }
    return this;
  }

  setEnd(elementId: string | null, position: string | null): connection {
    if (elementId && position) {
      this.end = { elementId, position };
    } else if ('x' in this.end) {
      // Preserve existing coordinates if unsnapping
      this.end = { x: this.end.x, y: this.end.y };
    } else {
      // Fallback to (0, 0) if no coordinates exist
      this.end = { x: 0, y: 0 };
    }
    return this;
  }

  getStartPosition(): string | null {
    return 'x' in this.start ? null : (this.start as connectionData).position;
  }

  getEndPosition(): string | null {
    return 'x' in this.end ? null : (this.end as connectionData).position;
  }

  getStartSnappedElementId(): string | null {
    return 'x' in this.start ? null : (this.start as connectionData).elementId;
  }

  getEndSnappedElementId(): string | null {
    return 'x' in this.end ? null : (this.end as connectionData).elementId;
  }

  getStartSnappedWall(): string | null {
    return 'x' in this.start ? null : (this.start as connectionData).position;
  }

  getEndSnappedWall(): string | null {
    return 'x' in this.end ? null : (this.end as connectionData).position;
  }

  setConnectionType(connectionType: ConnectionType): void {
    this.connectionType = connectionType;
  }

  getConnectionType(): ConnectionType {
    return this.connectionType;
  }
}