import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { socket } from '../lib/socket';

const SellerDashboard = () => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();

    socket.on('order_updated', (updatedOrder: any) => {
        // In a real app, we should check if this order belongs to this seller
        // For simplicity, we just re-fetch or update if it exists in our list
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    socket.on('order_deleted', (deletedId: string) => {
        setOrders(prev => prev.filter(o => o._id !== deletedId));
    });

    // Also listen for new assignments if you implemented that socket event
    // socket.on('new_assignment', fetchOrders);

    return () => {
      socket.off('order_updated');
      socket.off('order_deleted');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/v1/seller/orders');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching seller orders", error);
    }
  };

  const handleNextStage = async (id: string) => {
    try {
      await api.patch(`/v1/orders/${id}/next-stage`);
      // Socket will handle the UI update
    } catch (error) {
      alert('Failed to update stage');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/v1/orders/${id}`);
      // Socket will handle the UI update
    } catch (error) {
      alert('Failed to delete order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Seller Portal</h1>
        <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
      </header>

      <main className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.buyerId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{order.items.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleNextStage(order._id)}
                      disabled={order.stage === 'Delivered'}
                      className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                    >
                      Next Stage
                    </button>
                    <button 
                      onClick={() => handleDelete(order._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-4 text-gray-500">No orders assigned yet.</p>}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
