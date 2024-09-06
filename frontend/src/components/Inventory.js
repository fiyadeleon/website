import React, { useState, useEffect } from 'react';
import UserPanel from './UserPanel';
import '../styles/Inventory.css';

function generateProductId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase(); // Random string
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
    return `PROD-${randomString}-${dateString}`;
}

function Inventory() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('Sort');
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); 
    const [editProductIndex, setEditProductIndex] = useState(null);
    const [stockError, setStockError] = useState('');
    const [priceError, setPriceError] = useState('');
    const [productDetails, setProductDetails] = useState({ id: '', product_name: '', category: '', stock: '', price: '', unit: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('onHand');
    const [products, setProducts] = useState([
        {"id": "PROD-CA1234-20240101", "product_name": "Engine Oil", "category": "Lubricants", "stock": 120, "unit": "liter", "price": 450.00},
        {"id": "PROD-BR5678-20240101", "product_name": "Brake Pads", "category": "Brakes", "stock": 75, "unit": "set", "price": 1500.50},
        {"id": "PROD-TY9101-20240101", "product_name": "All-Season Tires", "category": "Tires", "stock": 40, "unit": "piece", "price": 5500.00},
        {"id": "PROD-BT2345-20240101", "product_name": "Car Battery", "category": "Batteries", "stock": 65, "unit": "piece", "price": 3200.00},
        {"id": "PROD-FL6789-20240101", "product_name": "Fuel Filter", "category": "Filters", "stock": 200, "unit": "piece", "price": 300.00},
        {"id": "PROD-WP2345-20240102", "product_name": "Windshield Wiper", "category": "Accessories", "stock": 150, "unit": "pair", "price": 600.00},
        {"id": "PROD-OF5678-20240102", "product_name": "Oil Filter", "category": "Filters", "stock": 95, "unit": "piece", "price": 350.00},
        {"id": "PROD-RB6789-20240103", "product_name": "Radiator Belt", "category": "Belts", "stock": 50, "unit": "piece", "price": 1200.00},
        {"id": "PROD-EX7890-20240103", "product_name": "Exhaust Pipe", "category": "Exhaust", "stock": 30, "unit": "piece", "price": 8000.00},
        {"id": "PROD-BR2345-20240104", "product_name": "Brake Fluid", "category": "Fluids", "stock": 250, "unit": "liter", "price": 400.00},
        {"id": "PROD-LB1234-20240105", "product_name": "LED Headlights", "category": "Lighting", "stock": 80, "unit": "pair", "price": 7000.00},
        {"id": "PROD-AC5678-20240105", "product_name": "Air Conditioning Filter", "category": "Filters", "stock": 100, "unit": "piece", "price": 1200.00},
        {"id": "PROD-TR6789-20240106", "product_name": "Transmission Fluid", "category": "Fluids", "stock": 60, "unit": "liter", "price": 1600.00},
        {"id": "PROD-SP8901-20240106", "product_name": "Spark Plug", "category": "Engine Parts", "stock": 220, "unit": "piece", "price": 300.00},
        {"id": "PROD-TB9012-20240107", "product_name": "Timing Belt", "category": "Belts", "stock": 35, "unit": "piece", "price": 2500.00}
    ]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isLoading, setIsLoading] = useState(false);

    // useEffect(() => {
    //     const fetchProducts = async () => {
    //         try {
    //             const response = await fetch('https://out3aiyu9d.execute-api.ap-southeast-1.amazonaws.com/v1/inventory', {
    //                 headers: {
    //                     'x-api-key': '7JdX88oUgP23Yurbs9ABF75S9R4JxcqS9FqZbt1B'
    //                 }
    //             });
    //             if (!response.ok) {
    //                 console.log(response)
    //                 throw new Error('Network response was not ok');
    //             }
    //             const data = await response.json();
    //             setProducts(data);
    //         } catch (error) {
    //             console.error('Error fetching products:', error);
    //         }
    //     };

    //     fetchProducts();
    // }, []);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isModalOpen) {
                toggleModal(); // Close the modal when 'Escape' is pressed
            }
        };

        window.addEventListener('keydown', handleEsc);

        // Clean up the event listener when the component is unmounted or modal state changes
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isModalOpen]);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSortSelection = (sortOption) => {
        setSelectedSort(sortOption);
        setDropdownOpen(false);
    
        const sortedProducts = [...products];
    
        switch (sortOption) {
            case 'Price: High to Low':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'Price: Low to High':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'Stock: High to Low':
                sortedProducts.sort((a, b) => b.stock - a.stock);
                break;
            case 'Stock: Low to High':
                sortedProducts.sort((a, b) => a.stock - b.stock);
                break;
            default:
                break;
        }
    
        setProducts(sortedProducts);
    };

    const handleCheckboxChange = (index, product_name) => {
        const isAlreadySelected = selectedCheckboxes.includes(index);

        if (isAlreadySelected) {
            console.log(`Deselected product: ${product_name}`);
        } else {
            console.log(`Selected product: ${product_name}`);
        }
        setSelectedCheckboxes((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((item) => item !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    const handleDeleteConfirmation = async (confirm) => {
        if (confirm) {
            try {
                const selectedProducts = selectedCheckboxes.map(index => {
                    const product = products[index];
                    return { id: product.id };
                });
    
                const response = await fetch('https://api.com', {
                    method: 'DELETE',
                    headers: {
                        'x-api-key': 'test'
                    },
                    body: JSON.stringify(selectedProducts)
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete selected products');
                }
    
                const result = await response.json();
                console.log('Deletion result:', result);
    
                setProducts((prevProducts) =>
                    prevProducts.filter((_, index) => !selectedCheckboxes.includes(index))
                );
                setSelectedCheckboxes([]);
    
            } catch (error) {
                console.error('Error deleting products:', error);
            }
        } else {
            setSelectedCheckboxes([]);
        }
    };    

    const handleClearAll = () => {
        setSelectedCheckboxes([]);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (!isModalOpen) {
            setIsEditMode(false);
            setEditProductIndex(null);
            setProductDetails({ id: '', product_name: '', category: '', stock: '', price: '', unit: '' });
            setStockError('');
            setPriceError('');
        }
    };

    const handleEdit = (index) => {
        const product = paginatedProducts[index];
        setProductDetails({
            id: product.id,
            product_name: product.product_name,
            category: product.category,
            unit: product.unit,
            stock: product.stock.toString(),
            price: product.price.toString(),
        });
        setIsEditMode(true);
        setEditProductIndex(index);
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductDetails({
            ...productDetails,
            [name]: value,
        });
    };

    const validateForm = () => {
        let isValid = true;

        if (Number(productDetails.stock) < 0 || productDetails.stock.includes('-')) {
            setStockError('Stock cannot be negative');
            isValid = false;
        } else {
            setStockError('');
        }

        if (Number(productDetails.price) < 0 || productDetails.price.includes('-')) {
            setPriceError('Price cannot be negative');
            isValid = false;
        } else {
            setPriceError('');
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (validateForm()) {
            setIsLoading(true);
            const newProductId = isEditMode ? productDetails.id : generateProductId();
    
            const newProduct = {
                id: newProductId,
                product_name: productDetails.product_name.trim(),
                category: productDetails.category.trim(),
                unit: productDetails.unit,
                stock: Number(productDetails.stock),
                price: parseFloat(productDetails.price),
            };

            try {
                let response;

                if (isEditMode && editProductIndex !== null) {
                    const response = await fetch('https://api.com', {
                        method: 'PUT',
                        headers: {
                            'x-api-key': 'test'
                        },
                        body: JSON.stringify(newProduct)
                    });
                } else {
                    const response = await fetch('https://api.com', {
                        method: '{POST}',
                        headers: {
                            'x-api-key': 'test'
                        },
                        body: JSON.stringify(newProduct)
                    });
                }

                if (!response.ok) {
                    throw new Error(isEditMode ? 'Failed to update product' : 'Failed to add product');
                }
    
                const result = await response.json();
                console.log(isEditMode ? 'Product successfully updated:' : 'Product successfully added:', result);
    
                if (isEditMode && editProductIndex !== null) {
                    const productIndex = products.findIndex((product) => product.id === productDetails.id);

                    setProducts((prevProducts) =>
                        prevProducts.map((product, index) =>
                            index === productIndex ? newProduct : product
                        )
                    );
                } else {
                    setProducts((prevProducts) => [...prevProducts, newProduct]);
                }
    
                toggleModal();
    
            } catch (error) {
                console.error('Error submitting product:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };    

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const productsToDisplay = products
    .filter((product) => {
        // First apply the tab-specific filter
        if (activeTab === 'onHand') {
            return product.stock > 0;
        } else if (activeTab === 'outOfStock') {
            return product.stock === 0;
        } else {
            return true;
        }
    })
    .filter((product) => {
        // Then apply the search query filter
        return (
            (product.id && product.id.toLowerCase().includes(searchQuery)) ||
            (product.product_name && product.product_name.toLowerCase().includes(searchQuery)) ||
            (product.category && product.category.toLowerCase().includes(searchQuery))
        );
    });

    const totalPages = Math.ceil(productsToDisplay.length / pageSize);
    const paginatedProducts = productsToDisplay.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <UserPanel>
            <div className="inventory">
                <div className="inventory-header">
                    <h1>INVENTORY</h1>
                    {selectedCheckboxes.length > 0 && (
                        <div className="notification-box">
                            <p>{selectedCheckboxes.length} item(s) selected. Delete selected?</p>
                            <div className="notification-actions">
                                <button onClick={() => handleDeleteConfirmation(true)} className="yes-button">Yes</button>
                                <button onClick={() => handleDeleteConfirmation(false)} className="no-button">No</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="inventory-info">
                    <div className="inventory-status">
                        <button
                            className={`status-button on-hand ${activeTab === 'onHand' ? 'active' : ''}`}
                            onClick={() => setActiveTab('onHand')}
                        >
                            <span>On Hand</span>
                            <span className="on-hand-count">{products.filter(p => p.stock > 0).length}</span>
                        </button>
                        <button
                            className={`status-button out-of-stock ${activeTab === 'outOfStock' ? 'active' : ''}`}
                            onClick={() => setActiveTab('outOfStock')}
                        >
                            <span>Out of Stock</span>
                            <span className="out-of-stock-count">{products.filter(p => p.stock === 0).length}</span>
                        </button>
                    </div>
                </div>
                <div className="sort-container">
                    <button className="sort-button" onClick={toggleDropdown}>
                        {selectedSort}
                        <span className="material-symbols-outlined">
                            {dropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                        </span>
                    </button>
                    <div className={`dropdown-menu ${dropdownOpen ? 'open' : 'closed'}`}>
                        <div onClick={() => handleSortSelection('Price: High to Low')}>Price: High to Low</div>
                        <div onClick={() => handleSortSelection('Price: Low to High')}>Price: Low to High</div>
                        <div onClick={() => handleSortSelection('Stock: High to Low')}>Stock: High to Low</div>
                        <div onClick={() => handleSortSelection('Stock: Low to High')}>Stock: Low to High</div>
                    </div>
                    <div className="search-container">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input
                            type="text"
                            placeholder="Search products"
                            className="search-input"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <span
                            className="material-symbols-outlined info-icon"
                            data-tooltip="Only Product Name and Category are searchable."
                        >
                            info
                        </span>
                    </div>
                    <div className="inventory-actions">
                        <button className="add-product-button" onClick={toggleModal}>+ Add New Product</button>
                    </div>
                </div>
                <div className="inventory-table">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>INVENTORY NO.</th>
                                <th>PRODUCT NAME</th>
                                <th>CATEGORY</th>
                                <th>STOCK</th>
                                <th>UNIT</th>
                                <th>PRICE</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((product, index) => {
                                // Calculate the correct absolute index in the products array
                                const absoluteIndex = (currentPage - 1) * pageSize + index;

                                return (
                                    <tr key={absoluteIndex}>
                                        <td onClick={() => handleCheckboxChange(absoluteIndex, product.product_name)} style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(absoluteIndex)}
                                                checked={selectedCheckboxes.includes(absoluteIndex)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.product_name}</td>
                                        <td>{product.category}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.unit}</td>
                                        <td>₱{parseFloat(product.price).toFixed(2)}</td>
                                        <td>
                                            <span
                                                className="material-symbols-outlined edit-icon"
                                                onClick={() => handleEdit(index)} // Use absoluteIndex here
                                                title="Edit Product"
                                            >
                                                edit_note
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                <div className="lower-table">
                    <div className="clear-all-container">
                        {selectedCheckboxes.length > 0 && (
                            <button onClick={handleClearAll} className="clear-all-button">Clear All</button>
                        )}
                    </div>
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <span
                                key={i}
                                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </span>
                        ))}
                    </div>
                </div>

                {isModalOpen && (
                    <>
                        <div className="modal-overlay" onClick={toggleModal}></div>
                        <div className="modal">
                            <div className="modal-content">
                                <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input
                                            type="text"
                                            name="product_name"
                                            value={productDetails.product_name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={productDetails.category}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={productDetails.stock}
                                            onChange={handleInputChange}
                                            required
                                            className={stockError ? 'input-error' : ''}
                                        />
                                        {stockError && <p className="error-message">{stockError}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select 
                                            className="inventory-select"
                                            name="unit"
                                            value={productDetails.unit}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="piece">Piece</option>
                                            <option value="box">Box</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={productDetails.price}
                                            onChange={handleInputChange}
                                            required
                                            className={priceError ? 'input-error' : ''}
                                            step="0.01"
                                        />
                                        {priceError && <p className="error-message">{priceError}</p>}
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={toggleModal}>Cancel</button>
                                        <button type="submit" disabled={isLoading}>
                                            {isLoading 
                                                ? (isEditMode ? 'Updating Product...' : 'Adding Product...') 
                                                : (isEditMode ? 'Update Product' : 'Add Product')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </UserPanel>
    );
}

export default Inventory;
