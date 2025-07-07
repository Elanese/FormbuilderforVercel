declare global {
  interface Window {
    gapi: {
      load: (apis: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        forms: {
          forms: {
            create: (params: any) => Promise<any>;
            get: (params: any) => Promise<any>;
            batchUpdate: (params: any) => Promise<any>;
            responses: {
              list: (params: any) => Promise<any>;
            };
          };
        };
        sheets: {
          spreadsheets: {
            create: (params: any) => Promise<any>;
            get: (params: any) => Promise<any>;
            batchUpdate: (params: any) => Promise<any>;
            values: {
              get: (params: any) => Promise<any>;
              update: (params: any) => Promise<any>;
            };
          };
        };
        drive: {
          files: {
            create: (params: any) => Promise<any>;
            list: (params: any) => Promise<any>;
            delete: (params: any) => Promise<any>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          currentUser: {
            get: () => {
              getBasicProfile: () => {
                getId: () => string;
                getName: () => string;
                getEmail: () => string;
                getImageUrl: () => string;
              };
              getAuthResponse: () => {
                access_token: string;
              };
            };
          };
          signIn: () => Promise<any>;
          signOut: () => Promise<void>;
        };
      };
    };
  }
}

export {};