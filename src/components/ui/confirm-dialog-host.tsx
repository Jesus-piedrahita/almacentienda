import { useCallback, useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  resetConfirmDialogHandlers,
  setConfirmDialogHandlers,
} from '@/hooks/use-confirm-dialog';

type ConfirmDialogState =
  | {
      mode: 'confirm';
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      resolve: (value: boolean) => void;
    }
  | {
      mode: 'error';
      title: string;
      message: string;
      buttonText: string;
      resolve: () => void;
    }
  | null;

export function ConfirmDialogHost() {
  const [state, setState] = useState<ConfirmDialogState>(null);

  useEffect(() => {
    setConfirmDialogHandlers({
      confirm: async ({ title, message, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
        return new Promise<boolean>((resolve) => {
          setState({
            mode: 'confirm',
            title,
            message,
            confirmText,
            cancelText,
            resolve,
          });
        });
      },
      error: async ({ title, message, buttonText = 'Aceptar' }) => {
        return new Promise<void>((resolve) => {
          setState({
            mode: 'error',
            title,
            message,
            buttonText,
            resolve,
          });
        });
      },
    });

    return () => {
      resetConfirmDialogHandlers();
    };
  }, []);

  const closeConfirm = useCallback((result: boolean) => {
    setState((prev) => {
      if (prev?.mode === 'confirm') {
        prev.resolve(result);
      }
      return null;
    });
  }, []);

  const closeError = useCallback(() => {
    setState((prev) => {
      if (prev?.mode === 'error') {
        prev.resolve();
      }
      return null;
    });
  }, []);

  const isOpen = state !== null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return;

        if (state?.mode === 'confirm') {
          closeConfirm(false);
          return;
        }

        if (state?.mode === 'error') {
          closeError();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{state?.title ?? ''}</DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {state?.message ?? ''}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {state?.mode === 'confirm' ? (
            <>
              <Button type="button" variant="outline" onClick={() => closeConfirm(false)}>
                {state.cancelText}
              </Button>
              <Button type="button" variant="destructive" onClick={() => closeConfirm(true)}>
                {state.confirmText}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={closeError}>
              {state?.mode === 'error' ? state.buttonText : 'Aceptar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
