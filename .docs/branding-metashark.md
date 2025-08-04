La identidad de marca de "Metashark" está definida de manera programática y centralizada, lo cual es una práctica de élite. La fuente de verdad para todos los tokens de diseño (colores, fuentes, radios) reside en styles/theme.ts. Este archivo alimenta tanto las variables CSS globales (a través del script generate-theme-css.mjs) como la configuración de Tailwind CSS, garantizando una consistencia absoluta.
Tipografía Canónica
Fuente Principal: Geist Sans.
Implementación: Importada en app/layout.tsx y aplicada globalmente a través de una variable CSS (--font-geist-sans) que es consumida por tailwind.config.mjs.
Evaluación: 10/10. Geist Sans es una fuente moderna, legible y de alto rendimiento desarrollada por Vercel. Su elección indica un enfoque en la calidad de la UI y la experiencia de usuario.
Paleta de Colores de Branding
La paleta de colores utiliza el formato HSL (Tono, Saturación, Luminosidad), lo que permite una fácil manipulación de la opacidad y la creación de variantes.


Tema Oscuro (Por defecto):
primary (Primario/Acento): hsl(74 92% 56%) - Verde Lima Eléctrico (#ADFF2F).
Uso: Es el color de acento principal, utilizado para botones de acción, enlaces activos, y elementos que requieren la atención del usuario.
Psicología: Energía, crecimiento, tecnología, innovación. Es un color audaz y moderno.
background (Fondo): hsl(224 71% 4%) - Azul Casi Negro (#010816).
Uso: Fondo principal de la aplicación.
Psicología: Sofisticación, profundidad, profesionalismo, enfoque.
card (Tarjetas): hsl(224 71% 8%) - Azul Oscuro (#0a192f).
Uso: Fondo para componentes de tarjeta, creando una sutil separación del fondo principal.
secondary (Secundario): hsl(226 78% 58%) - Azul Brillante (#5899f5).
Uso: Para elementos de UI secundarios que necesitan destacar pero sin competir con el primario.
destructive (Destructivo): hsl(0 63% 31%) - Rojo Oscuro (#b91c1c).
Uso: Para acciones peligrosas como botones de eliminar o mensajes de error.
Tema Claro:
primary (Primario/Acento): hsl(74 80% 45%) - Verde Lima Suavizado (#74b816).
Uso: Una versión del color primario con más saturación y menos brillo para una mejor legibilidad sobre fondos claros.
background (Fondo): hsl(0 0% 100%) - Blanco Puro (#FFFFFF).
secondary (Secundario): hsl(226 90% 96%) - Azul Hielo Claro (#eef4ff).
Veredicto de Branding:
La paleta de colores y la tipografía son de Nivel de Élite (10/10).
Cohesión: La combinación del verde lima eléctrico con los azules oscuros crea un contraste alto y una identidad visual fuerte, tecnológica y memorable.
Consistencia: El uso de una única fuente de verdad (styles/theme.ts) garantiza que la marca sea consistente en toda la aplicación.
Accesibilidad: Los colores han sido seleccionados para tener un buen contraste, especialmente en el tema oscuro, lo que favorece la legibilidad.