import {Line} from "react-konva";
import {connection} from "../connection.ts";
import {FC} from "react";

interface JaggedLineProps {
  coords: [number, number, number, number];
  element: connection;
}

const JaggedLine: FC<JaggedLineProps> = ({coords, element}) => {
  // TODO : Implement the jagged line drawing logic based on coords and connection element
  
  // logging the coordinates and element so the compiler doesn't complain
  console.log(coords)
  console.log(element)
  
  return (
    <Line/>
  );
}

export default JaggedLine;