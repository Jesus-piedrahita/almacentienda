/**
 * @fileoverview Dialog para agregar o editar clientes.
 * Formulario para crear o modificar clientes del sistema.
 */

import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Client, CreateClientInput } from '@/types/clients';
import { useCreateClient, useUpdateClient } from '@/hooks/use-clients';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

/**
 * ClientDialog - Dialog para agregar o editar clientes.
 *
 * Incluye:
 * - Modo agregar: campos vacíos
 * - Modo editar: campos precargados
 * - Validación de campos requeridos
 * - Estados de carga
 *
 * @example
 * ```tsx
 * // Para agregar
 * <ClientDialog open={isOpen} onOpenChange={setIsOpen} />
 *
 * // Para editar
 * <ClientDialog open={isOpen} onOpenChange={setIsOpen} client={selectedClient} />
 * ```
 */
export function ClientDialog({
  open,
  onOpenChange,
  client,
}: ClientDialogProps) {
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  const isEditMode = !!client;
  const isLoading = createClientMutation.isPending || updateClientMutation.isPending;

  const [formData, setFormData] = useState<CreateClientInput>({
    name: '',
    email: '',
    phone: '',
    address: '',
    rfc: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateClientInput, string>>>({});

  // Cargar datos cuando se abre en modo edición
  useEffect(() => {
    if (client && open) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
        rfc: client.rfc || '',
      });
    } else if (!open) {
      resetForm();
    }
  }, [client, open]);

  const handleChange = (field: keyof CreateClientInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateClientInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && client) {
        await updateClientMutation.mutateAsync({
          id: client.id,
          updates: formData,
        });
      } else {
        await createClientMutation.mutateAsync(formData);
      }
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(isEditMode ? 'Error al actualizar cliente:' : 'Error al crear cliente:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      rfc: '',
    });
    setErrors({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const dialogTitle = isEditMode ? 'Editar Cliente' : 'Agregar Cliente';
  const dialogDescription = isEditMode
    ? 'Modifica los datos del cliente.'
    : 'Registra un nuevo cliente en el sistema.';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Agregar Cliente';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="client-name">Nombre *</Label>
            <Input
              id="client-name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="client-email">Email *</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="client-phone">Teléfono</Label>
            <Input
              id="client-phone"
              placeholder="55-1234-5678"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="client-address">Dirección</Label>
            <Input
              id="client-address"
              placeholder="Dirección completa"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* RFC */}
          <div className="space-y-2">
            <Label htmlFor="client-rfc">RFC</Label>
            <Input
              id="client-rfc"
              placeholder="XAXX010101000"
              value={formData.rfc}
              onChange={(e) => handleChange('rfc', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
