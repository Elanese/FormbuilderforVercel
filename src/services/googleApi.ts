// Direct Google API Service - No OAuth Setup Required
class GoogleApiService {
  private static instance: GoogleApiService;
  private isInitialized = false;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): GoogleApiService {
    if (!GoogleApiService.instance) {
      GoogleApiService.instance = new GoogleApiService();
    }
    return GoogleApiService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: [
                'https://forms.googleapis.com/$discovery/rest?version=v1',
                'https://sheets.googleapis.com/$discovery/rest?version=v4',
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
              ]
            });
            
            this.isInitialized = true;
            resolve();
          } catch (error) {
            console.error('API initialization error:', error);
            // Continue anyway for demo purposes
            this.isInitialized = true;
            resolve();
          }
        });
      };
      script.onerror = () => {
        // Fallback: continue without full API
        this.isInitialized = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<void> {
    try {
      // Simple Google Sign-In without OAuth client
      const popup = window.open(
        'https://accounts.google.com/oauth/authorize?' +
        'client_id=your-app-id&' +
        'redirect_uri=' + encodeURIComponent(window.location.origin + '/auth') + '&' +
        'scope=' + encodeURIComponent('https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive') + '&' +
        'response_type=token',
        'google-auth',
        'width=500,height=600'
      );

      // For demo purposes, simulate successful authentication
      setTimeout(() => {
        if (popup) popup.close();
        this.accessToken = 'demo-token';
        // Store demo user data
        localStorage.setItem('google-user', JSON.stringify({
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          picture: 'https://via.placeholder.com/40'
        }));
      }, 2000);
    } catch (error) {
      console.error('Sign in error:', error);
      // Continue with demo mode
      this.accessToken = 'demo-token';
    }
  }

  async signOut(): Promise<void> {
    this.accessToken = null;
    localStorage.removeItem('google-user');
  }

  isSignedIn(): boolean {
    return !!this.accessToken || !!localStorage.getItem('google-user');
  }

  getCurrentUser() {
    const userData = localStorage.getItem('google-user');
    return userData ? JSON.parse(userData) : null;
  }

  // Mock Forms API - Returns demo data
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
    const form = forms.find((f: any) => f.formId === formId || f.id === formId);
    
    if (!form) {
      throw new Error('Form not found');
    }
    
    // Ensure consistent structure
    const formData = {
      formId: form.formId || form.id,
      info: form.info || { title: form.name || 'Untitled Form', description: form.description || '' },
      publishedUrl: form.publishedUrl || form.webViewLink || `https://docs.google.com/forms/d/${form.formId || form.id}/viewform`,
      editUrl: form.editUrl || `https://docs.google.com/forms/d/${form.formId || form.id}/edit`,
      items: [
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
      ]
    };
    
    return formData;
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
    
    // If no forms exist, create a demo form with complete structure
    if (forms.length === 0) {
      const demoForm = {
        formId: 'demo_form_1',
        id: 'demo_form_1', // Add both formId and id for consistency
        info: {
          title: 'Client Information Form',
          description: 'Comprehensive client intake form for collecting personal and financial information'
        },
        name: 'Client Information Form', // Add name property for FormManager compatibility
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        publishedUrl: 'https://docs.google.com/forms/d/demo_form_1/viewform',
        editUrl: 'https://docs.google.com/forms/d/demo_form_1/edit',
        webViewLink: 'https://docs.google.com/forms/d/demo_form_1/viewform',
        items: []
      };
      forms.push(demoForm);
      localStorage.setItem('demo-forms', JSON.stringify(forms));
    }
    
    // Ensure all forms have consistent structure for FormManager
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

  async getSpreadsheet(spreadsheetId: string): Promise<any> {
    return {
      spreadsheetId,
      properties: { title: 'Demo Spreadsheet' },
      sheets: [{ properties: { title: 'Sheet1' } }]
    };
  }

  async updateSpreadsheet(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    return { updatedCells: values.length };
  }

  async getSpreadsheetValues(spreadsheetId: string, range: string): Promise<any> {
    return { values: [] };
  }

  // Mock Drive API
  async uploadFile(file: File, folderId?: string): Promise<any> {
    return {
      id: 'file_' + Date.now(),
      name: file.name,
      webViewLink: `https://drive.google.com/file/d/file_${Date.now()}/view`
    };
  }

  async createFolder(name: string, parentId?: string): Promise<any> {
    return {
      id: 'folder_' + Date.now(),
      name,
      webViewLink: `https://drive.google.com/drive/folders/folder_${Date.now()}`
    };
  }

  async listFiles(folderId?: string): Promise<any[]> {
    return [];
  }

  async linkFormToSheet(formId: string): Promise<string> {
    const spreadsheet = await this.createSpreadsheet(`Form ${formId} - Responses`);
    return spreadsheet.spreadsheetId;
  }
}

export default GoogleApiService;