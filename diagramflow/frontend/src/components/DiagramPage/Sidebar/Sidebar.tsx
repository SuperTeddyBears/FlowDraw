import React, { useState } from 'react';
import './Sidebar.css';

interface CategoryItem {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    items: CategoryItem[];
}

const Sidebar: React.FC = () => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const categories: Category[] = [
        {
            id: 'uml',
            name: '▶ UML Diagram',
            items: []
        },
        {
            id: 'uml2',
            name: '▶ FlowChart',
            items: []
        },
        {
            id: 'uml3',
            name: '▶ Network Diagram',
            items: []
        }
    ];

    const toggleCategory = (categoryId: string) => {
        if (expandedCategory === categoryId) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categoryId);
        }
    };

    return (
        <div className="sidebar">
            <div className="toolbar-search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="categories">
                {categories.map(category => (
                    <div key={category.id} className="category">

                        <div

                            className="category-header"
                            onClick={() => toggleCategory(category.id)}
                        >

                            {category.name}
                        </div>
                        {expandedCategory === category.id && (
                            <div className="category-items">
                                {category.items.map(item => (
                                    <div key={item.id} className="category-item">
                                        {item.name}
                                    </div>
                                ))}
                                {category.items.length === 0 && (
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