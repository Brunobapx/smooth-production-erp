import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommissionFilters } from './CommissionFilters';
import { CommissionTable } from './CommissionTable';
import { CommissionGenerationTable } from './CommissionGenerationTable';
import { useCommissionReport } from '@/hooks/useCommissionReport';
import { useCommissionGeneration } from '@/hooks/useCommissionGeneration';

export const CommissionReport = () => {
  const [isGenerationMode, setIsGenerationMode] = useState(false);
  const {
    commissions,
    loading,
    filters,
    updateFilters,
    totalCommissions,
    totalSales
  } = useCommissionReport();
  
  const {
    selectedCommissions,
    generating,
    handleSelectionChange,
    handleSelectAll,
    handleClearAll,
    getSelectedTotal,
    generateCommissions
  } = useCommissionGeneration();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatório de Comissões</CardTitle>
            <Button
              variant={isGenerationMode ? "secondary" : "default"}
              onClick={() => setIsGenerationMode(!isGenerationMode)}
            >
              {isGenerationMode ? "Modo Visualização" : "Gerar Comissões"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CommissionFilters
            filters={filters}
            onFiltersChange={updateFilters}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total de Vendas</div>
                <div className="text-2xl font-bold">
                  R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total de Comissões</div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">% Comissão Média</div>
                <div className="text-2xl font-bold">
                  {totalSales > 0 ? ((totalCommissions / totalSales) * 100).toFixed(2) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
          
          {isGenerationMode ? (
            <CommissionGenerationTable
              commissions={commissions}
              loading={loading}
              selectedCommissions={selectedCommissions}
              onSelectionChange={handleSelectionChange}
              onSelectAll={() => handleSelectAll(commissions)}
              onClearAll={handleClearAll}
              onGenerateCommissions={() => generateCommissions(commissions)}
              selectedTotal={getSelectedTotal(commissions)}
            />
          ) : (
            <CommissionTable
              commissions={commissions}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};