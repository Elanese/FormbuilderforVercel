// Mock Google API Service - No Real API Calls
class GoogleApiService {
  private static instance: GoogleApiService;
  private isInitialized = false;
  private mockUser = {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  };

  private constructor() {}

  static getInstance(): GoogleApiService {
    if (!GoogleApiService.instance) {
      GoogleApiService.instance = new GoogleApiService();
    }
    return GoogleApiService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isInitialized = true;
  }

  async signIn(): Promise<void> {
    // Simulate sign-in process
    await new Promise(resolve => setTimeout(resolve, 2000));
    localStorage.setItem('demo-signed-in', 'true');
    localStorage.setItem('demo-user', JSON.stringify(this.mockUser));
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('demo-signed-in');
    localStorage.removeItem('demo-user');
  }

  isSignedIn(): boolean {
    return localStorage.getItem('demo-signed-in') === 'true';
  }

  getCurrentUser() {
    const userData = localStorage.getItem('demo-user');
    return userData ? JSON.parse(userData) : this.mockUser;
  }

  // Mock Forms API
  async createForm(title: string, description: string): Promise<any> {
    const formId = 'form_' + Date.now();
    const form = {
      formId,
      info: { title, description },
      publishedUrl: `https://docs.google.com/forms/d/${formId}/viewform`,
      editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
      items: []
    };
    
    // Store in localStorage for demo
    const forms = JSON.parse(localStorage.getItem('demo-forms') || '[]');
    forms.push(form);
    localStorage.setItem('demo-forms', JSON.stringify(forms));
    
    return form;
  }

  async getForm(formId: string): Promise<any> {
    const forms = JSON.parse(localStorage.getItem('demo-forms') || '[]');
    let form = forms.find((f: any) => f.formId === formId || f.id === formId);
    
    if (!form) {
      // Create a default form if not found
      form = {
        formId,
        info: { title: 'Client Information Form', description: 'Please fill out all required information.' },
        publishedUrl: `https://docs.google.com/forms/d/${formId}/viewform`,
        editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
        items: this.getDefaultFormItems()
      };
    } else {
      // Ensure the form has items - if empty or missing, populate with default items
      if (!form.items || form.items.length === 0) {
        form.items = this.getDefaultFormItems();
      }
    }
    
    return form;
  }

  private getDefaultFormItems() {
    return [
      { title: 'Full Name', questionItem: { question: { questionId: 'q1', textQuestion: {}, required: true } } },
      { title: 'Birthday', questionItem: { question: { questionId: 'q2', dateQuestion: {}, required: true } } },
      { title: 'Address', questionItem: { question: { questionId: 'q3', textQuestion: { paragraph: true }, required: true } } },
      { title: 'Email Address', questionItem: { question: { questionId: 'q4', textQuestion: {}, required: true } } },
      { title: 'Contact Number', questionItem: { question: { questionId: 'q5', textQuestion: {}, required: true } } },
      { title: 'Image ID', questionItem: { question: { questionId: 'q6', textQuestion: {}, required: true } } },
      { title: 'ID Expiry', questionItem: { question: { questionId: 'q7', dateQuestion: {}, required: true } } },
      { title: 'Social Security Number', questionItem: { question: { questionId: 'q8', textQuestion: {}, required: true } } },
      { title: 'Image SSN', questionItem: { question: { questionId: 'q9', textQuestion: {}, required: true } } },
      { title: 'Account Number', questionItem: { question: { questionId: 'q10', textQuestion: {}, required: true } } },
      { title: 'Routing Number', questionItem: { question: { questionId: 'q11', textQuestion: {}, required: true } } },
      { title: 'Image Account', questionItem: { question: { questionId: 'q12', textQuestion: {}, required: true } } },
      { title: 'Application 1', questionItem: { question: { questionId: 'q13', textQuestion: {}, required: false } } },
      { title: 'Application 2', questionItem: { question: { questionId: 'q14', textQuestion: {}, required: false } } },
      { title: 'Application 3', questionItem: { question: { questionId: 'q15', textQuestion: {}, required: false } } },
      { title: 'Client\'s Name', questionItem: { question: { questionId: 'q16', textQuestion: {}, required: true } } },
      { title: 'Visit Plan', questionItem: { question: { questionId: 'q17', textQuestion: { paragraph: true }, required: true } } }
    ];
  }

  async updateForm(formId: string, requests: any[]): Promise<any> {
    // For demo purposes, just return success
    return { replies: [] };
  }

