// connectionDetector.ts
import { connection } from "../connection";

export enum ConnectionType {
    SIMPLE = 'simple',
    ONE = 'one',
    ONE_AND_ONLY_ONE = 'one-and-only-one',
    ONE_OR_MANY = 'one-or-many',
    ARROW = 'arrow',
    BIDIRECTIONAL_ARROW = 'bidirectional-arrow',
    REQUIRED_INTERFACE = 'required-interface',
}

export interface ConnectionEndStyle {
    type: ConnectionType;
    drawEnd: (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => void;
}

// Helper function to detect connection type from file path
export function detectConnectionType(path: string): ConnectionType {
    if (path.includes('conn-simple')) {
        return ConnectionType.SIMPLE;
    } else if (path.includes('conn-one-and-only-one')) {
        return ConnectionType.ONE_AND_ONLY_ONE;
    } else if (path.includes('conn-one-or-many')) {
        return ConnectionType.ONE_OR_MANY;
    } else if (path.includes('conn-one')) {
        return ConnectionType.ONE;
    } else if (path.includes('conn-bidirectional-arrow')) {
        return ConnectionType.BIDIRECTIONAL_ARROW;
    } else if (path.includes('conn-arrow')) {
        return ConnectionType.ARROW;
    } else if (path.includes('conn-required-interface')) {
        return ConnectionType.REQUIRED_INTERFACE;
    }

    return ConnectionType.SIMPLE;
}

// Draw a line with the correct endpoints based on type
export function drawConnectionEnds(ctx: CanvasRenderingContext2D, conn: connection, startX: number, startY: number, endX: number, endY: number): void {
    // Calculate angle for start and end points
    const startAngle = Math.atan2(endY - startY, endX - startX);
    const endAngle = Math.atan2(startY - endY, startX - endX);

    // Get connection type from the ID
    const startType = conn.getStartConnectionType();
    const endType = conn.getEndConnectionType();

    // Draw appropriate end markers
    if (startType) {
        drawEndMarker(ctx, startType, startX, startY, startAngle);
    }

    if (endType) {
        drawEndMarker(ctx, endType, endX, endY, endAngle);
    }
}

// Draw specific end marker based on connection type
function drawEndMarker(ctx: CanvasRenderingContext2D, type: ConnectionType, x: number, y: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    switch (type) {
        case ConnectionType.ONE:
            drawOneLine(ctx);
            break;
        case ConnectionType.ONE_AND_ONLY_ONE:
            drawOneAndOnlyOne(ctx);
            break;
        case ConnectionType.ONE_OR_MANY:
            drawOneOrMany(ctx);
            break;
        case ConnectionType.ARROW:
            drawArrow(ctx);
            break;
        case ConnectionType.BIDIRECTIONAL_ARROW:
            drawArrow(ctx);
            break;
        case ConnectionType.REQUIRED_INTERFACE:
            drawRequiredInterface(ctx);
            break;
        default:
            // Simple connection has no end markers
            break;
    }

    ctx.restore();
}

// Draw a single line perpendicular to the connection
function drawOneLine(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();
}

// Draw two parallel lines perpendicular to the connection
function drawOneAndOnlyOne(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    // First line
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    // Second line
    ctx.moveTo(-5, -10);
    ctx.lineTo(-5, 10);
    ctx.stroke();
}

// Draw one line with two diagonal lines (crow's foot)
function drawOneOrMany(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    // Vertical line
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    // Diagonal lines (crow's foot)
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -10);
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, 10);
    ctx.stroke();
}

// Draw an arrow
function drawArrow(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -7);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.fill();
}

// Draw a required interface symbol (half circle)
function drawRequiredInterface(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(0, 0, 10, -Math.PI/2, Math.PI/2, false);
    ctx.stroke();
}