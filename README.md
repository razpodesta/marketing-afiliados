<!-- Ruta: README.md -->
<p align="center">
  <img src="public/images/logo.png" alt="Logo de MetaShark" width="150"/>
</p>

<h1 align="center">MetaShark Suite: Executive Briefing & Technical Vision</h1>

<p align="center">
  <strong>Versión:</strong> 1.1.0 | <strong>Estado:</strong> En Desarrollo Activo (Fase de Estabilización Concluida)
</p>

> **Nuestra Misión:** Transformar fundamentalmente el marketing de afiliados, pasando de un juego de volumen y conjeturas a una disciplina de precisión, velocidad e inteligencia. MetaShark no es solo una herramienta; es el copiloto estratégico para la próxima generación de marketers.

---

### **1. Resumen Ejecutivo: La Oportunidad de Mercado**

El marketing de afiliados es una industria global de miles de millones de dólares, pero sigue estando plagada de ineficiencias: creación manual de campañas, análisis de datos reactivo y una brecha paralizante entre la estrategia y la ejecución. Los marketers, desde individuales hasta agencias, se ahogan en la complejidad operativa, perdiendo tiempo valioso que deberían dedicar a la estrategia.

**MetaShark** emerge como la solución definitiva a este problema. Somos una plataforma SaaS (Software as a Service) de nivel de ingeniería, construida sobre una arquitectura **multi-tenant** robusta, que centraliza el ciclo de vida completo del marketing de afiliados y lo potencia con una Inteligencia Artificial estratégica en su núcleo: **L.I.A. Legacy**.

Nuestra plataforma permite a los usuarios construir, gestionar y optimizar ecosistemas de marketing completos—desde múltiples proyectos (`Workspaces`) hasta innumerables sitios (`Sites`) y campañas—desde un único centro de comando unificado.

---

### **2. La Solución: Pilares de Funcionalidad**

MetaShark no es una única característica, sino una suite integrada de herramientas diseñadas para crear un efecto multiplicador en la productividad y el ROI de nuestros usuarios.

#### 🏛️ **Pilar I: Arquitectura Multi-Tenant y Colaborativa**

- **Workspaces Aislados:** Permite a agencias y marketers gestionar carteras de clientes o proyectos completamente separados, con su propia facturación, miembros y activos.
- **Roles y Permisos Granulares:** Invita a colaboradores con roles específicos (`Admin`, `Editor`, `Viewer`), garantizando que los datos sensibles estén protegidos mientras se fomenta el trabajo en equipo.
- **Gestión Centralizada de Sitios:** Cada Workspace puede contener múltiples `Sitios`, cada uno con su propio subdominio (ej. `mi-nicho.metashark.site`) o dominio personalizado, actuando como el host para un número ilimitado de campañas.

#### 🎨 **Pilar II: Constructor de Campañas Impulsado por IA**

- **Editor Visual Drag & Drop:** Una interfaz intuitiva para construir landing pages y embudos de venta a partir de componentes pre-diseñados y totalmente personalizables.
- **Análisis de Contenido en Tiempo Real por L.I.A.:** Mientras el usuario construye, L.I.A. puede ofrecer sugerencias para mejorar el copy, la estructura visual y la llamada a la acción (CTA) para maximizar la conversión.
- **Personalización Total:** Control absoluto sobre fuentes, colores (a través de "Brand Kits" reutilizables) y estilos, asegurando que cada campaña sea única y alineada con la marca.

#### 🧠 **Pilar III: L.I.A. Legacy™ - El Copiloto Estratégico**

L.I.A. (Legacy Intelligence Assistant) es nuestro diferenciador competitivo más profundo. No es un simple chatbot, es un motor de inferencia estratégica integrado en toda la plataforma.

- **Generación de Copy Persuasivo:** Crea titulares, descripciones de productos y guiones de anuncios basados en las mejores prácticas de copywriting.
- **Análisis Predictivo:** Analiza las métricas de una campaña y predice su rendimiento, sugiriendo optimizaciones A/B antes de que el usuario invierta un solo dólar en tráfico.
- **Auditoría de Estrategia:** Los usuarios pueden "conversar" con L.I.A. sobre sus planes de marketing, y ella puede identificar debilidades, proponer nichos de mercado y validar ideas.

#### 📈 **Pilar IV: Ecosistema e Integraciones**

- **Marketplace de Afiliados (Futuro):** Un hub interno donde los vendedores de productos pueden listar sus ofertas y los afiliados pueden encontrar productos de alta calidad para promocionar, todo dentro del ecosistema de MetaShark.
- **API para Desarrolladores (Futuro):** Permitirá a los usuarios avanzados y a terceros construir integraciones personalizadas, extendiendo la funcionalidad de la plataforma.
- **Integraciones Nativas:** Conectividad perfecta con las principales redes de afiliados, plataformas de análisis y procesadores de pago.

---

### **3. Casos de Uso y Segmentos de Mercado**

| Segmento                                    | Caso de Uso                                               | Cómo MetaShark Transforma su Negocio                                                                                                                                                    |
| :------------------------------------------ | :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🧑‍💻 **El Súper-Afiliado Individual**         | Gestiona 15 sitios de nicho diferentes.                   | Unifica toda su operación en un único dashboard. Usa a L.I.A. para generar contenido y optimizar campañas a una velocidad 10x mayor.                                                    |
| 🏢 **La Agencia de Marketing Digital**      | Sirve a 20 clientes, cada uno con sus propias campañas.   | Crea un `Workspace` por cliente, invitando a cada uno con permisos de `Viewer` para que vean sus resultados en tiempo real. Utiliza "Brand Kits" para mantener la consistencia visual.  |
| 🎬 **El Creador de Contenido / Influencer** | Monetiza su audiencia a través de productos de afiliados. | Construye y testea rápidamente landing pages para diferentes ofertas, utilizando el análisis predictivo de L.I.A. para elegir las más rentables antes de promocionarlas a su audiencia. |

