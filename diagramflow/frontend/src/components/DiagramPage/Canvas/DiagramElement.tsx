import { Image, Text, Transformer } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Image as KonvaImage } from 'konva/lib/shapes/Image';
import Konva from 'konva';

export interface DiagramElementProps {
    id?: string;
    path: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    onTextClick: (x: number, y: number, currentText: string, id: string) => void;
    textElements: { id: string; text: string; x: number; y: number }[];
    onAddTextElement: (x: number, y: number) => void;
    onPositionChange?: (id: string, x: number, y: number, width: number, height: number) => void;
    onContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
    onSaveState?: () => void;
    onSelect?: () => void;
}

export const DiagramElement = ({
    id,
    path,
    posX,
    posY,
    width,
    height,
    onTextClick,
    textElements,
    onAddTextElement,
    onPositionChange,
    onContextMenu,
    onSaveState,
    onSelect,
}: DiagramElementProps) => {
    const img = new window.Image();
    img.src = path;

    const [shape, setShape] = useState({
        x: posX,
        y: posY,
        width: img.width || 100,
        height: img.height || 100,
    });

    const imageRef = useRef<KonvaImage>(null);
    // Ref typu Konva.Transformer (z modułu 'konva')
    const transformerRef = useRef<Konva.Transformer>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [interactionTimeout, setInteractionTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setShape((prev) => ({
            ...prev,
            x: posX,
            y: posY,
            width: width || img.width || 100,
            height: height || img.height || 100,
        }));
    }, [posX, posY, width, height]);

    const updatePosition = (e: KonvaEventObject<DragEvent>) => {
        const newX = e.target.x();
        const newY = e.target.y();
        setShape((prev) => ({
            ...prev,
            x: newX,
            y: newY,
        }));
        if (onPositionChange && id) {
            const node = imageRef.current;
            if (node) {
                onPositionChange(id, newX, newY, node.width(), node.height());
            }
        }
    };

    const updateSize = () => {
        const node = imageRef.current;
        if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            const newWidth = node.width() * scaleX;
            const newHeight = node.height() * scaleY;

            const deltaX = (newWidth - shape.width) / 2;
            const deltaY = (newHeight - shape.height) / 2;

            setShape((prev) => ({
                ...prev,
                x: prev.x - deltaX,
                y: prev.y - deltaY,
                width: newWidth,
                height: newHeight,
            }));

            node.scaleX(1);
            node.scaleY(1);

            if (onPositionChange && id) {
                onPositionChange(id, shape.x - deltaX, shape.y - deltaY, newWidth, newHeight);
            }
        }
    };

    useEffect(() => {
        if (transformerRef.current && imageRef.current) {
            transformerRef.current.nodes([imageRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, shape]);

    useEffect(() => {
        const handleClickOutside = () => {
            if (!imageRef.current || !isSelected || isInteracting) return;

            const stage = imageRef.current.getStage();
            if (!stage) return;

            const pos = stage.getPointerPosition();
            if (!pos) return;

            const targetNode = stage.getIntersection(pos);

            if (
                !targetNode ||
                (targetNode !== imageRef.current &&
                (!transformerRef.current || !targetNode.getAncestors().includes(transformerRef.current)))
            ) {
                setIsSelected(false);
            }
        };

        const handleMouseUp = () => {
            if (interactionTimeout) {
                clearTimeout(interactionTimeout);
            }
            setInteractionTimeout(setTimeout(() => {
                setIsInteracting(false);
            }, 100));
        };

        window.addEventListener('click', handleClickOutside);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('click', handleClickOutside);
            window.removeEventListener('mouseup', handleMouseUp);
            if (interactionTimeout) {
                clearTimeout(interactionTimeout);
            }
        };
    }, [isSelected, shape, isInteracting, interactionTimeout]);

    const handleDoubleClick = () => {
        const pos = imageRef.current?.getStage()?.getPointerPosition();
        if (
            pos &&
            pos.x >= shape.x &&
            pos.x <= shape.x + shape.width &&
            pos.y >= shape.y &&
            pos.y <= shape.y + shape.height
        ) {
            onAddTextElement(shape.x + shape.width / 2 - 50, shape.y + height / 2 - 10);
        }
    };

    const handleTextClick = (elemId: string, text: string) => {
        onTextClick(shape.x + shape.width / 2 - 50, shape.y + height / 2 - 10, text, elemId);
    };

    return (
        <>
            <Image
                ref={imageRef}
                image={img}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                draggable={true}
                onClick={() => {
                    setIsSelected(true);
                    if (onSelect) onSelect();
                }}
                onDblClick={handleDoubleClick}
                onTransform={updateSize}
                onTransformStart={() => {
                    setIsInteracting(true);
                    if (onSaveState) onSaveState();
                }}
                onTransformEnd={() => {
                    updateSize();
                }}
                onDragStart={() => {
                    setIsInteracting(true);
                    if (onSaveState) onSaveState();
                }}
                onDragEnd={() => {

                }}
                onDragMove={updatePosition}
                onContextMenu={(e) => onContextMenu(e, path)}
            />

            {textElements.map((element) => (
                <Text
                    key={element.id}
                    text={element.text}
                    x={element.x}
                    y={element.y}
                    draggable={true}
                    fontSize={16}
                    fill="black"
                    onClick={() => handleTextClick(element.id, element.text)}
                />
            ))}

            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 50 || newBox.height < 50) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    rotateEnabled={false}
                />
            )}
        </>
    );
};