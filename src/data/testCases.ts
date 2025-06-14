
import { TestCategory } from '@/types/testing.types';

export const testCategories: TestCategory[] = [
  {
    id: 'auth',
    name: 'Autenticação',
    color: 'bg-blue-500',
    icon: '🔐',
    tests: [
      {
        id: 'auth-login',
        category: 'auth',
        title: 'Login de usuário',
        description: 'Verificar se o login funciona corretamente',
        steps: [
          'Ir para página /auth',
          'Inserir email e senha válidos',
          'Clicar em "Entrar"',
          'Verificar se foi redirecionado para página inicial',
          'Verificar se o usuário está logado'
        ],
        status: 'not_tested'
      },
      {
        id: 'auth-signup',
        category: 'auth',
        title: 'Cadastro de usuário',
        description: 'Verificar se o cadastro funciona corretamente',
        steps: [
          'Ir para página /auth',
          'Clicar em "Criar conta"',
          'Inserir email e senha',
          'Clicar em "Cadastrar"',
          'Verificar se conta foi criada com sucesso'
        ],
        status: 'not_tested'
      },
      {
        id: 'auth-logout',
        category: 'auth',
        title: 'Logout de usuário',
        description: 'Verificar se o logout funciona corretamente',
        steps: [
          'Estar logado no sistema',
          'Clicar no botão de logout',
          'Verificar se foi redirecionado para página de login',
          'Tentar acessar página protegida',
          'Verificar se foi bloqueado'
        ],
        status: 'not_tested'
      }
    ]
  },
  {
    id: 'events',
    name: 'Eventos',
    color: 'bg-purple-500',
    icon: '🎟️',
    tests: [
      {
        id: 'events-list',
        category: 'events',
        title: 'Listagem de eventos',
        description: 'Verificar se os eventos aparecem na página inicial',
        steps: [
          'Acessar página inicial /',
          'Verificar se eventos são carregados',
          'Verificar se imagens aparecem',
          'Verificar se informações estão corretas',
          'Testar responsividade'
        ],
        status: 'not_tested'
      },
      {
        id: 'events-details',
        category: 'events',
        title: 'Detalhes do evento',
        description: 'Verificar página de detalhes do evento',
        steps: [
          'Clicar em um evento da lista',
          'Verificar se página carrega corretamente',
          'Verificar se todas informações aparecem',
          'Verificar se botão de compra funciona',
          'Testar diferentes lotes de preços'
        ],
        status: 'not_tested'
      },
      {
        id: 'events-create',
        category: 'events',
        title: 'Criar evento (Admin)',
        description: 'Verificar criação de novos eventos',
        steps: [
          'Fazer login como admin',
          'Ir para /events/create',
          'Preencher todos os campos',
          'Fazer upload de imagem',
          'Salvar evento',
          'Verificar se aparece na listagem'
        ],
        status: 'not_tested'
      }
    ]
  },
  {
    id: 'payments',
    name: 'Pagamentos',
    color: 'bg-green-500',
    icon: '💳',
    tests: [
      {
        id: 'payments-checkout',
        category: 'payments',
        title: 'Processo de checkout',
        description: 'Verificar fluxo completo de compra',
        steps: [
          'Selecionar um evento',
          'Escolher quantidade de ingressos',
          'Ir para checkout',
          'Preencher dados pessoais',
          'Escolher forma de pagamento',
          'Finalizar compra'
        ],
        status: 'not_tested'
      },
      {
        id: 'payments-pix',
        category: 'payments',
        title: 'Pagamento PIX',
        description: 'Verificar geração de QR code PIX',
        steps: [
          'Ir até checkout',
          'Selecionar PIX como pagamento',
          'Verificar se QR code é gerado',
          'Verificar se código de barras aparece',
          'Testar status do pagamento'
        ],
        status: 'not_tested'
      },
      {
        id: 'payments-card',
        category: 'payments',
        title: 'Pagamento cartão',
        description: 'Verificar pagamento com cartão de crédito',
        steps: [
          'Ir até checkout',
          'Selecionar cartão como pagamento',
          'Preencher dados do cartão',
          'Escolher parcelas',
          'Finalizar pagamento',
          'Verificar confirmação'
        ],
        status: 'not_tested'
      }
    ]
  },
  {
    id: 'vouchers',
    name: 'Vouchers',
    color: 'bg-orange-500',
    icon: '🎫',
    tests: [
      {
        id: 'vouchers-list',
        category: 'vouchers',
        title: 'Lista de vouchers',
        description: 'Verificar se vouchers aparecem corretamente',
        steps: [
          'Fazer login',
          'Ir para /vouchers',
          'Verificar se vouchers comprados aparecem',
          'Verificar se informações estão corretas',
          'Testar responsividade'
        ],
        status: 'not_tested'
      },
      {
        id: 'vouchers-qr',
        category: 'vouchers',
        title: 'QR Code do voucher',
        description: 'Verificar geração de QR codes',
        steps: [
          'Acessar página de vouchers',
          'Verificar se QR code aparece',
          'Verificar se código é único',
          'Testar download/compartilhamento',
          'Verificar legibilidade'
        ],
        status: 'not_tested'
      },
      {
        id: 'vouchers-validate',
        category: 'vouchers',
        title: 'Validação de ingresso',
        description: 'Verificar scanner de QR codes',
        steps: [
          'Ir para /validate-ticket',
          'Abrir câmera do celular',
          'Escanear QR code válido',
          'Verificar se reconhece o ingresso',
          'Testar QR code inválido'
        ],
        status: 'not_tested'
      }
    ]
  },
  {
    id: 'admin',
    name: 'Administração',
    color: 'bg-red-500',
    icon: '⚙️',
    tests: [
      {
        id: 'admin-dashboard',
        category: 'admin',
        title: 'Dashboard admin',
        description: 'Verificar painel administrativo',
        steps: [
          'Fazer login como admin',
          'Ir para /admin',
          'Verificar se dados carregam',
          'Verificar gráficos e estatísticas',
          'Testar navegação entre seções'
        ],
        status: 'not_tested'
      },
      {
        id: 'admin-users',
        category: 'admin',
        title: 'Gestão de usuários',
        description: 'Verificar gerenciamento de usuários',
        steps: [
          'Ir para /admin/users',
          'Verificar lista de usuários',
          'Testar filtros e busca',
          'Verificar permissões',
          'Testar alteração de roles'
        ],
        status: 'not_tested'
      },
      {
        id: 'admin-financial',
        category: 'admin',
        title: 'Relatórios financeiros',
        description: 'Verificar relatórios de vendas',
        steps: [
          'Ir para /admin/financeiro',
          'Verificar dados de vendas',
          'Testar filtros por período',
          'Verificar exportação de dados',
          'Validar cálculos'
        ],
        status: 'not_tested'
      }
    ]
  },
  {
    id: 'profile',
    name: 'Perfil & Fidelidade',
    color: 'bg-indigo-500',
    icon: '👤',
    tests: [
      {
        id: 'profile-edit',
        category: 'profile',
        title: 'Editar perfil',
        description: 'Verificar edição de dados pessoais',
        steps: [
          'Ir para /profile',
          'Editar informações pessoais',
          'Alterar foto de perfil',
          'Salvar alterações',
          'Verificar se dados foram salvos'
        ],
        status: 'not_tested'
      },
      {
        id: 'profile-loyalty',
        category: 'profile',
        title: 'Pontos de fidelidade',
        description: 'Verificar sistema de pontos',
        steps: [
          'Verificar saldo de pontos',
          'Fazer uma compra',
          'Verificar se pontos foram creditados',
          'Ir para /rewards',
          'Testar resgate de recompensas'
        ],
        status: 'not_tested'
      },
      {
        id: 'profile-referral',
        category: 'profile',
        title: 'Sistema de indicações',
        description: 'Verificar código de indicação',
        steps: [
          'Acessar perfil',
          'Verificar código de indicação',
          'Compartilhar código',
          'Registrar nova conta com código',
          'Verificar se indicação foi contabilizada'
        ],
        status: 'not_tested'
      }
    ]
  }
];
