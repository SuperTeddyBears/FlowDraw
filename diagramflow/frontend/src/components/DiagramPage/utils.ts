import {ExtendedDiagramElementProps} from "./Canvas/Canvas.tsx";
import {connection} from "./connection.ts";
import {Dispatch, SetStateAction} from "react";

export const handleHelpClick = () => {
  alert("Function not available yet");
};

export function serializeDiagram(
  diagramName: string,
  diagramElements: ExtendedDiagramElementProps[],
  connectionElements: connection[],
): string {
  const json = JSON.stringify({
    diagramName,
    diagramElements: Array.isArray(diagramElements)
      ? diagramElements.map((element) => ({
          id: element.id,
          posX: element.posX,
          posY: element.posY,
          width: element.width,
          height: element.height,
          textElements: element.textElements,
          path: element.path,
        }))
      : [],
    connectionElements: Array.isArray(connectionElements)
      ? connectionElements.map((connection) => ({
          id: connection.id,
          start: connection.start,
          end: connection.end,
        }))
      : [],
  });
  
  console.log(json);
  
  return json;
}

export function deserializeDiagram(
  diagram: string,
  setDiagramElements: Dispatch<SetStateAction<ExtendedDiagramElementProps[]>>,
  setConnectionElements: Dispatch<SetStateAction<connection[]>>,
) {
  try {
    const json = JSON.parse(diagram);
    setDiagramElements(json.diagramElements);
    const connections = json.connectionElements.map((connectionElement: any) => {
      const conn = new connection(
        connectionElement.id,
        connectionElement.start.x,
        connectionElement.start.y,
        connectionElement.end.x,
        connectionElement.end.y,
        connectionElement.lineType,
      );
      conn.setStart(connectionElement.start.elementId, connectionElement.start.position);
      conn.setEnd(connectionElement.end.elementId, connectionElement.end.position);
      return conn;
    });
    setConnectionElements(connections);
  } catch (error) {
    console.error("Invalid diagram JSON:", error);
  }
}

export function getDiagramName(diagram: string): string {
  try {
    const parsedDiagram = JSON.parse(diagram);
    return parsedDiagram.diagramName || "Unnamed Diagram";
  } catch (error) {
    console.error("Invalid diagram JSON:", error);
    return "Invalid Diagram";
  }
}
