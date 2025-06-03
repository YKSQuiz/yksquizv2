
"use client";

import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile } from 'firebase/auth';
// Firebase Storage imports removed
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // firebaseApp import removed as getStorage is not used

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Zod schema now only for displayName
const editProfileSchema = z.object({
  displayName: z.string().max(50, "Display name can be at most 50 characters.").optional().or(z.literal('')),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { toast } = useToast();
  // selectedFile and previewImage states removed
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: '',
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        displayName: user.displayName || '',
      });
      // Logic for selectedFile and previewImage removed
    }
  }, [user, isOpen, form]);

  // handleFileChange function removed

  const onSubmit: SubmitHandler<EditProfileFormValues> = async (data) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not found. Please try again.",
      });
      return;
    }

    setIsProcessing(true);
    // newPhotoURL and file upload logic removed

    try {
      const authProfileUpdates: { displayName?: string | null } = {};
      let needsAuthUpdate = false;
      let needsFirestoreUpdate = false;

      const currentDisplayName = user.displayName || '';
      const newDisplayName = data.displayName || '';

      if (newDisplayName !== currentDisplayName) {
        authProfileUpdates.displayName = newDisplayName || null;
        needsAuthUpdate = true;
        needsFirestoreUpdate = true;
      }

      if (needsAuthUpdate) {
        await updateProfile(user, authProfileUpdates);
      }

      if (needsFirestoreUpdate) {
        const userDocRef = doc(db, "users", user.uid);
        const firestoreDataToUpdate: { displayName?: string | null } = {};
        
        if (newDisplayName !== currentDisplayName) {
            firestoreDataToUpdate.displayName = newDisplayName || null;
        }
        
        if (Object.keys(firestoreDataToUpdate).length > 0) {
            await setDoc(userDocRef, firestoreDataToUpdate, { merge: true });
        }
      }

      if (needsAuthUpdate || needsFirestoreUpdate) {
        toast({
            title: "Başarılı!",
            description: "Profiliniz güncellendi.",
            className: "bg-accent text-accent-foreground",
        });
      } else {
        toast({
            title: "Değişiklik Yok",
            description: "Herhangi bir değişiklik yapılmadı.",
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);
      toast({
        variant: "destructive",
        title: "Güncelleme Başarısız",
        description: error.message || "Profiliniz güncellenemedi. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profili Düzenle</DialogTitle>
          <DialogDescription>
            Görünen adınızı buradan değiştirin. Bitirdiğinizde kaydet'e tıklayın.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Görünen Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Görünen adınız" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* FormItem for photoUpload and image preview removed */}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                  İptal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isProcessing || form.formState.isSubmitting}>
                {(isProcessing || form.formState.isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                { (isProcessing || form.formState.isSubmitting) ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
