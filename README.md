# Sistema de Membresías y Beneficios
### Proyecto 1 - Pruebas Unitarias

---

## 📁 Estructura del Proyecto

```
benefits-system/
├── src/
│   ├── MembershipService.js   # HU-1, HU-2, HU-3
│   ├── PointsService.js       # HU-4, HU-5, HU-6, HU-7, HU-8
│   └── ReportService.js       # HU-9, HU-10
├── tests/
│   ├── MembershipService.test.js
│   ├── PointsService.test.js
│   └── ReportService.test.js
├── package.json
└── README.md
```

---

## 🚀 Cómo ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Correr todas las pruebas
```bash
npm test
```

### 3. Modo verbose (ver detalle por cada caso)
```bash
npm run test:verbose
```

---

## 🧪 Historias de Usuario cubiertas

| HU  | Descripción                           | Servicio            | Tests |
|-----|---------------------------------------|---------------------|-------|
| HU-1 | Registrar nueva membresía            | MembershipService   | 3     |
| HU-2 | Activar / Desactivar membresía       | MembershipService   | 5     |
| HU-3 | Consultar estado de membresía        | MembershipService   | 2     |
| HU-4 | Acumular puntos por uso              | PointsService       | 4     |
| HU-5 | Redimir puntos por beneficios        | PointsService       | 6     |
| HU-6 | Definir reglas de acumulación        | PointsService       | 3     |
| HU-7 | Definir reglas de redención          | PointsService       | 2     |
| HU-8 | Consultar historial de movimientos   | PointsService       | 3     |
| HU-9 | Reporte membresías activas/inactivas | ReportService       | 4     |
| HU-10| Reporte de puntos acumulados/redimidos| ReportService      | 4     |

**Total de casos de prueba: 36**

---

## 🔧 Uso de Mocks

Todas las dependencias externas (repositorios/base de datos) son simuladas con **Jest Mocks**:

```javascript
// Ejemplo de mock de repositorio
const mockRepo = {
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};
```

Esto permite probar la lógica de negocio de forma aislada, sin necesitar una base de datos real.

---

## 📦 Tecnologías

- **Node.js** - Entorno de ejecución
- **Jest** - Framework de pruebas unitarias (equivalente a TestNG en Java)
- **jest.fn()** - Mocks para repositorios y dependencias externas
