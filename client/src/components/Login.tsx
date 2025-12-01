import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  // const navigate = useNavigate(); // Unused

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='flex justify-center items-center h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-96'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Login</h2>
        {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div className='mb-6'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-200'
          >
            Sign In
          </button>
        </form>
        <p className='mt-4 text-center text-sm'>
          Don't have an account? <Link to='/register' className='text-blue-500'>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
