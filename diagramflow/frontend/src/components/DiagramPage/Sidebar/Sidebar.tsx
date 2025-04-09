import React, { useState } from 'react';
import './Sidebar.css';
import { svgFileNamesUML } from '../../../svgListUML';
import { svgFileNamesFlowChart } from '../../../svgListFlowChart';
import { svgFileNamesNetwork } from '../../../svgListNetwork';

interface CategoryItem {
    id: string;
    name: string;
    icon?: string;
}

interface Category {
    id: string;
    name: string;
    items: CategoryItem[];
}

const Sidebar: React.FC = () => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const networkDiagramItemsUML: CategoryItem[] = svgFileNamesUML
        .map((fileName) => {
            const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
            const iconPath = `src/assets/diagram-elements/UML/${fileName}.svg`;
            return {
                id: fileName,
                name: iconName,
                icon: iconPath
            };
        });
    const networkDiagramItemsFlowChart: CategoryItem[] = svgFileNamesFlowChart
        .map((fileName) => {
            const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
            const iconPath = `src/assets/diagram-elements/FlowChart/${fileName}.svg`;
            return {
                id: fileName,
                name: iconName,
                icon: iconPath
            };
        });

    const networkDiagramItemsNetwork: CategoryItem[] = svgFileNamesNetwork
        .map((fileName) => {
            const iconName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
            const iconPath = `src/assets/diagram-elements/Network/${fileName}.svg`;
            return {
                id: fileName,
                name: iconName,
                icon: iconPath
            };
        });

    const categories: Category[] = [
        {
            id: 'uml',
            name: '▶ UML Diagram',
            items: networkDiagramItemsUML
        },
        {
            id: 'uml2',
            name: '▶ FlowChart',
            items: networkDiagramItemsFlowChart
        },
        {
            id: 'uml3',
            name: '▶ Network Diagram',
            items: networkDiagramItemsNetwork
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
        <div className="sidebar_diagram">
            <div className="toolbar-search">
                <input type="text" placeholder="Search..." />
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
                        {expandedCategory === category.id && (
                            <div className="category-items">
                                {category.items.length > 0 ? (
                                    category.items.map(item => (
                                        <div key={item.id} className="category-item">
                                            {item.icon && (
                                                <img
                                                    src={item.icon}
                                                    alt={item.name}
                                                    className="item-icon"
                                                    style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                                    onError={(e) => {
                                                        console.error(`Błąd ładowania SVG: ${item.icon}`);
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            {item.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-category">No items</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;