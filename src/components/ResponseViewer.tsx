import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Search, AlertTriangle, CheckCircle, Clock, User, Mail, Phone, MapPin, CreditCard, Hash, FileText } from 'lucide-react';
import GoogleApiService from '../services/googleApi';

interface ResponseViewerProps {
  formId: string;
  onBack: () => void;
}

interface FormResponse {
  id: string;
  timestamp: string;
  responses: Record<string, any>;
  isExpiringSoon?: boolean;
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ formId, onBack }) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([]);
  const [formInfo, setFormInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'expiring' | 'recent'>('all');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const googleApi = GoogleApiService.getInstance();

  useEffect(() => {
    loadFormData();
  }, [formId]);

  useEffect(() => {
    filterResponses();
  }, [responses, searchTerm, filterBy]);

  const loadFormData = async () => {
    try {
      setIsLoading(true);
      
      // Load form info
      const form = await googleApi.getForm(formId);
      setFormInfo(form);
      
      // Load responses
      const responseData = await googleApi.getFormResponses(formId);
      
      if (responseData.responses) {
        const processedResponses = responseData.responses.map((response: any) => {
          const processedResponse: FormResponse = {
            id: response.responseId,
            timestamp: response.createTime,
            responses: {}
          };

          // Process answers
          if (response.answers) {
            Object.entries(response.answers).forEach(([questionId, answer]: [string, any]) => {
              const question = form.items?.find((item: any) => 
                item.questionItem?.question?.questionId === questionId
              );
              
              if (question) {
                let value = '';
                if (answer.textAnswers) {
                  value = answer.textAnswers.answers[0]?.value || '';
                } else if (answer.fileUploadAnswers) {
                  value = answer.fileUploadAnswers.answers.map((a: any) => a.fileName).join(', ');
                }
                
                processedResponse.responses[question.title] = value;
              }
            });
          }

          // Check for expiring IDs
          const idExpiry = processedResponse.responses['ID Expiry'];
          if (idExpiry) {
            const expiryDate = new Date(idExpiry);
            const today = new Date();
            const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
            
            if (expiryDate <= thirtyDaysFromNow) {
              processedResponse.isExpiringSoon = true;
            }
          }

          return processedResponse;
        });
        
        setResponses(processedResponses);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = responses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(response =>
        Object.values(response.responses).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'expiring':
        filtered = filtered.filter(response => response.isExpiringSoon);
        break;
      case 'recent':
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(response => 
          new Date(response.timestamp) >= sevenDaysAgo
        );
        break;
    }

    setFilteredResponses(filtered);
  };

  const exportResponses = () => {
    if (responses.length === 0) {
      alert('No responses to export.');
      return;
    }

    // Get all unique question titles
    const allQuestions = new Set<string>();
    responses.forEach(response => {
      Object.keys(response.responses).forEach(question => {
        allQuestions.add(question);
      });
    });

    const headers = ['Timestamp', 'Status', ...Array.from(allQuestions)];
    const csvData = [headers];

    responses.forEach(response => {
      const row = [
        new Date(response.timestamp).toLocaleString(),
        response.isExpiringSoon ? 'ID Expiring Soon' : 'Active'
      ];
      
      Array.from(allQuestions).forEach(question => {
        row.push(response.responses[question] || '');
      });
      
      csvData.push(row);
    });

    // Download CSV
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formInfo?.info?.title || 'form'}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFieldIcon = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('name')) return User;
    if (name.includes('email')) return Mail;
    if (name.includes('phone') || name.includes('contact')) return Phone;
    if (name.includes('address')) return MapPin;
    if (name.includes('account') || name.includes('routing')) return CreditCard;
    if (name.includes('social security') || name.includes('ssn')) return Hash;
    if (name.includes('birthday') || name.includes('expiry')) return Calendar;
    return FileText;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 mb-2 text-sm"
          >
            ← Back to Forms
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {formInfo?.info?.title || 'Form Responses'}
          </h2>
          <p className="text-gray-600">
            {responses.length} total responses
          </p>
        </div>
        <button
          onClick={exportResponses}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">IDs Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">
                {responses.filter(r => r.isExpiringSoon).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Records</p>
              <p className="text-2xl font-bold text-green-600">
                {responses.filter(r => !r.isExpiringSoon).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-purple-600">
                {responses.filter(r => {
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(r.timestamp) >= sevenDaysAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Responses</option>
              <option value="expiring">IDs Expiring Soon</option>
              <option value="recent">Recent (7 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.map((response) => (
          <div
            key={response.id}
            className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow ${
              response.isExpiringSoon ? 'border-l-4 border-l-red-500 bg-red-50' : ''
            }`}
            onClick={() => setSelectedResponse(response)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  response.isExpiringSoon ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {response.isExpiringSoon ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {response.responses['Full Name'] || response.responses['Client\'s Name'] || 'Unnamed Response'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Submitted {formatDate(response.timestamp)}
                  </p>
                  {response.isExpiringSoon && (
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ ID expires within 30 days
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(response.responses).slice(0, 6).map(([question, answer]) => {
                const IconComponent = getFieldIcon(question);
                return (
                  <div key={question} className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 truncate">{question}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {answer || 'Not provided'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(response.responses).length > 6 && (
              <p className="text-sm text-gray-500 mt-3">
                +{Object.keys(response.responses).length - 6} more fields...
              </p>
            )}
          </div>
        ))}
      </div>

      {filteredResponses.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterBy !== 'all' ? 'No matching responses' : 'No responses yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterBy !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Responses will appear here once people start filling out your form'
            }
          </p>
        </div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedResponse.responses['Full Name'] || selectedResponse.responses['Client\'s Name'] || 'Response Details'}
                  </h3>
                  <p className="text-gray-600">
                    Submitted {formatDate(selectedResponse.timestamp)}
                  </p>
                  {selectedResponse.isExpiringSoon && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      ID expires within 30 days
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(selectedResponse.responses).map(([question, answer]) => {
                  const IconComponent = getFieldIcon(question);
                  const isExpiryField = question.toLowerCase().includes('expiry');
                  const isExpiring = isExpiryField && selectedResponse.isExpiringSoon;
                  
                  return (
                    <div key={question} className={`p-4 rounded-lg border ${
                      isExpiring ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`w-5 h-5 ${
                          isExpiring ? 'text-red-600' : 'text-gray-500'
                        }`} />
                        <label className={`font-medium ${
                          isExpiring ? 'text-red-900' : 'text-gray-700'
                        }`}>
                          {question}
                        </label>
                        {isExpiring && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className={`${
                        isExpiring ? 'text-red-800' : 'text-gray-900'
                      } ${answer ? '' : 'italic text-gray-500'}`}>
                        {answer || 'Not provided'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseViewer;