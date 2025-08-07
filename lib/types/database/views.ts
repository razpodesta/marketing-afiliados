// lib/types/database/views.ts
/**
 * @file views.ts
 * @description Define os contratos de dados completos para as Views da base de dados.
 *              Esta estrutura agora espelha o formato das definições de tabela,
 *              permitindo que sejam consumidas pelos helpers de tipo genéricos.
 * @author L.I.A Legacy
 * @version 2.0.0 (Structural Consistency)
 */
import { type Enums } from "./enums";

export type UserProfilesWithEmail = {
  Row: {
    app_role: Enums["app_role"] | null;
    avatar_url: string | null;
    email: string | null;
    full_name: string | null;
    id: string | null;
  };
  // As views não têm operações de Insert ou Update, então podemos omiti-las
  // ou defini-las como `never` para consistência.
  Insert: never;
  Update: never;
};

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Consistência Estrutural**: ((Implementada)) A definição do tipo agora está aninhada sob uma propriedade `Row`, espelhando a estrutura dos tipos de Tabela gerados e manuais. Isso permite que o mesmo padrão de helper (`Views<T>`) seja aplicado.
 *
 * @subsection Melhorias Futuras
 * 1. **Geração Automática**: ((Vigente)) Continuar monitorando as atualizações da CLI da Supabase para a eventual geração automática de tipos de Views, o que tornaria este arquivo manual obsoleto.
 */
// lib/types/database/views.ts
