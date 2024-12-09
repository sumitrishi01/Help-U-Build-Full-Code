import React, { useEffect, useState } from 'react';
import { GetData } from '../../utils/sessionStoreage';
import axios from 'axios';
import toast from 'react-hot-toast';

function RechargeHistory() {
    const Data = GetData('user');
    const token = GetData('token');
    const UserData = JSON.parse(Data);
    const [rechargeHistory, setRechargeHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const handleFetchUser = async () => {
        try {
            const UserId = UserData?._id;
            const { data } = await axios.get(`https://api.helpubuild.co.in/api/v1/user/${UserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const history = data.data?.rechargeHistory;
            setRechargeHistory(history.reverse() || []);
        } catch (error) {
            console.log('Internal server error in fetching User');
            toast.error('Unable to fetch recharge history. Please try again later.');
        }
    };

    useEffect(() => {
        handleFetchUser();
    }, []);

    // Calculate the paginated data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = rechargeHistory.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(rechargeHistory.length / itemsPerPage);

    return (
        <div className="my-5">
            <h2 className="text-center mb-4">Recharge History</h2>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Amount</th>
                            <th>Transaction ID</th>
                            <th>Payment Status</th>
                            <th>Payment Method</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((record, index) => (
                            <tr key={record._id}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>₹{record.amount}</td>
                                <td>{record.transactionId}</td>
                                <td>
                                    <span
                                        className={`badge ${record.PaymentStatus === 'paid'
                                            ? 'bg-success'
                                            : 'bg-danger'
                                            }`}
                                    >
                                        {record.PaymentStatus === 'paid'
                                            ? 'Payment Done'
                                            : 'Failed Transaction'}
                                    </span>
                                </td>
                                <td>{record.paymentMethod}</td>
                                <td>{new Date(record.time).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center">
                        <ul className="pagination">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    <button
                                        onClick={() => paginate(index + 1)}
                                        className="page-link"
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        </div>
    );
}

export default RechargeHistory;
