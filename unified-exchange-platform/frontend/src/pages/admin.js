// 👑 UNIFIED EXCHANGE - ADMIN DASHBOARD
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState('');
  const [mintAmount, setMintAmount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock Login for Admin (In real app, use proper auth flow)
  useEffect(() => {
    const login = async () => {
      try {
        const res = await axios.post('http://localhost:3000/auth/login', {
          email: 'berkecansuskun1998@gmail.com',
          password: 'initial_password_placeholder' // In real usage, user inputs this
        });
        setToken(res.data.token);
        fetchUsers(res.data.token);
      } catch (e) {
        console.error("Admin login failed", e);
      }
    };
    login();
  }, []);

  const fetchUsers = async (authToken) => {
    const res = await axios.get('http://localhost:3000/admin/users', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    setUsers(res.data);
  };

  const handleMint = async () => {
    if (!selectedUser) return;
    await axios.post('http://localhost:3000/admin/mint', 
      { userId: selectedUser, amount: mintAmount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Minted ${mintAmount} k99 to User ${selectedUser}`);
    fetchUsers(token);
  };

  const toggleFreeze = async (userId, currentStatus) => {
    await axios.post(`http://localhost:3000/admin/users/${userId}/freeze`,
      { freeze: !currentStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers(token);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
      <h1>👑 Super Admin Panel</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px', flex: 1 }}>
          <h2>🏦 Central Bank (Mint k99)</h2>
          <input 
            type="number" 
            placeholder="Amount" 
            onChange={e => setMintAmount(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          />
          <button onClick={handleMint} style={{ padding: '10px', background: '#00ff88', border: 'none', cursor: 'pointer' }}>
            MINT MONEY
          </button>
        </div>

        <div style={{ border: '1px solid #333', padding: '20px', borderRadius: '8px', flex: 1, borderColor: 'red' }}>
          <h2>🚨 Risk Control</h2>
          <button style={{ padding: '15px', background: 'red', color: 'white', border: 'none', width: '100%', fontSize: '18px', cursor: 'pointer' }}>
            PANIC SWITCH (HALT EXCHANGE)
          </button>
        </div>
      </div>

      <h2>👥 User Registry</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #555' }}>
            <th>ID</th>
            <th>Email</th>
            <th>k99 Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td style={{ color: '#00ff88' }}>{user.k99_balance}</td>
              <td style={{ color: user.is_frozen ? 'red' : 'green' }}>
                {user.is_frozen ? 'FROZEN' : 'ACTIVE'}
              </td>
              <td>
                <button onClick={() => setSelectedUser(user.id)} style={{ marginRight: '10px' }}>Select</button>
                <button onClick={() => toggleFreeze(user.id, user.is_frozen)}>
                  {user.is_frozen ? 'Unfreeze' : 'Freeze'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
