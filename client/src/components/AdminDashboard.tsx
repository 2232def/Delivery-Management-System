import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import Modal from './Modal';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  
  // Modal States
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchData();

    socket.on('order_created', (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        fetchStats(); // Refresh stats
    });

    socket.on('order_updated', (updatedOrder) => {
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        fetchStats();
    });

    socket.on('order_deleted', (deletedId) => {
        setOrders(prev => prev.filter(o => o._id !== deletedId));
        fetchStats();
    });

    return () => {
      socket.off('order_created');
      socket.off('order_updated');
      socket.off('order_deleted');
    };
  }, []);

  const fetchData = async () => {
    fetchStats();
    fetchOrders();
    fetchBuyers();
    fetchSellers();
  };

  const fetchStats = async () => {
    try {
        const { data } = await api.get('/v1/admin/stats');
        setStats(data);
    } catch (e) {}
  };

  const fetchOrders = async () => {
    try {
        const { data } = await api.get('/v1/admin/orders');
        setOrders(data);
    } catch (e) {}
  };

  const fetchBuyers = async () => {
    try {
        const { data } = await api.get('/v1/admin/buyers');
        setBuyers(data);
    } catch (e) {}
  };

  const fetchSellers = async () => {
    try {
        const { data } = await api.get('/v1/admin/sellers');
        setSellers(data);
    } catch (e) {}
  };

  const handleAssociateBuyer = async (buyerId: string) => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/v1/orders/${selectedOrder._id}/associate-buyer`, { buyerId });
      setIsBuyerModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      alert('Failed to associate buyer');
    }
  };

  const handleAssignSeller = async (sellerId: string) => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/v1/orders/${selectedOrder._id}/assign-seller`, { sellerId });
      setIsSellerModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      alert('Failed to assign seller');
    }
  };

  const openBuyerModal = (order: any) => {
    setSelectedOrder(order);
    setIsBuyerModalOpen(true);
  };

  const openSellerModal = (order: any) => {
    setSelectedOrder(order);
    setIsSellerModalOpen(true);
  };

  const openDetailsModal = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
      </header>

      <main className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Active Orders</h3>
            <p className="text-3xl font-bold text-blue-600">
                {orders.filter(o => o.stage !== 'Delivered').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Avg Delivery Time</h3>
            <p className="text-3xl font-bold text-green-600">
                {stats.avgDeliveryTime ? (stats.avgDeliveryTime / (1000 * 60 * 60)).toFixed(1) + ' hrs' : 'N/A'}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-6)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.buyerId?.name || <span className="text-red-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.sellerId?.name || <span className="text-yellow-500 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {order.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!order.buyerId && (
                        <button onClick={() => openBuyerModal(order)} className="text-indigo-600 hover:text-indigo-900">
                            Assign Buyer
                        </button>
                    )}
                    {!order.sellerId && (
                        <button onClick={() => openSellerModal(order)} className="text-orange-600 hover:text-orange-900">
                            Assign Seller
                        </button>
                    )}
                    <button onClick={() => openDetailsModal(order)} className="text-gray-600 hover:text-gray-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Associate Buyer Modal */}
      <Modal isOpen={isBuyerModalOpen} onClose={() => setIsBuyerModalOpen(false)} title="Associate Buyer">
        <div className="space-y-2">
            {buyers.map(buyer => (
                <button 
                    key={buyer._id}
                    onClick={() => handleAssociateBuyer(buyer._id)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded border"
                >
                    {buyer.name} ({buyer.email})
                </button>
            ))}
        </div>
      </Modal>

      {/* Assign Seller Modal */}
      <Modal isOpen={isSellerModalOpen} onClose={() => setIsSellerModalOpen(false)} title="Assign Seller">
        <div className="space-y-2">
            {sellers.map(seller => (
                <button 
                    key={seller._id}
                    onClick={() => handleAssignSeller(seller._id)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded border"
                >
                    {seller.name} ({seller.email})
                </button>
            ))}
        </div>
      </Modal>

      {/* Order Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Order History">
        <div className="max-h-96 overflow-y-auto">
            {selectedOrder?.history?.map((log: any, idx: number) => (
                <div key={idx} className="border-l-2 border-gray-300 pl-4 pb-4 relative">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 bg-gray-400 rounded-full"></div>
                    <p className="text-sm font-bold text-gray-800">{log.stage} - {log.action}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()} by {log.actorName} ({log.actorRole})
                    </p>
                </div>
            ))}
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
