import { Image, Text, Transformer } from 'react-konva';
import { useState, useEffect, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Image as KonvaImage } from 'konva/lib/shapes/Image';
import { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';

export interface DiagramElementProps {
    path: string;
    posX: number,
    posY: number,
    onTextClick: (x: number, y: number, currentText: string, id: string) => void;
    textElements: { id: string, text: string, x: number, y: number }[];
    onAddTextElement: (x: number, y: number) => void;
}


export const DiagramElement = ({ path, posX, posY, onTextClick, textElements, onAddTextElement }: DiagramElementProps) => {
    const img = new window.Image();
    img.src = path;

    const [shape, setShape] = useState({
        x: posX,
        y: posY,
        width: img.width,
        height: img.height,
    });

    const imageRef = useRef<KonvaImage>(null);
    const transformerRef = useRef<KonvaTransformer>(null);
    const [isSelected, setIsSelected] = useState(false);

    const updatePosition = (e: KonvaEventObject<DragEvent>) => {
        setShape({
            ...shape,
            x: e.target.x(),
            y: e.target.y(),
        });
    };


    const updateSize = () => {
        const node = imageRef.current;
        if (node) {
            setShape({
                ...shape,
                width: node.width(),
                height: node.height(),
            });
        }

    };

    useEffect(() => {
        if (transformerRef.current && imageRef.current) {
            transformerRef.current.nodes([imageRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleDoubleClick = () => {
        onAddTextElement(shape.x + shape.width / 2 - 50, shape.y + shape.height / 2 - 10);
    };

    const handleTextClick = (id: string, text: string) => {
        onTextClick(shape.x + shape.width / 2 - 50, shape.y + shape.height / 2 - 10, text, id);
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
                onClick={() => setIsSelected(!isSelected)}
                onDblClick={handleDoubleClick}
                onDragEnd={updatePosition}
                onTransformEnd={updateSize}
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


            {transformerRef.current && (
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
