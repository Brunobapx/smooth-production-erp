import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/Auth/AuthProvider';
import { validateStockForOrder, deductStockFromOrder, showStockValidationDialog } from '@/hooks/orders/stockValidationOnCreate';

export interface SimpleOrder {
  id: string;
  order_number: string;
  client_id: string;
  client_name: string;
  total_amount: number;
  status: string;
  delivery_deadline?: string;
  payment_method?: string;
  payment_term?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: SimpleOrderItem[];
}

export interface SimpleOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SimpleOrderFormData {
  client_id: string;
  client_name: string;
  delivery_deadline?: Date | null;
  payment_method?: string;
  payment_term?: string;
  notes?: string;
  seller_id?: string;
  seller_name?: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

export const useSimpleOrders = () => {
  const [orders, setOrders] = useState<SimpleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: SimpleOrderFormData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setSubmitting(true);
      
      console.log('[SIMPLE ORDER] Iniciando criação de pedido:', orderData);
      
      // Validar estoque antes de criar o pedido
      const orderItems = orderData.items.map(item => ({
        ...item,
        total_price: item.quantity * item.unit_price
      }));
      
      console.log('[SIMPLE ORDER] Itens para validação:', orderItems);
      
      const stockValidation = await validateStockForOrder(orderItems);
      console.log('[SIMPLE ORDER] Resultado da validação:', stockValidation);
      
      // Mostrar dialog de confirmação se houver problemas
      const userConfirmed = await showStockValidationDialog(stockValidation);
      if (!userConfirmed) {
        throw new Error('Pedido cancelado pelo usuário');
      }
      
      // Calcular total
      const totalAmount = orderData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          client_id: orderData.client_id,
          client_name: orderData.client_name,
          total_amount: totalAmount,
          delivery_deadline: orderData.delivery_deadline ? orderData.delivery_deadline.toISOString().split('T')[0] : null,
          payment_method: orderData.payment_method || null,
          payment_term: orderData.payment_term || null,
          notes: orderData.notes || null,
          seller_id: orderData.seller_id || user.id,
          seller_name: orderData.seller_name || null,
          user_id: user.id,
          order_number: 'PED-' + Date.now() // Numeração simples por enquanto
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const itemsToInsert = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        user_id: user.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      console.log('[SIMPLE ORDER] Pedido criado, iniciando abatimento de estoque');
      
      // Abater estoque após criar o pedido
      const stockDeducted = await deductStockFromOrder(orderItems, order.id);
      
      console.log('[SIMPLE ORDER] Resultado do abatimento:', stockDeducted);
      
      if (!stockDeducted) {
        toast({
          title: "Aviso",
          description: "Pedido criado, mas houve problemas ao atualizar o estoque",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Pedido criado e estoque atualizado com sucesso!",
        });
      }

      await loadOrders();
      return order;
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pedido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  return {
    orders,
    loading,
    submitting,
    loadOrders,
    createOrder
  };
};