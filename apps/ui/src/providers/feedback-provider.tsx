import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { TriangleAlert } from 'lucide-react';

interface FeedbackContextType {
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, title?: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [errorConfig, setErrorConfig] = useState<{ isOpen: boolean; message: string; title: string }>({
    isOpen: false,
    message: '',
    title: 'Errore',
  });

  const showSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, { description });
  }, []);

  const showError = useCallback((message: string, title = 'Errore') => {
    setErrorConfig({ isOpen: true, message, title });
  }, []);

  return (
    <FeedbackContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Toaster />
      <AlertDialog 
        open={errorConfig.isOpen} 
        onOpenChange={(open) => !open && setErrorConfig(prev => ({ ...prev, isOpen: false }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              {errorConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorConfig.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorConfig(prev => ({ ...prev, isOpen: false }))}>
              Ho capito
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
