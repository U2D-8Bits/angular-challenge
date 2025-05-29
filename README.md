# AngularChallengeApp

Aplicación de gestión y aprobación de promociones de productos, desarrollada en Angular 19+.

## Estructura del Proyecto

```
angularChallengeApp/
├── src/
│   ├── app/
│   │   ├── core/                # Servicios y guards de autenticación, productos y promociones
│   │   ├── environments/        # Configuración de entornos
│   │   ├── features/            # Módulos de funcionalidades principales (analysts, sales-management, auth)
│   │   ├── layout/              # Componentes de layout (Full/Simple)
│   │   ├── shared/              # Componentes, modelos, pipes y directivas reutilizables
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   └── app.*                # Módulo raíz y configuración de rutas
│   ├── assets/                  # Recursos estáticos
│   └── styles.css               # Estilos globales
├── angular.json                 # Configuración Angular CLI
├── package.json                 # Dependencias y scripts
├── tsconfig*.json               # Configuración TypeScript
└── README.md                    # Documentación
```

## Requisitos Previos

- Node.js 18.x o superior
- Angular CLI 19.x o superior (`npm install -g @angular/cli`)

## Instalación

1. Clona el repositorio y entra al directorio del proyecto:

   ```bash
   git clone <https://github.com/U2D-8Bits/angular-challenge.git>
   cd angularChallengeApp
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

## Ejecución en Desarrollo

Inicia el servidor de desarrollo:

```bash
ng serve
```

Abre tu navegador en [http://localhost:4200](http://localhost:4200)

## Scripts Útiles

- `ng serve`         # Servidor de desarrollo
- `ng build`         # Compilar para producción
- `ng test`          # Ejecutar pruebas unitarias
- `ng e2e`           # Pruebas end-to-end (si están configuradas)

## Estructura de Carpetas Clave

- **app/core/services/**: Servicios de autenticación, productos y promociones
- **app/features/**: Vistas principales (analistas, gerencia, login)
- **app/shared/components/**: Componentes reutilizables (header, footer, cards, inputs, etc.)
- **app/shared/models/**: Modelos TypeScript para usuarios, productos, promociones, roles

## Notas de Uso

- El sistema requiere autenticación. Los usuarios pueden iniciar sesión como "analyst" o "manager".
- El flujo de promociones y aprobaciones está gestionado por roles y persistido en localStorage.
- El diseño es responsivo y utiliza TailwindCSS.

## Personalización

- Para agregar nuevos productos, usuarios o roles, modifica los servicios en `app/core/services/` o la fuente de datos correspondiente.
- Para cambiar el diseño, edita los componentes en `app/shared/components/` y los estilos globales en `src/styles.css`.

## Recursos

- [Documentación Angular](https://angular.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

Si tienes dudas o problemas, revisa la documentación de Angular o abre un issue en el repositorio.
