import {Layer, Line} from "react-konva";

export const GridLayer = ({density}: {density: number}) => {
  return (
    <Layer>
      {Array.from({length: Math.ceil(window.innerWidth / density)}).map((_, i) => (
        <Line
          key={`v-line-${i}`}
          points={[density * i, 0, density * i, window.innerHeight]}
          stroke="black"
          opacity={0.2}
        />
      ))}
      {Array.from({length: Math.ceil(window.innerHeight / density)}).map((_, i) => (
        <Line
          key={`h-line-${i}`}
          points={[0, density * i, window.innerWidth, density * i]}
          stroke="black"
          opacity={0.2}
        />
      ))}
    </Layer>
  )
}
