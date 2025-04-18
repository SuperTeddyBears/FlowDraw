import {ExtendedDiagramElementProps} from "../Canvas/Canvas.tsx";
import {connection} from "../connection.ts";

export const handleHelpClick = () => {
  alert("Function not available yet");
};

export function serializeDiagram(
  diagramElements: ExtendedDiagramElementProps[],
  connectionElements: connection[],
): string {
  const json = JSON.stringify({
    diagramElements: diagramElements.map((element) => ({
      id: element.id,
      posX: element.posX,
      posY: element.posY,
      width: element.width,
      height: element.height,
      textElements: element.textElements,
      path: element.path,
    })),
    connectionElements: connectionElements.map((connection) => ({
      id: connection.id,
      start: connection.start,
      end: connection.end,
    })),
  });
  
  console.log(json);
  
  return json;
}
