import { Image, Circle } from "react-konva";
import useImage from 'use-image';
import { getEndpointImagePath } from "./ConnectionUtils.ts";

interface ConnectionEndpointProps {
    x: number;
    y: number;
    angle: number;
    imageName: string;
}

const ConnectionEndpoint = ({ x, y, angle, imageName }: ConnectionEndpointProps) => {
    // Constants for the endpoint dimensions
    const imageWidth = 50;
    const imageHeight = 50;

    // If no image is specified, render a circle
    if (!imageName) {
        return <Circle x={x} y={y} radius={3} fill="black" />;
    }

    // Get the full path for the image
    const imagePath = getEndpointImagePath(imageName);

    // Load the SVG image
    const [image] = useImage(imagePath);

    if (!image) {
        // Fallback to circle if image fails to load
        return <Circle x={x} y={y} radius={3} fill="black" />;
    }

    return (
        <Image
            x={x}
            y={y}
            image={image}
            width={imageWidth}
            height={imageHeight}
            rotation={angle}
            offsetX={imageWidth}
            offsetY={imageHeight/2}
        />
    );
};

export default ConnectionEndpoint;