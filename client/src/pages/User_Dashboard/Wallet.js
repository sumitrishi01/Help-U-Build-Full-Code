import React, { useState } from 'react';
import './Wallet.css';  // Create a new CSS file for custom styling

function Wallet({ data }) {
    const [filteredData, setFilteredData] = useState(data?.chatTransition || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Number of items to display per page

    const calculateDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const durationInSeconds = (endDate - startDate) / 1000; // Difference in seconds
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes} min ${seconds} sec`;
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchTerm(query);
        setFilteredData(
            data?.chatTransition.filter(transition =>
                transition.user?.name.toLowerCase().includes(query)
            )
        );
    };

    const handleSort = () => {
        const sortedData = [...filteredData].sort((a, b) => {
            const dateA = new Date(a.Date);
            const dateB = new Date(b.Date);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setFilteredData(sortedData);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container wallet-list mt-4">
            <div className="d-flex justify-content-between mb-3">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search by Name"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button className="btn btn-info sortbtn" onClick={handleSort}>
                    Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
            </div>

            <div className="table-container">
                <table className="table table-bordered table-striped custom-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Deduction (₹)</th>
                            <th>Date</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((transition, index) => (
                            <tr key={index}>
                                <td>
                                    <img
                                        src={transition?.user?.ProfileImage?.imageUrl || 'default-profile.jpg'}
                                        alt="User"
                                        className="profile-img"
                                    />
                                    <span className="ml-2">{transition.user?.name}</span>
                                </td>
                                <td>{transition.deductionAmount ? transition.deductionAmount.toFixed(2) : '0.00'}</td>
                                <td>{new Date(transition.Date).toLocaleString()}</td>
                                <td>{calculateDuration(transition.startChatTime, transition.endingChatTime)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination">
                    {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, index) => (
                        <button
                            key={index}
                            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Wallet;
