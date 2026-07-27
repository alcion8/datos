# 📗 GUÍA DE CONFIGURACIÓN Y TRABAJO COLABORATIVO EN GITHUB
## Registro de Terrenos Urbanos y Catastro Municipal (Acceso Controlado: 4 Personas)

Esta guía explica en detalle cómo conectar el archivo **Excel de Registro de Terrenos** y el **Dashboard Web** a un repositorio de **GitHub** para permitir que las 4 personas autorizadas trabajen en equipo sin perder datos ni generar conflictos.

---

## 🔑 1. Control de Accesos y Usuarios Autorizados

El sistema está configurado con **4 perfiles únicos**. Cada integrante posee un ID y un PIN/Clave personal de acceso:

| ID Usuario | Nombre Completo | Cargo / Rol Catastral | Clave de Acceso / PIN | Permisos en GitHub |
| :--- | :--- | :--- | :--- | :--- |
| **`USR-CAT-01`** | Ing. Roberto Gómez | Director de Catastro | `CAT-9821-KEY` | **Admin** (Aprobación, Push & Pull) |
| **`USR-JUR-02`** | Dra. Elena Rostova | Asesora Jurídica | `JUR-4410-KEY` | **Editor** (Estatus Legal & Títulos) |
| **`USR-INS-03`** | Arq. Carlos Mendoza | Inspector Zonal 1 | `INS-7732-KEY` | **Editor** (Mediciones & Nuevos Predios) |
| **`USR-INS-04`** | Lic. Sofía Benítez | Inspectora Zonal 2 | `INS-3109-KEY` | **Editor** (Mediciones & Nuevos Predios) |

---

## 🛠️ 2. Paso a Paso para Crear el Repositorio Colaborativo en GitHub

### Paso 1: Crear el Repositorio Privado
1. Inicie sesión en GitHub con la cuenta institucional de Catastro.
2. Haga clic en **New Repository** (Nuevo Repositorio).
3. Complete los datos:
   - **Repository Name**: `registro-terrenos-ciudad`
   - **Visibility**: 🔒 **Private** (Privado - Crucial para la confidencialidad catastral).
   - Marque la casilla **Add a README file**.

### Paso 2: Invitar a las 4 Personas
1. En la pestaña del repositorio, vaya a **Settings** > **Collaborators**.
2. Haga clic en **Add people**.
3. Ingrese los nombres de usuario o correos electrónicos de GitHub de los 4 colaboradores (Ing. Roberto, Dra. Elena, Arq. Carlos, Lic. Sofía).
4. Asigne a cada uno permisos de **Write** (Escritura).

### Paso 3: Configurar Git LFS (Large File Storage) para el Excel
Los archivos binarios de Excel (`.xlsx`) son óptimos cuando se rastrean con Git LFS para mantener un control limpio de versiones:
```bash
# Inicializar Git LFS en el repositorio local
git lfs install

# Rastrear todos los archivos .xlsx
git lfs track "*.xlsx"

# Agregar la configuración al repositorio
git add .gitattributes
git commit -m "Configuración de Git LFS para Registro Excel de Terrenos"
```

---

## 🔄 3. Flujo de Trabajo Colaborativo Diario (Evitar Conflictos)

Para evitar que dos personas sobrescriban información al mismo tiempo:

### Opción A: Trabajo mediante la Aplicación Web Incorporada (Recomendado)
1. Cada usuario abre la aplicación web e ingresa su **ID de Usuario** y su **Clave / PIN**.
2. Realiza las modificaciones (ej. agregar predio, cambiar estatus legal a *Titulado*).
3. Al finalizar, presiona el botón **Sync GitHub** en la barra flotante.
4. El sistema registra el registro con el ID del usuario en el historial de commits.

### Opción B: Trabajo directo en el Archivo Excel (`.xlsx`)
1. **Antes de editar**: Ejecutar `git pull origin main` para descargar la última versión del registro enviada por los compañeros.
2. **Editar**: Abrir `Registro_De_Terrenos_Municipal.xlsx` en Microsoft Excel o Excel Online.
3. **Guardar y Subir**:
```bash
git add Registro_De_Terrenos_Municipal.xlsx
git commit -m "Actualización predio CAT-2026-016 por USR-INS-03"
git push origin main
```

---

## 🔒 4. Protección de la Rama Principal (`main`)

Para garantizar que nadie borre accidentalmente datos del registro:
1. Ir a **Settings** > **Branches** en GitHub.
2. Agregar regla para `main`:
   - Activar **Require a pull request before merging**.
   - Activar **Require approvals** (El Director de Catastro `USR-CAT-01` debe aprobar cambios mayores).

---

## 📌 Resumen de Archivos Generados en el Proyecto
- 📄 `Registro_De_Terrenos_Municipal.xlsx`: Libro Excel nativo con **fila 1-5 fijada/flotante**, fórmulas automáticas de m², Ha e impuesto, y formato azul marino municipal.
- 🌐 `index.html`: Interfaz web con **Barra Superior Flotante (`position: sticky`)**, autenticación por clave para 4 usuarios y KPIs.
- 🎨 `styles.css`: Estilos modernos con paleta Slate/Emerald y glassmorphism.
- ⚡ `app.js`: Lógica interactiva, calculadora de superficie y sincronizador GitHub.
