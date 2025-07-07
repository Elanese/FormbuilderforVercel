import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, AlertTriangle, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import GoogleApiService from '../services/googleApi';

interface DashboardProps {
  onViewForms: () => void;
  onCreateForm: () => void;
}

interface DashboardStats {
  totalForms: number;
  totalResponses: number;
  expiringIds: number;
  recentResponses: number;
  activeFormsCount: number;
  averageResponsesPerForm: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewForms, onCreateForm }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalResponses: 0,
    expiringIds: 0,
    recentResponses: 0,
    activeFormsCount: 0,
    averageResponsesPerForm: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const googleApi = GoogleApiService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all forms
      const forms = await googleApi.listForms();
      const totalForms = forms.length;
      let totalResponses = 0;
      let expiringIds = 0;
      let recentResponses = 0;
      let activeFormsCount = 0;
      const activity: any[] = [];

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Process each form
      for (const form of forms.slice(0, 10)) { // Limit to prevent API quota issues
        try {
          const formDetails = await googleApi.getForm(form.id);
          const responses = await googleApi.getFormResponses(form.id);
          
          if (formDetails.publishedUrl) {
            activeFormsCount++;
          }

          if (responses.responses) {
            const responseCount = responses.responses.length;
            totalResponses += responseCount;

            // Check recent responses
            const recentCount = responses.responses.filter((response: any) => 
              new Date(response.createTime) >= sevenDaysAgo
            ).length;
            recentResponses += recentCount;

            // Check for expiring IDs
            responses.responses.forEach((response: any) => {
              if (response.answers) {
                Object.entries(response.answers).forEach(([questionId, answer]: [string, any]) => {
                  const question = formDetails.items?.find((item: any) => 
                    item.questionItem?.question?.questionId === questionId
                  );
                  
                  if (question && question.title.toLowerCase().includes('expiry')) {
                    if (answer.textAnswers) {
                      const expiryDate = new Date(answer.textAnswers.answers[0]?.value);
                      if (expiryDate <= thirtyDaysFromNow && expiryDate > new Date()) {
                        expiringIds++;
                      }
                    }
                  }
                });
              }
            });

            // Add to recent activity
            if (recentCount > 0) {
              activity.push({
                type: 'responses',
                formTitle: formDetails.info.title,
                count: recentCount,
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error(`Error processing form ${form.id}:`, error);
        }
      }

      setStats({
        totalForms,
        totalResponses,
        expiringIds,
        recentResponses,
        activeFormsCount,
        averageResponsesPerForm: totalForms > 0 ? Math.round(totalResponses / totalForms) : 0
      });

      setRecentActivity(activity.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your Google Forms database</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onViewForms}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Forms
          </button>
          <button
            onClick={onCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Create Form
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Forms</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalForms}</p>
              <p className="text-sm text-green-600">
                {stats.activeFormsCount} active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalResponses}</p>
              <p className="text-sm text-blue-600">
                Avg {stats.averageResponsesPerForm} per form
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">IDs Expiring Soon</p>
              <p className="text-3xl font-bold text-red-600">{stats.expiringIds}</p>
              <p className="text-sm text-red-600">
                Within 30 days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Activity</p>
              <p className="text-3xl font-bold text-purple-600">{stats.recentResponses}</p>
              <p className="text-sm text-purple-600">
                Last 7 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateForm}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Create New Form</h3>
              <p className="text-sm text-gray-600">Start collecting client information</p>
            </div>
          </button>

          <button
            onClick={onViewForms}
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Manage Forms</h3>
              <p className="text-sm text-gray-600">Edit and view your forms</p>
            </div>
          </button>

          <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg opacity-50">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Schedule Reminders</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.count} new response{activity.count !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-600">{activity.formTitle}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {stats.expiringIds > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {stats.expiringIds} ID{stats.expiringIds !== 1 ? 's' : ''} expiring soon
                  </p>
                  <p className="text-xs text-red-700">
                    Review client records and request updates
                  </p>
                </div>
              </div>
            )}

            {stats.recentResponses > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    {stats.recentResponses} new response{stats.recentResponses !== 1 ? 's' : ''} this week
                  </p>
                  <p className="text-xs text-green-700">
                    Your forms are actively collecting data
                  </p>
                </div>
              </div>
            )}

            {stats.expiringIds === 0 && stats.recentResponses === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>All systems running smoothly</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Google Forms API</span>
            <span className="text-xs text-green-600 ml-auto">Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Google Sheets API</span>
            <span className="text-xs text-green-600 ml-auto">Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Google Drive API</span>
            <span className="text-xs text-green-600 ml-auto">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;