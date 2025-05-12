import React, {useState, forwardRef} from 'react';
import './Sidebar.css';
import {svgFileNamesUML} from '../../../svgListUML';
import {svgFileNamesFlowChart} from '../../../svgListFlowChart';
import {svgFileNamesNetwork} from '../../../svgListNetwork';
import {svgFileNamesEntityRelationship} from "../../../svgListEntityRelationship.ts";

interface CategoryItem {
  id: string;
  name: string;
  iconPath: string;
}

interface Category {
  id: string;
  name: string;
  items: CategoryItem[];
}

interface SidebarProps {
    selectedType: 'uml' | 'flowchart' | 'network';
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ selectedType }, ref) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const networkDiagramItemsUML: CategoryItem[] = svgFileNamesUML
    .map((fileName) => {
      const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const iconPath = `src/assets/diagram-elements/UML/${fileName}.svg`;
      return {
        id: fileName,
        name: iconName,
        iconPath: iconPath
      };
    });
  const networkDiagramItemsFlowChart: CategoryItem[] = svgFileNamesFlowChart
    .map((fileName) => {
      const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const iconPath = `src/assets/diagram-elements/FlowChart/${fileName}.svg`;
      return {
        id: fileName,
        name: iconName,
        iconPath: iconPath
      };
    });
  
  const networkDiagramItemsNetwork: CategoryItem[] = svgFileNamesNetwork
    .map((fileName) => {
      const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      const iconPath = `src/assets/diagram-elements/Network/${fileName}.svg`;
      return {
        id: fileName,
        name: iconName,
        iconPath: iconPath
      };
    });
  
  const networkDiagramItemsEntityRelationship: CategoryItem[] = svgFileNamesEntityRelationship
        .map((fileName) => {
            const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
            const iconPath = `src/assets/diagram-elements/Entity-Relationship/${fileName}.svg`;
            return {
                id: fileName,
                name: iconName,
                iconPath: iconPath
            };
        });


    const typeMap = {
        uml: {
            id: 'uml',
            name: '▶ UML Diagram',
            items: networkDiagramItemsUML
        },
        flowchart: {
            id: 'uml2',
            name: '▶ FlowChart',
            items: networkDiagramItemsFlowChart
        },
        network: {
            id: 'uml3',
            name: '▶ Network Diagram',
            items: networkDiagramItemsNetwork
        }
    };

    const categories: Category[] = [
        typeMap[selectedType],
        {
            id: 'conns',
            name: '▶ Connections',
            items: [{
                id: 'line-simple',
                name: 'simple line',
                iconPath: 'src/assets/diagram-elements/connections/conn-simple.svg'
            }]
        }
    ];
  
  const categories: Category[] = [
    typeMap[selectedType],
    {
      id: 'conns',
      name: '▶ Connections',
      items: networkDiagramItemsEntityRelationship
    }
  ];
  
  const toggleCategory = (categoryId: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };
  
  return (
    <div className="sidebar_diagram" ref={ref}>
      <div className="toolbar-search">
        <input type="text" placeholder="Search..."/>
      </div>
      <div className="categories">
        {categories.map(category => (
          <div key={category.id} className="category">
            <div
              className="category-header"
              onClick={(event) => toggleCategory(category.id, event)}
            >
              {category.name}
            </div>
            <div
              className={`category-items ${
                expandedCategory === category.id ? 'expanded' : 'collapsed'
              }`}
            >
              {category.items.length > 0 ? (
                category.items.map(item => (
                  <div key={item.id} className="category-item">
                    {item.iconPath && (
                      <img
                        src={item.iconPath}
                        alt={item.name}
                        className="item-icon"
                        style={{width: '40px', height: '40px'}}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.iconPath || '');
                        }}
                        onError={(e) => {
                          console.error(`Błąd ładowania SVG: ${item.iconPath}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-category">No items</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default Sidebar;