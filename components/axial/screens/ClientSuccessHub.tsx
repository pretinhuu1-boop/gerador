'use client';

import React, { useState } from 'react';
import { 
  Users, MessageSquare, Mail, Phone, Calendar, Star, AlertCircle, 
  CheckCircle, Clock, TrendingUp, FileText, Send, Plus, Search,
  Filter, MoreVertical, ThumbsUp, ThumbsDown, MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

interface Client {
  id: string;
  name: string;
  company: string;
  avatar: string;
  status: 'active' | 'onboarding' | 'at-risk' | 'inactive';
  nps: number;
  lastContact: string;
  contractValue: number;
  nextMeeting: string;
  pendingApprovals: number;
  openTickets: number;
}

interface Interaction {
  id: string;
  clientId: string;
  type: 'message' | 'email' | 'call' | 'meeting' | 'approval';
  content: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'overdue';
  agent: string;
}

const ClientSuccessHub: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - would come from API
  const clients: Client[] = [
    {
      id: '1',
      name: 'Maria Silva',
      company: 'TechStart Ltda',
      avatar: '👩‍💼',
      status: 'active',
      nps: 9,
      lastContact: '2h atrás',
      contractValue: 8500,
      nextMeeting: 'Amanhã, 14:00',
      pendingApprovals: 2,
      openTickets: 1
    },
    {
      id: '2',
      name: 'João Santos',
      company: 'Café Aroma',
      avatar: '👨‍🍳',
      status: 'onboarding',
      nps: 0,
      lastContact: '30min atrás',
      contractValue: 4200,
      nextMeeting: 'Hoje, 16:30',
      pendingApprovals: 5,
      openTickets: 3
    },
    {
      id: '3',
      name: 'Ana Costa',
      company: 'Moda Urban',
      avatar: '👗',
      status: 'at-risk',
      nps: 6,
      lastContact: '1d atrás',
      contractValue: 12000,
      nextMeeting: '2 dias',
      pendingApprovals: 0,
      openTickets: 2
    }
  ];

  const interactions: Interaction[] = [
    {
      id: '1',
      clientId: '1',
      type: 'message',
      content: 'Olá! Gostaria de saber o status do post sobre o lançamento.',
      timestamp: '2h atrás',
      status: 'completed',
      agent: 'CSAgent'
    },
    {
      id: '2',
      clientId: '2',
      type: 'approval',
      content: 'Aprovação pendente: Calendário Editorial - Maio',
      timestamp: '1h atrás',
      status: 'pending',
      agent: 'SMAgent'
    },
    {
      id: '3',
      clientId: '3',
      type: 'email',
      content: 'Reclamação sobre atraso na entrega dos reels.',
      timestamp: '1d atrás',
      status: 'overdue',
      agent: 'CSAgent'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'onboarding': return 'bg-blue-500';
      case 'at-risk': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getNPSColor = (nps: number) => {
    if (nps >= 9) return 'text-green-600';
    if (nps >= 7) return 'text-yellow-600';
    if (nps > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Lista de Clientes */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Clientes</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="flex-1"
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === 'at-risk' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('at-risk')}
              className="flex-1"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Risco
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedClient === client.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{client.avatar}</span>
                  <div>
                    <h3 className="font-medium text-sm">{client.name}</h3>
                    <p className="text-xs text-gray-500">{client.company}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`} />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>NPS: <span className={getNPSColor(client.nps)}>{client.nps > 0 ? client.nps : '-'}</span></span>
                <span>{client.lastContact}</span>
              </div>

              {(client.pendingApprovals > 0 || client.openTickets > 0) && (
                <div className="flex gap-2 mt-2">
                  {client.pendingApprovals > 0 && (
                    <Badge variant="warning" className="text-xs">
                      {client.pendingApprovals} aprovações
                    </Badge>
                  )}
                  {client.openTickets > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {client.openTickets} tickets
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Detalhes do Cliente */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedClientData ? (
          <>
            {/* Header do Cliente */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{selectedClientData.avatar}</span>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedClientData.name}</h1>
                    <p className="text-gray-600">{selectedClientData.company}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={selectedClientData.status === 'active' ? 'success' : 'warning'}>
                        {selectedClientData.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Contrato: R$ {selectedClientData.contractValue.toLocaleString('pt-BR')}/mês
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligação
                  </Button>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Nova Mensagem
                  </Button>
                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">NPS Atual</span>
                    </div>
                    <p className={`text-2xl font-bold ${getNPSColor(selectedClientData.nps)}`}>
                      {selectedClientData.nps > 0 ? selectedClientData.nps : 'Novo'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Último Contato</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedClientData.lastContact}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Próxima Reunião</span>
                    </div>
                    <p className="text-lg font-semibold">{selectedClientData.nextMeeting}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600">Saúde Geral</span>
                    </div>
                    <Progress value={selectedClientData.nps > 0 ? (selectedClientData.nps / 10) * 100 : 50} className="h-2" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Coluna Esquerda - Interações Recentes */}
                <div className="col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Interações Recentes</span>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Registrar
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {interactions
                          .filter(i => i.clientId === selectedClientData.id)
                          .map(interaction => (
                            <div key={interaction.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                interaction.type === 'message' ? 'bg-blue-100' :
                                interaction.type === 'email' ? 'bg-green-100' :
                                interaction.type === 'call' ? 'bg-purple-100' :
                                'bg-orange-100'
                              }`}>
                                {interaction.type === 'message' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                                {interaction.type === 'email' && <Mail className="w-5 h-5 text-green-600" />}
                                {interaction.type === 'call' && <Phone className="w-5 h-5 text-purple-600" />}
                                {interaction.type === 'approval' && <FileText className="w-5 h-5 text-orange-600" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium">{interaction.content}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {interaction.agent} • {interaction.timestamp}
                                    </p>
                                  </div>
                                  <Badge variant={
                                    interaction.status === 'completed' ? 'success' :
                                    interaction.status === 'pending' ? 'warning' : 'destructive'
                                  }>
                                    {interaction.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {interaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                    {interaction.status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {interaction.status}
                                  </Badge>
                                </div>
                                {interaction.status === 'pending' && (
                                  <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline">
                                      <ThumbsUp className="w-3 h-3 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                      Comentar
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna Direita - Ações e Informações */}
                <div className="space-y-6">
                  {/* Próximas Ações */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Próximas Ações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Reunião Mensal
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Enviar Pesquisa NPS
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Send className="w-4 h-4 mr-2" />
                        Follow-up Pendências
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Dados do Contrato */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dados do Contrato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Início:</span>
                        <span className="font-medium">01/01/2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vencimento:</span>
                        <span className="font-medium">31/12/2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renovação:</span>
                        <span className="font-medium text-orange-600">Em 60 dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Serviços:</span>
                        <span className="font-medium">Social + Copy + Design</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alertas */}
                  {selectedClientData.status === 'at-risk' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Cliente em Risco</AlertTitle>
                      <AlertDescription>
                        NPS abaixo de 7. Recomenda-se contato imediato do gestor.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Selecione um cliente</h3>
              <p>Escolha um cliente na lista lateral para visualizar detalhes e interações.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSuccessHub;
