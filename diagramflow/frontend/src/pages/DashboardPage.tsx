import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import settings from "../assets/placeholder_settings_icon.svg";
import UML from "../assets/placeholder_UML_icon.png";
import flowchart from "../assets/placeholder_flowchart.svg";
import network from "../assets/placeholder_network_diagram.svg"
import {CarouselElement} from "../components/CarouselElement.tsx";
import {diagramType} from "../types/diagramType.ts";
import {NewGraphElement} from "../components/NewGraphElement.tsx";
import {Footer} from "../components/Footer.tsx";

export function DashboardPage() {
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

  const carouselElements: number = 10;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-bl from-blue-100 to-blue-300 p-6 rounded-2xl shadow-xl">
      <div className="flex-grow space-y-10">
        {/* Header Section */}
        <div className="border p-4 rounded-xl shadow-sm" style={{backgroundColor: "#DDE1EBA6"}}>
          <div className="flex items-center justify-between text-xl font-bold text-gray-700">
            <span>{"Witaj <username>!"}</span>
            <img className="max-h-12 p-0.5 cursor-pointer" src={settings} alt="Ustawienia" />
          </div>
        </div>
        
        {/* Carousel Section */}
        <div className="bg-gray-100 border p-4 rounded-xl shadow-sm space-y-8" style={{backgroundColor: "#DDE1EBA6"}}>
          <div className="text-xl font-bold text-gray-700">Ostatnie diagramy:</div>
          <div>
            <Carousel draggable={false} responsive={responsive}>
              {Array.from({ length: carouselElements }, (_, index) => (
                <CarouselElement num={index + 1} />
              ))}
            </Carousel>
          </div>
        </div>
        
        {/* New Diagram Section */}
        <div className="bg-gray-100 border p-4 rounded-xl shadow-sm" style={{backgroundColor: "#DDE1EBA6"}}>
          <div className="text-xl font-bold text-gray-700">Nowy diagram:</div>
          <div className="flex flex-row space-x-10 p-4">
            <NewGraphElement image={UML} type={diagramType.UML} />
            <NewGraphElement image={flowchart} type={diagramType.Flowchart} />
            <NewGraphElement image={network} type={diagramType.Network} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
