// DiagramElement.tsx
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
    onTextClick: (x: number, y: number, currentText: string, id: string) => void;
    textElements: { id: string; text: string; x: number; y: number }[];
    onAddTextElement: (x: number, y: number) => void;
    isConnecting?: boolean;
    onConnect?: (id: string, centerX: number, centerY: number) => void;
    onPositionChange?: (id: string, x: number, y: number, width: number, height: number) => void;
    onContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
}

export const DiagramElement = ({
                                   id,
                                   path,
                                   posX,
                                   posY,
                                   onTextClick,
                                   textElements,
                                   onAddTextElement,
                                   isConnecting = false,
                                   onConnect,
                                   onPositionChange,
                                   onContextMenu,
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
            setShape((prev) => ({
                ...prev,
                width: node.width(),
                height: node.height(),
            }));
            if (onPositionChange && id) {
                onPositionChange(id, shape.x, shape.y, node.width(), node.height());
            }
        }
    };

    useEffect(() => {
        if (transformerRef.current && imageRef.current) {
            // Używamy bezpośrednio ref - nie wywołujemy getKonvaNode()
            transformerRef.current.nodes([imageRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleDoubleClick = () => {
        onAddTextElement(shape.x + shape.width / 2 - 50, shape.y + shape.height / 2 - 10);
    };

    const handleTextClick = (elemId: string, text: string) => {
        onTextClick(shape.x + shape.width / 2 - 50, shape.y + shape.height / 2 - 10, text, elemId);
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
                    if (isConnecting && onConnect && id) {
                        const centerX = shape.x + shape.width / 2;
                        const centerY = shape.y + shape.height / 2;
                        onConnect(id, centerX, centerY);
                    } else {
                        setIsSelected(!isSelected);
                    }
                }}
                onDblClick={handleDoubleClick}
                onDragEnd={updatePosition}
                onTransformEnd={updateSize}
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
                />
            )}
        </>
    );
};
