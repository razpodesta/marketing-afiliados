// .docs/CANVA-DESIGN-DOCS/blueprint-canvasuite.md
Aparato de Trabalho N.º 33: Blueprint Arquitetônico do Construtor de Campanhas (Versão 3.1 - Estrutura de Templates Sincronizada)
Visão Geral (Atualizada)
Passamos do planejamento para a implementação bem-sucedida das etapas fundamentais do Construtor de Campanhas. A visão de um editor visual (WYSIWYG) modular, com estado centralizado e renderização desacoplada, não apenas se mantém, mas foi validada e construída. Este documento atualiza o blueprint original para refletir o progresso realizado, as decisões arquitetônicas tomadas e o caminho claro para a finalização.

Fase 1: Estrutura de Arquivos e Diretórios (Implementada e Refinada)
Nossa estrutura de arquivos evoluiu e se solidificou. A decisão de co-localizar os blocos de template dentro de uma estrutura granular foi uma melhoria chave implementada.

Estrutura Atual (Implementada):

app/
└── [locale]/
    └── builder/
        ├── [campaignId]/
        │   ├── layout.tsx // ✅ FEITO: Orquestra o DndContext e a UI de edição.
        │   └── page.tsx   // ✅ FEITO: Carrega dados do Supabase e inicializa o store.
        └── core/
            └── store.ts   // ✅ FEITO: Cérebro de estado do construtor (Zustand).
components/
├── builder/
│   ├── BlocksPalette.tsx         // ✅ FEITO: Mostra blocos arrastáveis.
│   ├── BuilderHeader.tsx         // ✅ FEITO: Contém ações principais (Salvar).
│   ├── Canvas.tsx                // ✅ FEITO: Renderiza os blocos do store.
│   ├── DraggableBlockWrapper.tsx // ✅ FEITO: HOC para interatividade de blocos.
│   └── SettingsPanel.tsx         // ✅ FEITO: Painel de edição dinâmico.
└── templates/                    // ✅ FEITO (Re-localizado e Granular): Biblioteca central de blocos.
    ├── Headers/
    │   └── Header1/
    │       └── index.tsx         // ✅ FEITO: Implementação do bloco Header1.
    ├── Heros/
    │   └── Hero1/
    │       └── index.tsx         // ✅ FEITO: Implementação do bloco Hero1.
    └── index.ts                  // ✅ FEITO: Registro central de blocos.
lib/
└── builder/
    └── types.d.ts            // ✅ FEITO: Nosso "contrato de dados" oficial.

Lógica e Justificação (Validada):
Isolamento Bem-sucedido: A rota `/builder` está completamente isolada, com seu próprio layout, permitindo uma experiência de edição imersiva.
Modularidade Comprovada: A estrutura granular dentro de `/templates` e o registro central em `index.ts` simplificaram as importações e tornaram a adição de novos blocos um processo claro e escalável.
Componentes de Responsabilidade Única: A separação de Canvas, SettingsPanel, BlocksPalette, etc., demonstrou ser uma arquitetura limpa que nos permitiu construir e iterar rapidamente.

Fase 2: Seleção de Tecnologias Chave (Implementadas)
Todas as nossas escolhas tecnológicas iniciais foram implementadas e provaram ser as corretas para o trabalho.

Gestão de Estado (Zustand): Implementado e Funcional.
Drag and Drop (@dnd-kit): Implementado e Funcional.
Renderização no Canvas: Implementado e Funcional.

Fase 3: Modelo de Dados no Supabase (Implementado e Refinado)
Refinamos e expandimos nosso modelo de dados. A tabela `campaigns` com a coluna `content (jsonb)` está implementada e funcional.

Fase 4: Plano de Implementação por Etapas (Progresso e Próximos Passos)
Completamos uma parte significativa do plano.

Etapa 1: O Núcleo do Construtor: ✅ CONCLUÍDO.
Etapa 2: Interatividade e Biblioteca de Blocos: ✅ CONCLUÍDO.
Etapa 3: Persistência e Publicação: PARCIALMENTE CONCLUÍDO.
`updateCampaignContentAction`: ✅ FEITO. Temos a Server Action que permite salvar o estado.
Página de Publicação (`/s/[subdomain]/[slug]`): ⏳ PRÓXIMO PASSO CRÍTICO.

Conclusão do Blueprint Atualizado
O blueprint do Construtor de Campanhas passou de um plano teórico para uma realidade funcional e arquitetonicamente sólida. Nossas decisões tecnológicas foram validadas, e a estrutura modular que projetamos nos permitiu avançar rapidamente sem sacrificar a qualidade. O projeto está em um estado saudável e o caminho a seguir é claro.
// .docs/CANVA-DESIGN-DOCS/blueprint-canvasuite.md