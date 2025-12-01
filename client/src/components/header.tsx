import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-indigo-600">DeliveryApp</div>
      <nav>
        <Link to="/" className="mr-4 text-gray-600 hover:text-indigo-600">Home</Link>
        <Link to="/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
      </nav>
    </header>
  );
};

export default Header;
