import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import diagram from "./assets/placeholder_diagram.png";
import settings from "./assets/placeholder_settings_icon.svg";
import UML from "./assets/placeholder_UML_icon.png";
import flowchart from "./assets/placeholder_flowchart.svg";
import network from "./assets/placeholder_network_diagram.svg"

export function Dashboard() {
  // W zależności od (chyba) szerokosci ekranu carousel wyswietla rozna ilosc elementow
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
      slidesToSlide: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gradient-to-bl from-blue-100 to-blue-300 p-6 rounded-2xl shadow-xl">
      <div className="space-y-8 bg-gray-100 p-6 rounded-2xl shadow-xl"> {/* Space between divs */}

        {/* Header Section */}
        <div className="border-b-blue-300 border p-4 rounded-xl bg-gradient-to-bl from-blue-100 to-blue-300 shadow-sm">
          <div className="flex items-center justify-between text-xl font-bold text-gray-700">
            <span>{"Witaj <username>!"}</span>
            <img className="max-h-10 border-2 p-0.5 rounded-md" src={settings} alt="Ustawienia" />
          </div>
        </div>

        {/* Carousel Section */}
        <div className="border-b-blue-300 border p-4 rounded-xl bg-gradient-to-bl from-blue-100 to-blue-300 shadow-sm space-y-8">
          <div className="text-xl font-bold text-gray-700">Ostatnie diagramy:</div>
          <div className="">
            <Carousel responsive={responsive}>
              <CarouselElement num={1} />
              <CarouselElement num={2} />
              <CarouselElement num={3} />
              <CarouselElement num={4} />
              <CarouselElement num={5} />
            </Carousel>
          </div>
        </div>

        {/* New Diagram Section */}
        <div className="border-b-blue-300 border p-4 rounded-xl bg-gradient-to-bl from-blue-100 to-blue-300 shadow-sm">
          <div className="text-xl font-bold text-gray-700">Nowy diagram:</div>
          <div className="flex flex-row space-x-10 p-4">
            <NewGraphElement image={UML} type={diagramType.UML} />
            <NewGraphElement image={flowchart} type={diagramType.Flowchart} />
            <NewGraphElement image={network} type={diagramType.Network} />
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-200 text-center text-sm text-gray-600 py-2 border-t rounded-2xl flex flex-row justify-between">
        <div className="mx-8">
          <span className="font-bold text-blue-500">flow</span>
          <span className="text-black">draw.</span>
        </div>
        <div>
          Copyright © 2025 FlowDraw. Wszelkie prawa zastrzeżone.
        </div>
        <div className="mx-16"/>
      </div>
    </div>
  );
}


function CarouselElement({num}: {num: number}) {
  const handleOnClick = () => {

  }

  return (
    <div className={"w-[90%] mx-auto cursor-pointer border-b-blue-300 border-4 p-4 rounded-xl flex flex-col"} onClick={handleOnClick}>
      <img src={diagram} alt={"diagram " + num} />
      <p className="text-xl text-black flex flex-row justify-center">Diagram {num}</p>
    </div>
  )
}

enum diagramType {
  UML,
  Flowchart,
  Network,
}

function NewGraphElement({image, type}: {image: string, type: diagramType}) {
  const handleOnClick = () => {

  }

  return (
    <div className="border-4 rounded-xl p-4 items-center justify-between space-x-8 cursor-pointer" onClick={handleOnClick}>
      <img className="max-h-32" src={image} alt="Diagram sieciowy" />
      <div className="text-xl font-bold text-gray-700">{
        type === diagramType.UML
          ? "Diagram UML"
          : type === diagramType.Flowchart
            ? "Flowchart"
            : type === diagramType.Network
              ? "Diagram sieciowy"
              : ""
      }</div>
    </div>
  )
}
