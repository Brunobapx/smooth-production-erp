
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, 
  Truck, 
  Clock, 
  Route, 
  Download, 
  MessageCircle, 
  Package,
  Zap,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import { useOtimizacaoRoteiro } from '@/hooks/useOtimizacaoRoteiro';

const OtimizacaoRoteiroTab = () => {
  const [enderecoOrigem, setEnderecoOrigem] = useState('');
  const [pedidosSelecionados, setPedidosSelecionados] = useState<string[]>([]);
  
  const { 
    loading, 
    loadingPedidos,
    roteiros, 
    pedidosDisponiveis,
    buscarPedidosDisponiveis,
    otimizarRoteiroEntregas, 
    exportarRoteiroPDF, 
    enviarRoteiroWhatsApp,
    limparRoteiros 
  } = useOtimizacaoRoteiro();

  // Buscar pedidos ao carregar o componente
  useEffect(() => {
    buscarPedidosDisponiveis();
  }, []);

  const handleOtimizar = async () => {
    if (!enderecoOrigem.trim()) {
      alert('Por favor, informe o endereço de origem');
      return;
    }

    if (pedidosSelecionados.length === 0) {
      alert('Por favor, selecione pelo menos um pedido');
      return;
    }

    await otimizarRoteiroEntregas(enderecoOrigem, pedidosSelecionados);
  };

  const handleSelectPedido = (pedidoId: string, checked: boolean) => {
    if (checked) {
      setPedidosSelecionados([...pedidosSelecionados, pedidoId]);
    } else {
      setPedidosSelecionados(pedidosSelecionados.filter(id => id !== pedidoId));
    }
  };

  const handleSelectAll = () => {
    if (pedidosSelecionados.length === pedidosDisponiveis.length) {
      setPedidosSelecionados([]);
    } else {
      setPedidosSelecionados(pedidosDisponiveis.map(p => p.id));
    }
  };

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
  };

  const formatarDistancia = (metros: number) => {
    return `${(metros / 1000).toFixed(2)} km`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Otimização de Roteiro de Entregas
        </h2>
        <p className="text-muted-foreground">
          Selecione os pedidos liberados para venda e gere roteiros otimizados automaticamente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configuração da Otimização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endereco-origem">Endereço de Origem (Depósito/CD)</Label>
              <Input
                id="endereco-origem"
                value={enderecoOrigem}
                onChange={(e) => setEnderecoOrigem(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro, Rio de Janeiro, RJ, 20000-000"
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Pedidos Liberados para Venda</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={buscarPedidosDisponiveis}
                    disabled={loadingPedidos}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${loadingPedidos ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                  {pedidosDisponiveis.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="flex items-center gap-1"
                    >
                      {pedidosSelecionados.length === pedidosDisponiveis.length ? 
                        <CheckSquare className="h-3 w-3" /> : 
                        <Square className="h-3 w-3" />
                      }
                      {pedidosSelecionados.length === pedidosDisponiveis.length ? 'Desmarcar' : 'Selecionar'} Todos
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-2">
                {loadingPedidos ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
                    Carregando pedidos...
                  </div>
                ) : pedidosDisponiveis.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pedido liberado para venda encontrado.</p>
                    <p className="text-sm">Libere alguns pedidos na área de produção/embalagem.</p>
                  </div>
                ) : (
                  pedidosDisponiveis.map((pedido) => (
                    <div key={pedido.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/5">
                      <Checkbox
                        id={pedido.id}
                        checked={pedidosSelecionados.includes(pedido.id)}
                        onCheckedChange={(checked) => handleSelectPedido(pedido.id, checked as boolean)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{pedido.client_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {pedido.order_number}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {pedido.peso_total.toFixed(1)}kg
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pedido.endereco_completo}
                        </p>
                        {pedido.items && pedido.items.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {pedido.items.length} item(s): {pedido.items.map(item => 
                              `${item.product_name} (${item.quantity}x)`
                            ).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {pedidosSelecionados.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {pedidosSelecionados.length} pedido(s) selecionado(s) - Peso total: {
                    pedidosDisponiveis
                      .filter(p => pedidosSelecionados.includes(p.id))
                      .reduce((total, p) => total + p.peso_total, 0)
                      .toFixed(1)
                  }kg
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleOtimizar}
                disabled={loading || !enderecoOrigem.trim() || pedidosSelecionados.length === 0}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Route className="h-4 w-4" />
                    Otimizar Roteiros
                  </>
                )}
              </Button>

              {roteiros.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={limparRoteiros}
                  className="flex items-center gap-2"
                >
                  Limpar Resultados
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo dos dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Resumo dos Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {pedidosDisponiveis.length}
                </div>
                <div className="text-sm text-blue-800">Pedidos Disponíveis</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {pedidosSelecionados.length}
                </div>
                <div className="text-sm text-green-800">Pedidos Selecionados</div>
              </div>
            </div>
            
            {pedidosSelecionados.length > 0 && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {pedidosDisponiveis
                    .filter(p => pedidosSelecionados.includes(p.id))
                    .reduce((total, p) => total + p.peso_total, 0)
                    .toFixed(1)}kg
                </div>
                <div className="text-sm text-purple-800">Peso Total Selecionado</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {roteiros.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Roteiros Otimizados ({roteiros.length})
            </h3>
            <Badge variant="secondary" className="text-sm">
              <Package className="h-3 w-3 mr-1" />
              {roteiros.reduce((total, r) => total + r.pedidos.length, 0)} pedidos alocados
            </Badge>
          </div>

          <div className="grid gap-4">
            {roteiros.map((roteiro, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {roteiro.veiculo.model} - {roteiro.veiculo.license_plate}
                      {roteiro.veiculo.driver_name && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({roteiro.veiculo.driver_name})
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportarRoteiroPDF(roteiro)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enviarRoteiroWhatsApp(roteiro)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações do roteiro */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Tempo:</strong> {formatarTempo(roteiro.tempo_total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Distância:</strong> {formatarDistancia(roteiro.distancia_total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Entregas:</strong> {roteiro.pedidos.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Peso Total:</strong> {roteiro.pedidos.reduce((total, p) => total + p.peso_total, 0).toFixed(1)}kg
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Sequência de entregas */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Sequência Otimizada de Entregas
                    </h4>
                    <div className="space-y-2">
                      {roteiro.sequencia.map((jobIndex, seqIndex) => {
                        const pedido = roteiro.pedidos[jobIndex - 1];
                        if (!pedido) return null;
                        
                        return (
                          <div 
                            key={seqIndex}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {seqIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{pedido.client_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {pedido.order_number}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {pedido.peso_total.toFixed(1)}kg
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {pedido.endereco_completo}
                              </p>
                              {pedido.items && pedido.items.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {pedido.items.map(item => 
                                    `${item.product_name} (${item.quantity}x)`
                                  ).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estados de loading e vazio */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-500" />
              <div>
                <h3 className="font-medium">Otimizando roteiros...</h3>
                <p className="text-sm text-muted-foreground">
                  Geocodificando endereços e calculando rotas otimizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && roteiros.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Route className="h-12 w-12 mx-auto text-gray-300" />
              <div>
                <h3 className="font-medium text-gray-600">Nenhum roteiro otimizado</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione os pedidos, configure o endereço de origem e clique em "Otimizar Roteiros"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OtimizacaoRoteiroTab;
