
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { z } from 'zod';
import { User } from '@supabase/supabase-js';
import { toast } from "sonner";

// Input validation schemas
const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres');

export const useAuthPageLogic = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        navigate('/');
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate('/');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = () => {
    const errors: { email?: string; password?: string } = {};
    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) errors.email = error.errors[0]?.message;
    }
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) errors.password = error.errors[0]?.message;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth error:', error);
      }
      if (error.message.includes('Invalid login credentials')) {
        toast.error("Email ou senha incorretos");
      } else {
        toast.error("Erro ao fazer login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    isLoading,
    user,
    validationErrors,
    handleSubmit,
  };
};
