import Konva from "konva";
import { Circle } from "react-konva";
import { connection, lineTypes } from "../connection.ts";
import { ExtendedDiagramElementProps } from "./Canvas.tsx";
import { useCallback, useEffect, useState, useRef } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import JaggedLine from "./JaggedLine.tsx";
import StraightLine from "./StraightLine.tsx";
import ConnectionEndpoint from "./ConnectionEndpoint.tsx";
import { connectionEndpoints } from "./ConnectionUtils.ts";

const ConnectionElement = ({
  element,
  diagramElements,
  handleKonvaContextMenu,
  onSaveState, // Add new prop
}: {
  element: connection,
  diagramElements: ExtendedDiagramElementProps[],
  handleKonvaContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
  onSaveState?: () => void;
}) => {
  const [x1, y1, x2, y2] = element.getConnectionCoordinates(diagramElements);
  const [startX, setStartX] = useState(x1);
  const [startY, setStartY] = useState(y1);
  const [startAngle, setStartAngle] = useState(180);
  const [endX, setEndX] = useState(x2);
  const [endY, setEndY] = useState(y2);
  const [endAngle, setEndAngle] = useState(0);
  const collisionRadius = 30;
  const [hasSavedState, setHasSavedState] = useState(false);

  const getCenterOfNearestWall = (diagramElement: ExtendedDiagramElementProps, x: number, y: number) => {
    const { posX, posY, width, height } = diagramElement;
    const walls = [
      { wall: 'left', x: posX, y: posY + height / 2, distance: Math.hypot(x - posX, y - (posY + height / 2)) },
      { wall: 'right', x: posX + width, y: posY + height / 2, distance: Math.hypot(x - (posX + width), y - (posY + height / 2)) },
      { wall: 'top', x: posX + width / 2, y: posY, distance: Math.hypot(x - (posX + width / 2), y - posY) },
      { wall: 'bottom', x: posX + width / 2, y: posY + height, distance: Math.hypot(x - (posX + width / 2), y - (posY + height)) },
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
        element.start = { x: newX, y: newY };
      } else {
        const t = collisionRadius * 2 / distance;
        setStartX(endX + t * (newX - endX));
        setStartY(endY + t * (newY - endY));
        element.start = { x: endX + t * (newX - endX), y: endY + t * (newY - endY) };
      }
      if (snappedElementId && snappedWall) {
        element.setStart(snappedElementId, snappedWall);
        setStartAngle(getWallAngle(snappedWall));
      }
    } else {
      element.setEnd(null, null);
      const distance = Math.hypot(newX - startX, newY - startY);
      if (distance >= collisionRadius * 2) {
        setEndX(newX);
        setEndY(newY);
        element.end = { x: newX, y: newY };
      } else {
        const t = collisionRadius * 2 / distance;
        setEndX(startX + t * (newX - startX));
        setEndY(startY + t * (newY - endY));
        element.end = { x: startX + t * (newX - startX), y: startY + t * (newY - endY) };
      }
      if (snappedElementId && snappedWall) {
        element.setEnd(snappedElementId, snappedWall);
        setEndAngle(getWallAngle(snappedWall));
      }
    }
  };

  const getWallAngle = (wall: string): number => {
    switch (wall) {
      case 'left': return 0;
      case 'right': return 180;
      case 'top': return 90;
      case 'bottom': return 270;
      default: return 0;
    }
  };

  const updateSnappedElementPosition = useCallback(
    (
      snappedElementId: string | null,
      setX: (value: number) => void,
      setY: (value: number) => void,
      oppositeX: number,
      oppositeY: number
    ) => {
      if (!snappedElementId) return;

      const diagramElement = diagramElements.find((el) => el.id === snappedElementId);
      if (!diagramElement) return;

      const wall = getCenterOfNearestWall(diagramElement, oppositeX, oppositeY);
      setX(wall.x);
      setY(wall.y);

      if (setX === setStartX) {
        element.setStart(snappedElementId, wall.wall);
        setStartAngle(getWallAngle(wall.wall));
      } else {
        element.setEnd(snappedElementId, wall.wall);
        setEndAngle(getWallAngle(wall.wall));
      }
    },
    [diagramElements, element]
  );

  useEffect(() => {
    console.log('Start Snapped:', element.getStartSnappedElementId(), element.getStartSnappedWall());
    updateSnappedElementPosition(element.getStartSnappedElementId(), setStartX, setStartY, endX, endY);
  }, [diagramElements, element, endX, endY, updateSnappedElementPosition]);

  useEffect(() => {
    console.log('End Snapped:', element.getEndSnappedElementId(), element.getEndSnappedWall());
    updateSnappedElementPosition(element.getEndSnappedElementId(), setEndX, setEndY, startX, startY);
  }, [diagramElements, element, startX, startY, updateSnappedElementPosition]);

  useEffect(() => {
  console.log('ConnectionElement Render:', {
    id: element.id,
    startX,
    startY,
    endX,
    endY,
    startSnapped: element.getStartSnappedElementId(),
    startWall: element.getStartSnappedWall(),
    endSnapped: element.getEndSnappedElementId(),
    endWall: element.getEndSnappedWall(),
    start: element.start,
    end: element.end,
  });
}, [startX, startY, endX, endY, element]);

  const endpoints = connectionEndpoints[element.getConnectionType()];

  // Helper to call onSaveState only once per drag operation
  const handleDragStart = () => {
    setHasSavedState(false);
  };

  const handleDragEnd = () => {
    if (!hasSavedState) {
      if (onSaveState) onSaveState();
      setHasSavedState(true);
    }
  };

  return (
    <>
      <ConnectionEndpoint
        x={startX}
        y={startY}
        angle={startAngle}
        imageName={endpoints.start}
      />
      <ConnectionEndpoint
        x={endX}
        y={endY}
        angle={endAngle}
        imageName={endpoints.end}
      />
      {element.lineType === lineTypes.straight ? (
        <StraightLine
          coords={[startX, startY, endX, endY]}
          element={element}
          collisionRadius={collisionRadius}
          handleKonvaContextMenu={handleKonvaContextMenu}
        />
      ) : (
        <JaggedLine
          coords={[startX, startY, endX, endY, startAngle, endAngle, endpoints.start, endpoints.end]}
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
        onDragStart={handleDragStart}
        onDragMove={(e) => {
          updatePosition(e, 'start');
          e.target.x(startX);
          e.target.y(startY);
        }}
        onDragEnd={handleDragEnd}
      />
      <Circle
        x={endX}
        y={endY}
        radius={collisionRadius}
        fill="transparent"
        draggable={true}
        onDragStart={handleDragStart}
        onDragMove={(e) => {
          updatePosition(e, 'end');
          e.target.x(endX);
          e.target.y(endY);
        }}
        onDragEnd={handleDragEnd}
      />
    </>
  );
};

export default ConnectionElement;