  async getFormResponses(formId: string): Promise<any> {
    // Generate demo responses with some having expiring IDs
    const responses = [];
    const today = new Date();
    
    // Demo response 1 - ID expiring soon
    const expiringSoon = new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000)); // 15 days from now
    responses.push({
      responseId: 'resp_1',
      createTime: new Date(today.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
      answers: {
        q1: { textAnswers: { answers: [{ value: 'John Smith' }] } },
        q2: { textAnswers: { answers: [{ value: '1990-05-15' }] } },
        q3: { textAnswers: { answers: [{ value: '123 Main St, City, State 12345' }] } },
        q4: { textAnswers: { answers: [{ value: 'john.smith@email.com' }] } },
        q5: { textAnswers: { answers: [{ value: '(555) 123-4567' }] } },
        q6: { textAnswers: { answers: [{ value: 'ID123456789' }] } },
        q7: { textAnswers: { answers: [{ value: expiringSoon.toISOString().split('T')[0] }] } },
        q8: { textAnswers: { answers: [{ value: '***-**-1234' }] } },
        q16: { textAnswers: { answers: [{ value: 'John Smith' }] } },
        q17: { textAnswers: { answers: [{ value: 'Regular consultation visit' }] } }
      }
    });

    // Demo response 2 - ID not expiring soon
    const notExpiring = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days from now
    responses.push({
      responseId: 'resp_2',
      createTime: new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
      answers: {
        q1: { textAnswers: { answers: [{ value: 'Jane Doe' }] } },
        q2: { textAnswers: { answers: [{ value: '1985-08-22' }] } },
        q3: { textAnswers: { answers: [{ value: '456 Oak Ave, City, State 67890' }] } },
        q4: { textAnswers: { answers: [{ value: 'jane.doe@email.com' }] } },
        q5: { textAnswers: { answers: [{ value: '(555) 987-6543' }] } },
        q6: { textAnswers: { answers: [{ value: 'ID987654321' }] } },
        q7: { textAnswers: { answers: [{ value: notExpiring.toISOString().split('T')[0] }] } },
        q8: { textAnswers: { answers: [{ value: '***-**-5678' }] } },
        q16: { textAnswers: { answers: [{ value: 'Jane Doe' }] } },
        q17: { textAnswers: { answers: [{ value: 'Follow-up appointment' }] } }
      }
    });

    // Demo response 3 - Another expiring ID
    const expiringSoon2 = new Date(today.getTime() + (25 * 24 * 60 * 60 * 1000)); // 25 days from now
    responses.push({
      responseId: 'resp_3',
      createTime: new Date(today.getTime() - (1 * 24 * 60 * 60 * 1000)).toISOString(),
      answers: {
        q1: { textAnswers: { answers: [{ value: 'Mike Johnson' }] } },
        q2: { textAnswers: { answers: [{ value: '1992-12-10' }] } },
        q3: { textAnswers: { answers: [{ value: '789 Pine St, City, State 54321' }] } },
        q4: { textAnswers: { answers: [{ value: 'mike.johnson@email.com' }] } },
        q5: { textAnswers: { answers: [{ value: '(555) 456-7890' }] } },
        q6: { textAnswers: { answers: [{ value: 'ID456789123' }] } },
        q7: { textAnswers: { answers: [{ value: expiringSoon2.toISOString().split('T')[0] }] } },
        q8: { textAnswers: { answers: [{ value: '***-**-9012' }] } },
        q16: { textAnswers: { answers: [{ value: 'Mike Johnson' }] } },
        q17: { textAnswers: { answers: [{ value: 'Initial consultation' }] } }
      }
    });

    return { responses };
  }

  async listForms(): Promise<any[]> {
    const forms = JSON.parse(localStorage.getItem('demo-forms') || '[]');
    
    // If no forms exist, create a demo form
    if (forms.length === 0) {
      const demoForm = {
        formId: 'demo_form_1',
        id: 'demo_form_1',
        info: {
          title: 'Client Information Form',
          description: 'Comprehensive client intake form for collecting personal and financial information'
        },
        name: 'Client Information Form',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        publishedUrl: 'https://docs.google.com/forms/d/demo_form_1/viewform',
        editUrl: 'https://docs.google.com/forms/d/demo_form_1/edit',
        webViewLink: 'https://docs.google.com/forms/d/demo_form_1/viewform',
        items: this.getDefaultFormItems()
      };
      forms.push(demoForm);
      localStorage.setItem('demo-forms', JSON.stringify(forms));
    }
    
    return forms.map(form => ({
      id: form.formId || form.id,
      formId: form.formId || form.id,
      name: form.info?.title || form.name || 'Untitled Form',
      title: form.info?.title || form.name || 'Untitled Form',
      info: form.info || { title: form.name || 'Untitled Form', description: '' },
      createdTime: form.createdTime || new Date().toISOString(),
      modifiedTime: form.modifiedTime || new Date().toISOString(),
      webViewLink: form.publishedUrl || form.webViewLink || `https://docs.google.com/forms/d/${form.formId || form.id}/viewform`,
      publishedUrl: form.publishedUrl || form.webViewLink || `https://docs.google.com/forms/d/${form.formId || form.id}/viewform`,
      editUrl: form.editUrl || `https://docs.google.com/forms/d/${form.formId || form.id}/edit`
    }));
  }

  // Mock Sheets API
  async createSpreadsheet(title: string): Promise<any> {
    const spreadsheetId = 'sheet_' + Date.now();
    return {
      spreadsheetId,
      properties: { title },
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    };
  }

  async linkFormToSheet(formId: string): Promise<string> {
    const spreadsheet = await this.createSpreadsheet(`Form ${formId} - Responses`);
    return spreadsheet.spreadsheetId;
  }
}

export default GoogleApiService;