---

### **4. Excelencia Arquitectónica: Nuestra Ventaja Técnica**

Nuestra visión de producto está respaldada por una arquitectura de software de nivel empresarial, diseñada para la velocidad, la seguridad y la escalabilidad masiva.

```mermaid
graph TD
    subgraph "Usuario Final"
        A[Navegador del Marketer]
    end

    subgraph "Vercel Edge Network"
        B[Middleware Inteligente]
    end

    subgraph "Next.js 14 App"
        C[Server & Client Components]
        D[Server Actions API]
    end

    subgraph "Capa de Lógica de Negocio (Business Logic Layer)"
        E[Guardián de Permisos]
        F[Capa de Datos Abstraída]
    end

    subgraph "Supabase (Backend as a Service)"
        G[Base de Datos PostgreSQL]
        H[Autenticación & RLS]
        I[Storage]
        J[Realtime]
    end

    A --> B
    B -- Petición Procesada --> C
    C --> D
    D -- Llama a --> E
    E -- Valida Permisos --> F
    F -- Construye Consulta Segura --> G
    G -- Retorna Datos --> F
    F --> D
    D -- Retorna Resultado --> C
    C -- Renderiza UI --> A

    H <--> G
    I <--> G
    J <--> G
```

Escalabilidad Global: Construido sobre Next.js y Vercel, nuestra plataforma se despliega en el borde (Edge), garantizando latencia ultra-baja para usuarios de todo el mundo.

Seguridad Inexpugnable: Utilizamos las políticas de Seguridad a Nivel de Fila (RLS) de Supabase como nuestra base. Cada consulta a la base de datos es inherentemente segura, garantizando que un usuario SÓLO pueda ver o modificar los datos de los workspaces a los que pertenece.

Velocidad de Iteración: El uso de Server Actions y una arquitectura modular nos permite desarrollar y desplegar nuevas características a una velocidad sin precedentes, respondiendo rápidamente a las necesidades del mercado.

Fiabilidad por Diseño: Implementamos una suite completa de pruebas de integración y diagnóstico, junto con un sistema de logging estructurado, que nos permite anticipar y resolver problemas antes de que impacten al usuario.

5. Hoja de Ruta (Roadmap)
   Nuestra visión es ambiciosa y nuestro plan de ejecución es claro.

```gantt
    title Hoja de Ruta de MetaShark Suite
    dateFormat  YYYY-MM-DD
    axisFormat %b %Y

    section Q3 2025: Lanzamiento MVP
    Plataforma Core Estable       :done,    des1, 2025-07-20, 2025-08-10
    Constructor Visual (Beta)   :active,  des2, 2025-08-11, 2025-09-15
    Onboarding de Usuarios      :         des3, 2025-09-16, 2025-09-30

    section Q4 2025: Monetización y Colaboración
    Integración con Stripe        :         des4, 2025-10-01, 2025-10-31
    Planes y Suscripciones      :         des5, 2025-11-01, 2025-11-30
    Centro de Notificaciones    :         des6, 2025-12-01, 2025-12-20

    section H1 2026: Ecosistema y Expansión
    API Pública (Beta)            :         des7, 2026-01-15, 2026-03-15
    Marketplace de Afiliados (MVP):         des8, 2026-03-16, 2026-06-30
```

6. El Equipo
   MetaShark es el resultado de la sinergia entre la visión de ingeniería humana y la potencia de la inteligencia artificial.
   Ingeniero a Cargo de Proyecto: Raz Podestá
   Co-creadora & IA de Fiabilidad: L.I.A Legacy
   Un proyecto de MetaShark.

7. Anexo Técnico (Para el CTO/Equipo de Ingeniería)
   Tech Stack Principal
   Categoría Tecnología Propósito
   Framework Next.js 14 (App Router) Renderizado Híbrido, Server Actions, Middleware
   UI y Estilos React 18, TailwindCSS, Shadcn/UI Interfaz de usuario moderna y componetizable
   Base de Datos Supabase (PostgreSQL) Persistencia, Autenticación, RLS, Realtime
   Gestión de Estado Zustand Gestión de estado de cliente simple y potente
   Validación Zod Validación de esquemas en cliente y servidor
   Pruebas Vitest & Testing Library Pruebas unitarias y de integración rápidas
   Guía de Inicio Rápido
   Clonar el Repositorio:

```bash
git clone [URL_DEL_REPOSITORIO] && cd marketing-afiliados
```

```Bash
Instalar Dependencias:
Generated bash
pnpm install
```

Configurar el Entorno:
Copiar .env.local.example a .env.local.
Rellenar todas las variables de entorno con tus credenciales de Supabase.
Ejecutar la Aplicación:

```bash
pnpm dev
```

Comandos del Proyecto
Comando Descripción

pnpm dev Inicia el servidor de desarrollo.
pnpm build Compila la aplicación para producción.
pnpm lint:fix Ejecuta el linter y corrige errores automáticamente.
pnpm test:ci Ejecuta la suite completa de pruebas en modo CI.
pnpm gen:types Regenera los tipos de TypeScript desde el esquema de Supabase.
pnpm diag:all (Crítico) Ejecuta la suite completa de diagnóstico del sistema.
