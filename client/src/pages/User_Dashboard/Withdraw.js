import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function Withdraw({ data }) {
  // console.log("data",data)
  const providerId = data._id;
  const [withdraw, setWithdraw] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFetchWithdraw = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/v1/get-withdrawals-by-providerid/${providerId}`)
      // console.log("data", data.data)
      const alldata = data.data;
      const reverse = [...alldata].reverse(); // Creates a new reversed array
      setWithdraw(reverse);
    } catch (error) {
      console.log("Internal server error", error)
      toast.error(error?.response?.data?.errors?.[0] || error?.response?.data?.message || "Please try again later");
    }
  }

  useEffect(() => {
    handleFetchWithdraw();
  }, [])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = withdraw.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container wallet-list mt-4">
      <div className="table-container">
        <table className="table table-bordered table-striped custom-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Commission Percent</th>
              <th>Commission Amount</th>
              <th>Final Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.amount ? item.amount.toFixed(2) : '0.00'}</td>
                <td>{item.commissionPercent ? item.commissionPercent : '0'}%</td>
                <td>₹{item.commission ? item.commission : '0'}</td>
                <td>₹{item.finalAmount ? item.finalAmount : '0'}</td>
                <td>{item.status}</td>
                {/* <td>{new Date(item.Date).toLocaleString()}</td> */}
                {/* <td>{calculateDuration(item.startChatTime, transition.endingChatTime)}</td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: Math.ceil(withdraw.length / itemsPerPage) }).map((_, index) => (
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
  )
}

export default Withdraw
