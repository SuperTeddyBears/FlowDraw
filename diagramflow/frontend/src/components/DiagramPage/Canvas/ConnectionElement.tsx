import Konva from "konva";
import { Circle } from "react-konva";
import { connection, lineTypes } from "../connection.ts";
import { ExtendedDiagramElementProps } from "./Canvas.tsx";
import { useCallback, useEffect, useState } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import JaggedLine from "./JaggedLine.tsx";
import StraightLine from "./StraightLine.tsx";
import ConnectionEndpoint from "./ConnectionEndpoint.tsx";
import { connectionEndpoints } from "./ConnectionUtils.ts";

const ConnectionElement = ({
  element,
  diagramElements,
  handleKonvaContextMenu,
}: {
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

  const getCenterOfNearestWall = (diagramElement: ExtendedDiagramElementProps, x: number, y: number) => {
    const { posX, posY, width, height } = diagramElement;
    const walls = [
      { wall: 'left',    x: posX,         y: posY + height / 2, distance: Math.hypot(x - posX, y - (posY + height / 2)) },
      { wall: 'right',   x: posX + width, y: posY + height / 2, distance: Math.hypot(x - (posX + width), y - (posY + height / 2)) },
      { wall: 'top',     x: posX + width / 2, y: posY, distance: Math.hypot(x - (posX + width / 2), y - posY) },
      { wall: 'bottom',  x: posX + width / 2, y: posY + height, distance: Math.hypot(x - (posX + width / 2), y - (posY + height)) },
    ];
    return walls.reduce((a, b) => (a.distance < b.distance ? a : b));
  };

  const updatePosition = (e: Konva.KonvaEventObject<DragEvent>, point: string) => {
    const { clientX, clientY } = e.evt;
    const canvasRect = e.target.getStage()?.container().getBoundingClientRect();
    let newX = clientX - (canvasRect?.left || 0);
    let newY = clientY - (canvasRect?.top || 0);

    let snappedElementId = null;
    let snappedWall = null;

    for (const diagramElement of diagramElements) {
      const { posX, posY, width, height } = diagramElement;

      if (newX >= posX && newX <= posX + width && newY >= posY && newY <= posY + height) {
        const wall = getCenterOfNearestWall(diagramElement, newX, newY);
        newX = wall.x;
        newY = wall.y;
        snappedElementId = diagramElement.id;
        snappedWall = wall.wall;
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
      if (snappedElementId && snappedWall) {
        element.setStart(snappedElementId, snappedWall);
      }

      const endSnappedId = element.getEndSnappedElementId();
      if (endSnappedId) {
        const endElement = diagramElements.find(el => el.id === endSnappedId);
        if (endElement) {
          const wall = getCenterOfNearestWall(endElement, startX, startY);
          setEndX(wall.x);
          setEndY(wall.y);
          element.setEnd(endSnappedId, wall.wall);
        }
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
      if (snappedElementId && snappedWall) {
        element.setEnd(snappedElementId, snappedWall);
      }

      const startSnappedId = element.getStartSnappedElementId();
      if (startSnappedId) {
        const startElement = diagramElements.find(el => el.id === startSnappedId);
        if (startElement) {
          const wall = getCenterOfNearestWall(startElement, endX, endY);
          setStartX(wall.x);
          setStartY(wall.y);
          element.setStart(startSnappedId, wall.wall);
        }
      }
    }
  };

  const updateSnappedElementPosition = useCallback((
    snappedElementId: string | null,
    setX: (value: number) => void,
    setY: (value: number) => void,
    oppositeX: number,
    oppositeY: number
  ) => {
    if (!snappedElementId) return;

    const diagramElement = diagramElements.find(el => el.id === snappedElementId);
    if (!diagramElement) return;

    const wall = getCenterOfNearestWall(diagramElement, oppositeX, oppositeY);
    setX(wall.x);
    setY(wall.y);

    if (setX === setStartX) {
      element.setStart(snappedElementId, wall.wall);
    } else {
      element.setEnd(snappedElementId, wall.wall);
    }
  }, [diagramElements]);

  useEffect(() => {
    updateSnappedElementPosition(element.getStartSnappedElementId(), setStartX, setStartY, endX, endY);
  }, [diagramElements, element, endX, endY, updateSnappedElementPosition]);

  useEffect(() => {
    updateSnappedElementPosition(element.getEndSnappedElementId(), setEndX, setEndY, startX, startY);
  }, [diagramElements, element, startX, startY, updateSnappedElementPosition]);

  // Calculate direction vectors for endpoint rotations
  const dx = endX - startX;
  const dy = endY - startY;
  const startAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 180; // Add 180 degrees
  const endAngle = (Math.atan2(-dy, -dx) * 180 / Math.PI) + 180; // Add 180 degrees

  // Get the endpoint images based on the connection type
  const endpoints = connectionEndpoints[element.getConnectionType()];

  return (
      <>
        {/* Start endpoint */}
        <ConnectionEndpoint
            x={startX}
            y={startY}
            angle={startAngle}
            imageName={endpoints.start}
        />

        {/* End endpoint */}
        <ConnectionEndpoint
            x={endX}
            y={endY}
            angle={endAngle}
            imageName={endpoints.end}
        />

        {/* Connection Line */}
        {element.lineType === lineTypes.straight ? (
            <StraightLine
                coords={[startX, startY, endX, endY]}
                element={element}
                collisionRadius={collisionRadius}
                handleKonvaContextMenu={handleKonvaContextMenu}
            />
        ) : (
            <JaggedLine coords={[startX, startY, endX, endY]} element={element} />
        )}

        {/* Drag handles */}
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
      ) : (
        <JaggedLine
            coords={[startX, startY, endX, endY]}
            element={element}
            collisionRadius={collisionRadius}
            handleKonvaContextMenu={handleKonvaContextMenu}
        />
      )}
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