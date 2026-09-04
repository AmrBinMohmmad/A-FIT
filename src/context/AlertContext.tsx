import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import CustomAlert, { AlertButton } from '@/components/ui/CustomAlert';

interface AlertItem {
  title?: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const DEFAULT_BUTTONS: AlertButton[] = [{ text: 'حسناً', style: 'default' }];
const CLOSE_ANIMATION_TIME = 250;

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const queueRef = useRef<AlertItem[]>([]);
  const isShowing = useRef(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [current, setCurrent] = useState<AlertItem | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift();

    if (!next) {
      isShowing.current = false;
      return;
    }

    isShowing.current = true;
    setCurrent(next);
    setVisible(true);
  }, []);

  const showAlert = useCallback(
    (title: string, message: string, buttons?: AlertButton[]) => {
      queueRef.current.push({
        title,
        message,
        buttons: buttons?.length ? buttons : DEFAULT_BUTTONS,
      });

      if (!isShowing.current) {
        showNext();
      }
    },
    [showNext],
  );

  const hideAlert = useCallback(() => {
    setVisible(false);
    isShowing.current = false;

    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      nextTimerRef.current = null;
      showNext();
    }, CLOSE_ANIMATION_TIME);
  }, [showNext]);

  const showSuccess = useCallback(
    (message: string, title = 'نجاح') => showAlert(title, message),
    [showAlert],
  );

  const showError = useCallback(
    (message: string, title = 'خطأ') => showAlert(title, message),
    [showAlert],
  );

  return (
    <AlertContext.Provider
      value={{ showAlert, hideAlert, showSuccess, showError }}
    >
      {children}
      <CustomAlert
        visible={visible}
        title={current?.title}
        message={current?.message}
        buttons={current?.buttons}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

