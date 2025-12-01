import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { socket } from '../lib/socket';
import Modal from './Modal';

const STAGES = [
  'Order Placed', 'Buyer Associated', 'Processing', 'Packed', 
  'Shipped', 'Out for Delivery', 'Delivered'
];

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState('');

  useEffect(() => {
    fetchActiveOrder();

    socket.on('stage_updated', (updatedOrder: any) => {
      if (activeOrder && activeOrder._id === updatedOrder._id) {
        setActiveOrder(updatedOrder);
      }
    });

    socket.on('order_assigned', (assignedOrder: any) => {
        setActiveOrder(assignedOrder);
    });

    socket.on('order_deleted', (deletedId: string) => {
        if (activeOrder && activeOrder._id === deletedId) {
            setActiveOrder(null);
        }
    });

    return () => {
      socket.off('stage_updated');
      socket.off('order_assigned');
      socket.off('order_deleted');
    };
  }, [activeOrder]);

  const fetchActiveOrder = async () => {
    try {
      const { data } = await api.get('/v1/orders/active');
      if (data && !data.message) setActiveOrder(data);
    } catch (error) {
      console.error("Error fetching active order", error);
    }
  };

  const handleAddItem = () => {
    if (currentItem.trim()) {
      setNewItems([...newItems, currentItem]);
      setCurrentItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    try {
      const { data } = await api.post('/v1/orders', { items: newItems });
      setActiveOrder(data.order);
      setIsModalOpen(false);
      setNewItems([]);
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(error.response?.data?.message || 'Failed to create order');
    }
  };

  const getProgressWidth = (stage: string) => {
    const index = STAGES.indexOf(stage);
    return ((index + 1) / STAGES.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
      </header>

      <main className="container mx-auto p-6">
        {!activeOrder ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl text-gray-600 mb-6">No active orders found.</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700"
            >
              Create New Order
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order #{activeOrder._id.slice(-6)}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {activeOrder.stage}
              </span>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                {STAGES.map((stage) => (
                  <span key={stage} className={activeOrder.stage === stage ? 'font-bold text-indigo-600' : ''}>
                    {stage}
                  </span>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${getProgressWidth(activeOrder.stage)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Items:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {activeOrder.items.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Order">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentItem}
              onChange={(e) => setCurrentItem(e.target.value)}
              placeholder="Item name (e.g. Laptop)"
              className="flex-1 border rounded px-3 py-2"
            />
            <button 
              onClick={handleAddItem}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {newItems.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{item}</span>
                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 font-bold">&times;</button>
              </li>
            ))}
          </ul>

          <button 
            onClick={handleSubmitOrder}
            disabled={newItems.length === 0}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Submit Order
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BuyerDashboard;
