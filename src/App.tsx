import React, { useState } from 'react';
import { Database, FileText, BarChart3, Settings, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FormManager from './components/FormManager';
import FormBuilder from './components/FormBuilder';
import ResponseViewer from './components/ResponseViewer';
import AuthButton from './components/AuthButton';

type View = 'dashboard' | 'forms' | 'create-form' | 'edit-form' | 'responses' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthChange = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      setCurrentView('dashboard');
    }
  };

  const handleCreateForm = () => {
    setSelectedFormId(null);
    setCurrentView('create-form');
  };

  const handleEditForm = (formId: string) => {
    setSelectedFormId(formId);
    setCurrentView('edit-form');
  };

  const handleViewResponses = (formId: string) => {
    setSelectedFormId(formId);
    setCurrentView('responses');
  };

  const handleFormSaved = (formId: string) => {
    setSelectedFormId(formId);
    setCurrentView('forms');
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'forms', name: 'Forms', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Google Form Database
              </h1>
              <p className="text-gray-600">
                Manage your Google Forms, collect responses, and track client information with file attachments and expiry alerts.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Create and manage multiple Google Forms
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Collect client information with file attachments
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Track ID expiry dates with automatic alerts
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Export data and manage responses
              </div>
            </div>

            <AuthButton onAuthChange={handleAuthChange} />
            
            <p className="text-xs text-gray-500 mt-4">
              Sign in with your Google account to access Google Forms, Sheets, and Drive APIs
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onViewForms={() => setCurrentView('forms')}
            onCreateForm={handleCreateForm}
          />
        );
      case 'forms':
        return (
          <FormManager
            onCreateForm={handleCreateForm}
            onEditForm={handleEditForm}
            onViewAnalytics={handleViewResponses}
          />
        );
      case 'create-form':
        return (
          <FormBuilder
            onSave={handleFormSaved}
            onCancel={() => setCurrentView('forms')}
          />
        );
      case 'edit-form':
        return (
          <FormBuilder
            formId={selectedFormId!}
            onSave={handleFormSaved}
            onCancel={() => setCurrentView('forms')}
          />
        );
      case 'responses':
        return (
          <ResponseViewer
            formId={selectedFormId!}
            onBack={() => setCurrentView('forms')}
          />
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              <div className="space-y-4">
                <AuthButton onAuthChange={handleAuthChange} />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard onViewForms={() => setCurrentView('forms')} onCreateForm={handleCreateForm} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <>
          {/* Mobile menu button */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white rounded-lg shadow-md"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center gap-3 p-6 border-b">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Form Database</h1>
                <p className="text-xs text-gray-600">Google Integration</p>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as View);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <AuthButton onAuthChange={handleAuthChange} />
              </div>
            </div>
          </div>

          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="lg:ml-64 min-h-screen">
            <main className="p-6 pt-16 lg:pt-6">
              {renderContent()}
            </main>
          </div>
        </>
      )}

      {!isAuthenticated && renderContent()}
    </div>
  );
}

export default App;