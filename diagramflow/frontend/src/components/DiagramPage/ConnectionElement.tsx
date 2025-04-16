import Konva from "konva";
import {Circle, Line} from "react-konva";
import {connection} from "./connection.ts";
import {ExtendedDiagramElementProps} from "./Canvas/Canvas.tsx";
import {useCallback, useEffect, useState} from "react";
import {KonvaEventObject} from "konva/lib/Node";

const ConnectionElement = ({element, diagramElements, handleKonvaContextMenu}: {
  element: connection,
  diagramElements: ExtendedDiagramElementProps[],
  handleKonvaContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
}) => {
  const [x1, y1, x2, y2]: [number, number, number, number] = element.getConnectionCoordinates(diagramElements);
  const [startX, setStartX] = useState(x1);
  const [startY, setStartY] = useState(y1);
  const [endX, setEndX] = useState(x2);
  const [endY, setEndY] = useState(y2);
  const collisionRadius = 30;
  
  const updatePosition = (e: Konva.KonvaEventObject<DragEvent>, point: string) => {
    const {clientX, clientY} = e.evt;
    const canvasRect = e.target.getStage()?.container().getBoundingClientRect();
    let newX = clientX - (canvasRect?.left || 0);
    let newY = clientY - (canvasRect?.top || 0);
    
    let snappedElementId = null;
    let snappedWall = null;
    
    for (const element of diagramElements) {
      const {posX, posY, width, height} = element;
      
      if (
        newX >= posX &&
        newX <= posX + width &&
        newY >= posY &&
        newY <= posY + height
      ) {
        const distances = [
          {wall: 'left', x: posX, y: posY + height / 2, distance: Math.abs(newX - posX)},
          {wall: 'right', x: posX + width, y: posY + height / 2, distance: Math.abs(newX - (posX + width))},
          {wall: 'top', x: posX + width / 2, y: posY, distance: Math.abs(newY - posY)},
          {wall: 'bottom', x: posX + width / 2, y: posY + height, distance: Math.abs(newY - (posY + height))},
        ];
        
        const closest = distances.reduce((a, b) => (a.distance < b.distance ? a : b));
        newX = closest.x;
        newY = closest.y;
        snappedElementId = element.id;
        snappedWall = closest.wall;
        break;
      }
    }
    
    if (point === 'start') {
      element.setStart(null, null);
      const distance = Math.hypot(newX - endX, newY - endY);
      if (distance >= collisionRadius * 2) {
        setStartX(newX);
        setStartY(newY);
      } else {
        const t = collisionRadius * 2 / distance;
        setStartX(endX + t * (newX - endX));
        setStartY(endY + t * (newY - endY));
      }
    } else {
      element.setEnd(null, null);
      const distance = Math.hypot(newX - startX, newY - startY);
      if (distance >= collisionRadius * 2) {
        setEndX(newX);
        setEndY(newY);
      } else {
        const t = collisionRadius * 2 / distance;
        setEndX(startX + t * (newX - startX));
        setEndY(startY + t * (newY - startY));
      }
    }
    
    if (snappedElementId && snappedWall) {
      if (point === 'start') {
        element.setStart(snappedElementId, snappedWall);
      } else {
        element.setEnd(snappedElementId, snappedWall);
      }
    }
  };
  
  const updateSnappedElementPosition = useCallback((snappedElementId: string | null, setX: (value: number) => void, setY: (value: number) => void, snapPosition: string | null) => {
    if (!snappedElementId) {
      return;
    }
    
    const diagramElement = diagramElements.find(el => el.id === snappedElementId);
    if (!diagramElement) {
      return;
    }
    
    let offsetX = 0, offsetY = 0;
    switch (snapPosition) {
      case 'left':
        offsetY = diagramElement.height / 2;
        break;
      case 'right':
        offsetX = diagramElement.width;
        offsetY = diagramElement.height / 2;
        break;
      case 'top':
        offsetX = diagramElement.width / 2;
        break;
      case 'bottom':
        offsetX = diagramElement.width / 2;
        offsetY = diagramElement.height;
        break;
    }
    setX(diagramElement.posX + offsetX);
    setY(diagramElement.posY + offsetY);
  }, [diagramElements]);
  
  useEffect(() => {
    updateSnappedElementPosition(element.getStartSnappedElementId(), setStartX, setStartY, element.getStartPosition());
  }, [diagramElements, element, updateSnappedElementPosition]);
  
  useEffect(() => {
    updateSnappedElementPosition(element.getEndSnappedElementId(), setEndX, setEndY, element.getEndPosition());
  }, [diagramElements, element, updateSnappedElementPosition]);
  
  return (
    <>
      {/*The visuals*/}
      <Circle
        x={startX}
        y={startY}
        radius={3}
        fill="black"
      />
      <Circle
        x={endX}
        y={endY}
        radius={3}
        fill="black"
      />
      <Line
        points={[startX, startY, endX, endY]}
        stroke="black"
        strokeWidth={2}
      />
      
      {/*The collision detection*/}
      <Line
        points={[startX, startY, endX, endY]}
        stroke="transparent"
        strokeWidth={collisionRadius}
        onContextMenu={(e: Konva.KonvaEventObject<PointerEvent>) => {
          e.evt.preventDefault();
          const stage = e.target.getStage();
          if (stage) {
            const pointerPosition = stage.getPointerPosition();
            if (pointerPosition) {
              handleKonvaContextMenu(e, element.id.toString());
            }
          }
        }}
      />
      <Circle
        x={startX}
        y={startY}
        radius={collisionRadius}
        fill="transparent"
        draggable={true}
        onDragMove={(e) => {
          updatePosition(e, 'start');
          e.target.x(startX);
          e.target.y(startY);
        }}
      />
      <Circle
        x={endX}
        y={endY}
        radius={collisionRadius}
        fill="transparent"
        draggable={true}
        onDragMove={(e) => {
          updatePosition(e, 'end');
          e.target.x(endX);
          e.target.y(endY);
        }}
      />
    </>
  );
};

export default ConnectionElement;
