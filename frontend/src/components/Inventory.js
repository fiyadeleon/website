import React, { useState, useEffect } from 'react';
import '../styles/Inventory.css';

let API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
let API_KEY = process.env.REACT_APP_API_KEY;

function generateProductId() {
    const randomString = Math.random().toString(36).substr(2, 6).toUpperCase(); 
    const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, ''); 
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
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            alert('Error fetching products!');
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isModalOpen) {
                toggleModal();
            }
        };

        window.addEventListener('keydown', handleEsc);

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

        if (!isAlreadySelected) {
            console.log(`Selected product: ${product_name}`);
        }

        setSelectedCheckboxes((prevSelected) => {
            if (isAlreadySelected) {
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
    
                const response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                    method: 'DELETE',
                    headers: {
                        'x-api-key': API_KEY,
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
                alert('Error deleting product(s)!');
                console.error('Error deleting products:', error);
            } finally {
                setCurrentPage(1);
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
        console.log(`To update: ${product.id}`)
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
                    response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                        method: 'PUT',
                        headers: {
                            'x-api-key': API_KEY,
                        },
                        body: JSON.stringify(newProduct)
                    });
                } else {
                    response = await fetch(`${API_ENDPOINT}/item?resource=inventory`, {
                        method: 'POST',
                        headers: {
                            'x-api-key': API_KEY,
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
                alert('Error submitting product!');
                console.error('Error submitting product:', error);
            } finally {
                setIsLoading(false);
                fetchProducts();
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
        if (activeTab === 'onHand') {
            return product.stock > 0;
        } else if (activeTab === 'outOfStock') {
            return product.stock === 0;
        } else {
            return true;
        }
    })
    .filter((product) => {
        return (
            (product.id && product.id.toLowerCase().includes(searchQuery)) ||
            (product.product_name && product.product_name.toLowerCase().includes(searchQuery)) ||
            (product.category && product.category.toLowerCase().includes(searchQuery))
        );
    });

    const totalPages = Math.ceil(productsToDisplay.length / pageSize);
    const paginatedProducts = productsToDisplay.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
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
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    <div className="loading-icon">
                                        <i className="fas fa-spinner fa-spin fa-3x"></i>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map((product, index) => {
                                const absoluteIndex = (currentPage - 1) * pageSize + index;

                                return (
                                    <tr key={absoluteIndex}>
                                        <td onClick={() => handleCheckboxChange(absoluteIndex, product.product_name)} style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(absoluteIndex, product.product_name)}
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
                                                onClick={() => handleEdit(index)}
                                                title="Edit Product"
                                            >
                                                edit_note
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="lower-table">
                {selectedCheckboxes.length > 0 && (
                    <button onClick={handleClearAll} className="clear-all-button">Clear All</button>
                )}
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
                                        placeholder="Enter product name"
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
                                        placeholder="Enter product category"
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
                                        placeholder="Enter stock count"
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
                                        placeholder="Select the stock's unit of measurement"
                                        value={productDetails.unit}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="" disabled>Select Unit of Measurement</option>
                                        <option value="piece">Piece</option>
                                        <option value="box">Box</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Enter the stock's price"
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
    );
}

export default Inventory;
