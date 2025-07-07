import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit3, Trash2, Download, BarChart3, Users, Calendar, ExternalLink } from 'lucide-react';
import GoogleApiService from '../services/googleApi';
import { GoogleForm } from '../types';

interface FormManagerProps {
  onCreateForm: () => void;
  onEditForm: (formId: string) => void;
  onViewAnalytics: (formId: string) => void;
}

const FormManager: React.FC<FormManagerProps> = ({ onCreateForm, onEditForm, onViewAnalytics }) => {
  const [forms, setForms] = useState<GoogleForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<GoogleForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified' | 'responses'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const googleApi = GoogleApiService.getInstance();

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    filterAndSortForms();
  }, [forms, searchTerm, sortBy, sortOrder]);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const formFiles = await googleApi.listForms();
      
      const formsWithDetails = await Promise.all(
        formFiles.map(async (file) => {
          try {
            const formDetails = await googleApi.getForm(file.id);
            const responses = await googleApi.getFormResponses(file.id);
            
            return {
              id: file.id,
              title: formDetails.info.title,
              description: formDetails.info.description || '',
              publishedUrl: formDetails.publishedUrl || '',
              editUrl: formDetails.editUrl || '',
              responseCount: responses.responses?.length || 0,
              createdTime: file.createdTime,
              lastModifiedTime: file.modifiedTime
            };
          } catch (error) {
            console.error(`Error loading form ${file.id}:`, error);
            return {
              id: file.id,
              title: file.name,
              description: '',
              publishedUrl: '',
              editUrl: '',
              responseCount: 0,
              createdTime: file.createdTime,
              lastModifiedTime: file.modifiedTime
            };
          }
        })
      );
      
      setForms(formsWithDetails);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortForms = () => {
    let filtered = forms.filter(form =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdTime).getTime();
          bValue = new Date(b.createdTime).getTime();
          break;
        case 'modified':
          aValue = new Date(a.lastModifiedTime).getTime();
          bValue = new Date(b.lastModifiedTime).getTime();
          break;
        case 'responses':
          aValue = a.responseCount;
          bValue = b.responseCount;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredForms(filtered);
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await window.gapi.client.drive.files.delete({ fileId: formId });
      setForms(forms.filter(form => form.id !== formId));
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    }
  };

  const exportFormData = async (formId: string) => {
    try {
      const responses = await googleApi.getFormResponses(formId);
      const form = await googleApi.getForm(formId);
      
      if (!responses.responses || responses.responses.length === 0) {
        alert('No responses to export.');
        return;
      }

      // Convert responses to CSV
      const headers = ['Timestamp'];
      const questions = form.items?.filter((item: any) => item.questionItem) || [];
      questions.forEach((item: any) => {
        headers.push(item.title);
      });

      const csvData = [headers];
      
      responses.responses.forEach((response: any) => {
        const row = [new Date(response.createTime).toLocaleString()];
        questions.forEach((item: any) => {
          const questionId = item.questionItem.question.questionId;
          const answer = response.answers?.[questionId];
          if (answer) {
            if (answer.textAnswers) {
              row.push(answer.textAnswers.answers[0].value);
            } else if (answer.fileUploadAnswers) {
              row.push(answer.fileUploadAnswers.answers.map((a: any) => a.fileName).join(', '));
            } else {
              row.push('');
            }
          } else {
            row.push('');
          }
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
      a.download = `${form.info.title}_responses.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting form data:', error);
      alert('Error exporting data. Please try again.');
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Form Manager</h2>
          <p className="text-gray-600">Manage your Google Forms and view responses</p>
        </div>
        <button
          onClick={onCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Form
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Forms</p>
              <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">
                {forms.reduce((sum, form) => sum + form.responseCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Forms</p>
              <p className="text-2xl font-bold text-gray-900">
                {forms.filter(form => form.publishedUrl).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Responses</p>
              <p className="text-2xl font-bold text-gray-900">
                {forms.length > 0 ? Math.round(forms.reduce((sum, form) => sum + form.responseCount, 0) / forms.length) : 0}
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
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="modified">Last Modified</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="responses">Responses</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div key={form.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {form.title}
                  </h3>
                  {form.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {form.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Responses</span>
                  <span className="font-medium text-gray-900">{form.responseCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">{formatDate(form.createdTime)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modified</span>
                  <span className="text-gray-900">{formatDate(form.lastModifiedTime)}</span>
                </div>
              </div>

              {form.publishedUrl && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Published</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.publishedUrl}
                      readOnly
                      className="flex-1 px-2 py-1 bg-white border border-green-200 rounded text-xs"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(form.publishedUrl)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {form.publishedUrl && (
                  <a
                    href={form.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </a>
                )}
                
                <button
                  onClick={() => onEditForm(form.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                
                <div className="flex-1"></div>
                
                <button
                  onClick={() => onViewAnalytics(form.id)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="View Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => exportFormData(form.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Export Data"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deleteForm(form.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Form"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No forms found' : 'No forms created yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or filters'
              : 'Create your first form to get started collecting responses'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={onCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Form
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FormManager;