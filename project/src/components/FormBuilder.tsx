import React, { useState, useEffect } from 'react';
import { Plus, Save, Eye, Link, Trash2, Edit3, FileText, Calendar, Mail, Phone, CreditCard, User, MapPin, Hash, Upload } from 'lucide-react';
import GoogleApiService from '../services/googleApi';
import { FormQuestion } from '../types';

interface FormBuilderProps {
  formId?: string;
  onSave?: (formId: string) => void;
  onCancel?: () => void;
}

const PREDEFINED_QUESTIONS = [
  { title: 'Full Name', type: 'TEXT' as const, required: true, icon: User },
  { title: 'Birthday', type: 'DATE' as const, required: true, icon: Calendar },
  { title: 'Address', type: 'PARAGRAPH_TEXT' as const, required: true, icon: MapPin },
  { title: 'Email Address', type: 'TEXT' as const, required: true, icon: Mail },
  { title: 'Contact Number', type: 'TEXT' as const, required: true, icon: Phone },
  { title: 'Image ID', type: 'TEXT' as const, required: true, icon: Upload },
  { title: 'ID Expiry', type: 'DATE' as const, required: true, icon: Calendar },
  { title: 'Social Security Number', type: 'TEXT' as const, required: true, icon: Hash },
  { title: 'Image SSN', type: 'TEXT' as const, required: true, icon: Upload },
  { title: 'Account Number', type: 'TEXT' as const, required: true, icon: CreditCard },
  { title: 'Routing Number', type: 'TEXT' as const, required: true, icon: CreditCard },
  { title: 'Image Account', type: 'TEXT' as const, required: true, icon: Upload },
  { title: 'Application 1', type: 'TEXT' as const, required: false, icon: FileText },
  { title: 'Application 2', type: 'TEXT' as const, required: false, icon: FileText },
  { title: 'Application 3', type: 'TEXT' as const, required: false, icon: FileText },
  { title: 'Client\'s Name', type: 'TEXT' as const, required: true, icon: User },
  { title: 'Visit Plan', type: 'PARAGRAPH_TEXT' as const, required: true, icon: FileText }
];

const FormBuilder: React.FC<FormBuilderProps> = ({ formId, onSave, onCancel }) => {
  const [formTitle, setFormTitle] = useState('Client Information Form');
  const [formDescription, setFormDescription] = useState('Please fill out all required information and upload necessary documents.');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const googleApi = GoogleApiService.getInstance();

  useEffect(() => {
    if (formId) {
      loadForm();
    } else {
      // Initialize with predefined questions
      const initialQuestions = PREDEFINED_QUESTIONS.map((q, index) => ({
        id: `question_${index}`,
        ...q
      }));
      setQuestions(initialQuestions);
    }
  }, [formId]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      const form = await googleApi.getForm(formId!);
      
      setFormTitle(form.info.title);
      setFormDescription(form.info.description || '');
      setPreviewUrl(form.publishedUrl);
      
      const formQuestions = form.items?.map((item: any) => ({
        id: item.questionItem?.question?.questionId || item.itemId,
        title: item.title,
        type: item.questionItem?.question?.choiceQuestion ? 'MULTIPLE_CHOICE' :
              item.questionItem?.question?.textQuestion ? 'TEXT' :
              item.questionItem?.question?.dateQuestion ? 'DATE' : 'TEXT',
        required: item.questionItem?.question?.required || false,
        options: item.questionItem?.question?.choiceQuestion?.options?.map((opt: any) => opt.value) || []
      })) || [];
      
      setQuestions(formQuestions);
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      id: `question_${Date.now()}`,
      title: 'New Question',
      type: 'TEXT',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveForm = async () => {
    try {
      setIsLoading(true);
      
      let currentFormId = formId;
      
      if (!currentFormId) {
        // Create new form
        const form = await googleApi.createForm(formTitle, formDescription);
        currentFormId = form.formId;
        setPreviewUrl(form.publishedUrl);
      }
      
      // For demo purposes, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(currentFormId);
      }
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPredefinedQuestions = () => {
    const newQuestions = PREDEFINED_QUESTIONS.map((q, index) => ({
      id: `predefined_${Date.now()}_${index}`,
      ...q
    }));
    setQuestions([...questions, ...newQuestions]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {formId ? 'Edit Form' : 'Create New Form'}
          </h2>
          <div className="flex gap-3">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </a>
            )}
            <button
              onClick={saveForm}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Form'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter form description"
            />
          </div>
        </div>

        {previewUrl && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Form Link</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={previewUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(previewUrl)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <div className="flex gap-2">
            <button
              onClick={addPredefinedQuestions}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              Add Client Info Template
            </button>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const IconComponent = PREDEFINED_QUESTIONS.find(pq => pq.title === question.title)?.icon || FileText;
            
            return (
              <div key={question.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <IconComponent className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <input
                        type="text"
                        value={question.title}
                        onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Question title"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="TEXT">Short Text</option>
                        <option value="PARAGRAPH_TEXT">Long Text</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="DATE">Date</option>
                      </select>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>

                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        {(question.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[optIndex] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(question.options || []), ''];
                            updateQuestion(question.id, { options: newOptions });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No questions added yet</p>
            <p className="text-sm">Click "Add Question" or "Add Client Info Template" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;