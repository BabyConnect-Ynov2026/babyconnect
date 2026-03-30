import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import Reservations from './pages/Reservations'
import Tournaments from './pages/Tournaments'
import Matches from './pages/Matches'
import Players from './pages/Players'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/leaderboard" element={<Navigate to="/admin/leaderboard" replace />} />
      <Route path="/reservations" element={<Navigate to="/admin/reservations" replace />} />
      <Route path="/tournaments" element={<Navigate to="/admin/tournaments" replace />} />
      <Route path="/matches" element={<Navigate to="/admin/matches" replace />} />
      <Route path="/players" element={<Navigate to="/admin/players" replace />} />

      <Route path="/admin" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="matches" element={<Matches />} />
        <Route path="players" element={<Players />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
