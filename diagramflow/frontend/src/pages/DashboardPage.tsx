import {Fragment, FunctionComponent, useEffect, useRef, useState} from 'react';
import '../styles/UserDashboard.css';
import {CarouselElement} from '../components/DashboardPage/CarouselElement.tsx';
import LoginBackground from '../assets/loginscreen_backgound.png';
import NetDiagram from '../assets/network.png';
import UMLDiagram from '../assets/uml.png';
import FlowchartDiagram from '../assets/flowchart.png';
import Icon from '../assets/search_icon.svg';
import Logo from '../assets/logo.svg';
import {Link} from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext.tsx";
import UserDropdown from "../components/DashboardPage/UserDrodown.tsx";
import axios from "axios";
import {getDiagramName} from "../components/DiagramPage/utils.ts";

const DashboardPage: FunctionComponent = () => {
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const {user} = useAuth();
  
  const [recentDiagrams, setRecentDiagrams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        const userId = user?.id
        const token = localStorage.getItem('flow_auth_token');
        if (!userId) {
          console.info('User ID is not available');
          return;
        }
        if (!token) {
          console.error('Token not found');
          return;
        }
        
        // Call to backend api to retrieve all serialised diagrams
        const response = await axios.get('/api/user/diagrams', {headers: {Authorization: `Bearer ${token}`}});
        const diagrams: string[] = []
        for (const entry of response.data) {
          diagrams.push(entry.data);
        }
        diagrams.reverse();
        setRecentDiagrams(diagrams);
      } catch (error) {
        console.error('Failed to fetch recent diagrams:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDiagrams();
    }
  }, [user]);
  
  const scrollRight = () => {
    const carousel = document.getElementById('carousel');
    if (carousel) {
      scrollInterval.current = setInterval(() => {
        carousel.scrollLeft += 10;
      }, 16);
    }
  };
  
  const scrollLeft = () => {
    const carousel = document.getElementById('carousel');
    if (carousel) {
      scrollInterval.current = setInterval(() => {
        carousel.scrollLeft -= 10;
      }, 16);
    }
  };
  
  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }
  };
  
  return (
    <div className="userdashboard">
      {/* Header */}
      <div className="header">
        <Link to={{pathname: "/"}}>
          <img className="header-logo" src={Logo} alt="FlowDraw Logo"/>
        </Link>
        
        <div className="headerRight">
          <div key="Home" className="button"
               onClick={() => window.location.href = '/'}>
            <div className="buttonText">Home</div>
          </div>
          <div className="searchBar">
            <input className="searchInput" type="text" placeholder="Search FlowDraw"/>
            <img className="icon" alt="Search icon" src={Icon}/>
          </div>
          <div className="genericAvatar">
            <UserDropdown/>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pageSection">
        <div
          className="pageContentWrapper"
          style={{backgroundImage: `url(${LoginBackground})`}}
        >
          {/* Welcome */}
          <div className="helloUsername">
            <span className="helloUsernameTxtContainer">
              <span>Welcome </span>
              <span className="draw">{user?.name || 'username'}</span>
                <span>!</span>
            </span>
          </div>
          
          {/* Recent Diagrams */}
          <div className="recentDiagramsWrapper">
            <div className="recentDiagramsSection">
              <div className="diagramText">Recent Diagrams</div>
              {loading ? (
                <div className="loadingText">Loading...</div>
              ) : (
                recentDiagrams.length > 0 ? (
                  <div className="carouselContainer">
                    <div className="carousel" id="carousel">
                      {recentDiagrams.map((diagram, index) => (
                        <Fragment key={index}>
                          <CarouselElement
                            diagramName={getDiagramName(diagram)}
                            diagramData={diagram}
                          />
                        </Fragment>
                      ))}
                    </div>
                    <div
                      className="carouselArrow carouselArrowLeft"
                      onMouseEnter={scrollLeft}
                      onMouseLeave={stopScroll}
                    >
                      ←
                    </div>
                    <div
                      className="carouselArrow carouselArrowRight"
                      onMouseEnter={scrollRight}
                      onMouseLeave={stopScroll}
                    >
                      →
                    </div>
                  </div>
                ) : (
                  <div className="loadingText">No diagrams yet</div>
                )
              )}
            </div>
          </div>
          
          
          {/* New Diagrams */}
          <div className="newDiagramWrapper">
            <div className="diagramText">New Diagram</div>
            <div className="newDiagramSection">
              <div className="newDiagramSectionItems">
                {[
                  {src: FlowchartDiagram, alt: 'Flowchart Diagram'},
                  {src: UMLDiagram, alt: 'UML Diagram'},
                  {src: NetDiagram, alt: 'Network Diagram'}
                ].map((item, index) => (
                  <Fragment key={index}>
                    <Link to={{pathname: "/diagrampage"}} state={{name: `New ${item.alt}`}}>
                      <div className="diagramBox">
                        <img src={item.src} alt={item.alt}/>
                      </div>
                      <p className="carousel-caption">{item.alt}</p>
                    </Link>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="footer">
        <img className="footer-logo" src={Logo} alt="FlowDraw Logo"/>
        <p className="footer-text">Copyright © 2025 FlowDraw. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
};

export {DashboardPage};
