import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import Reservations from './pages/Reservations'
import Tournaments from './pages/Tournaments'
import Matches from './pages/Matches'
import Players from './pages/Players'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/players" element={<Players />} />
      </Routes>
    </Layout>
  )
}
