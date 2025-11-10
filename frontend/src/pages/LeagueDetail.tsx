import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface League {
  id: string;
  name: string;
  description: string | null;
  invitationCode: string;
  virtualBudget: number;
  admin: {
    id: string;
    firstName: string;
    lastName: string;
  };
  members: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    name: '',
    description: '',
    virtualBudget: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLeague();
    }
  }, [id]);

  const fetchLeague = async () => {
    try {
      const response = await api.get(`/leagues/${id}`);
      setLeague(response.data);
    } catch (error) {
      console.error('Failed to fetch league:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationCode = () => {
    if (league) {
      navigator.clipboard.writeText(league.invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openSettings = () => {
    if (league) {
      setSettingsData({
        name: league.name,
        description: league.description || '',
        virtualBudget: league.virtualBudget.toString(),
      });
      setShowSettings(true);
      setError('');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError('');

    try {
      const response = await api.put(`/leagues/${id}`, {
        name: settingsData.name,
        description: settingsData.description || null,
        virtualBudget: parseFloat(settingsData.virtualBudget),
      });
      setLeague(response.data);
      setShowSettings(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update league settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveLeague = async () => {
    if (!id) return;

    setLeaving(true);
    setError('');

    try {
      await api.post(`/leagues/${id}/leave`);
      // Redirect to dashboard after leaving
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to leave league');
      setLeaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!league) {
    return <div className="flex items-center justify-center min-h-screen">League not found</div>;
  }

  const isAdmin = league.admin.id === user?.id;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
              {league.description && (
                <p className="mt-2 text-gray-600">{league.description}</p>
              )}
              <div className="mt-4 flex items-center space-x-4">
                <div>
                  <span className="text-sm text-gray-500">Virtual Budget:</span>
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    ${league.virtualBudget.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Members:</span>
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    {league.members.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-gray-500">Invitation Code:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-lg font-mono font-bold text-blue-600">
                    {league.invitationCode}
                  </code>
                  <button
                    onClick={copyInvitationCode}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  to={`/leagues/${id}/portfolio`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-center"
                >
                  View Portfolio
                </Link>
                <Link
                  to={`/leagues/${id}/portfolio`}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-center"
                >
                  Trade Stocks
                </Link>
                <Link
                  to={`/leagues/${id}/leaderboard`}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded text-center"
                >
                  Leaderboard
                </Link>
              </div>
            </div>

            {isAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Admin Controls</h3>
                    <p className="text-sm text-yellow-700">
                      You are the admin of this league. You can update league settings and manage members.
                    </p>
                  </div>
                  <button
                    onClick={openSettings}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    Settings
                  </button>
                </div>
              </div>
            )}

            {/* Leave League Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-4">
                  {isAdmin && league.members.length === 1
                    ? 'Leaving this league will delete it permanently since you are the only member.'
                    : isAdmin
                    ? 'Leaving this league will transfer admin rights to another member.'
                    : 'Leave this league. Your portfolio and trading history will be removed.'}
                </p>
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  disabled={leaving}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {leaving ? 'Leaving...' : 'Leave League'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <div className="space-y-3">
                {league.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.user.firstName} {member.user.lastName}
                        {member.user.id === league.admin.id && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{member.user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave League Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-600">Leave League</h3>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                {isAdmin && league.members.length === 1
                  ? 'Are you sure you want to leave this league? This will permanently delete the league since you are the only member. This action cannot be undone.'
                  : isAdmin
                  ? `Are you sure you want to leave this league? Admin rights will be transferred to another member, and your portfolio will be removed.`
                  : 'Are you sure you want to leave this league? Your portfolio and trading history will be permanently removed.'}
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleLeaveLeague}
                  disabled={leaving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {leaving ? 'Leaving...' : 'Yes, Leave League'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveConfirm(false);
                    setError('');
                  }}
                  disabled={leaving}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">League Settings</h3>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  League Name
                </label>
                <input
                  type="text"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={settingsData.description}
                  onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Virtual Budget ($)
                </label>
                <input
                  type="number"
                  value={settingsData.virtualBudget}
                  onChange={(e) => setSettingsData({ ...settingsData, virtualBudget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1000"
                  step="1000"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Note: Changing the budget only affects new members. Existing members keep their current budgets.
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    setError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

