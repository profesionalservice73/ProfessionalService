# 🧠 Testing: Lógica Inteligente del Header - Sin Colisiones

## 📋 Resumen

Esta guía documenta cómo el header maneja inteligentemente todas las combinaciones posibles de props para evitar colisiones y mantener un diseño consistente.

## 🎯 Lógica Implementada

### **Estructura del Header:**
```
┌─────────────────────────────────────────────────────────┐
│ [IZQUIERDA]           [CENTRO]           [DERECHA]     │
│                                                        │
│ • Back Button         • Título           • Action      │
│ • Logo (sin back)     • Centrado         • Logo        │
│ • Vacío               • Siempre          • Vacío       │
└─────────────────────────────────────────────────────────┘
```

### **Prioridades por Sección:**

#### **🔵 Sección Izquierda (renderLeftSection):**
1. **Prioridad 1:** `showBackButton = true` → **Back Button**
2. **Prioridad 2:** `showLogo = true` (sin back) → **Logo**
3. **Prioridad 3:** Ninguno → **Vacío**

#### **🟡 Sección Derecha (renderRightSection):**
1. **Prioridad 1:** `rightAction` existe → **Action Button**
2. **Prioridad 2:** `showBackButton && showLogo` → **Logo**
3. **Prioridad 3:** Ninguno → **Vacío**

## 🔍 Casos de Prueba

### **Caso 1: Header Principal (Home)**
```typescript
<Header title="Professional Service" showLogo={true} />
```

#### **Resultado Esperado:**
- ✅ **Izquierda:** Logo
- ✅ **Centro:** "Professional Service"
- ✅ **Derecha:** Vacío

### **Caso 2: Header con Back Button**
```typescript
<Header title="Detalles" showBackButton={true} onBackPress={() => {}} />
```

#### **Resultado Esperado:**
- ✅ **Izquierda:** Back Button
- ✅ **Centro:** "Detalles"
- ✅ **Derecha:** Vacío

### **Caso 3: Header con Back Button + Logo**
```typescript
<Header 
  title="Perfil" 
  showBackButton={true} 
  showLogo={true}
  onBackPress={() => {}} 
/>
```

#### **Resultado Esperado:**
- ✅ **Izquierda:** Back Button
- ✅ **Centro:** "Perfil"
- ✅ **Derecha:** Logo

### **Caso 4: Header con Action Button**
```typescript
<Header 
  title="Editar Perfil" 
  showBackButton={true}
  rightAction={{
    text: "Guardar",
    onPress: () => {}
  }}
  onBackPress={() => {}} 
/>
```

#### **Resultado Esperado:**
- ✅ **Izquierda:** Back Button
- ✅ **Centro:** "Editar Perfil"
- ✅ **Derecha:** Action Button ("Guardar")

### **Caso 5: Header Solo con Título**
```typescript
<Header title="Configuración" showLogo={false} />
```

#### **Resultado Esperado:**
- ✅ **Izquierda:** Vacío
- ✅ **Centro:** "Configuración"
- ✅ **Derecha:** Vacío

### **Caso 6: Header con Logo + Action**
```typescript
<Header 
  title="Inicio" 
  showLogo={true}
  rightAction={{
    text: "Filtros",
    onPress: () => {}
  }}
/>
```

#### **Resultado Esperado:**
- ✅ **Izquierda:** Logo
- ✅ **Centro:** "Inicio"
- ✅ **Derecha:** Action Button ("Filtros")

## 🛠️ Verificación Técnica

### **1. Función renderLeftSection:**
```typescript
const renderLeftSection = () => {
  if (showBackButton) {
    return <BackButton />; // Prioridad 1
  }
  
  if (showLogo) {
    return <Logo />; // Prioridad 2
  }
  
  return null; // Prioridad 3
};
```

### **2. Función renderRightSection:**
```typescript
const renderRightSection = () => {
  if (rightAction) {
    return <ActionButton />; // Prioridad 1
  }
  
  if (showBackButton && showLogo) {
    return <Logo />; // Prioridad 2
  }
  
  return null; // Prioridad 3
};
```

### **3. Combinaciones Imposibles (Evitadas):**
```typescript
// ❌ IMPOSIBLE: Back Button + Logo en izquierda
// ✅ CORRECTO: Back Button en izquierda, Logo en derecha

// ❌ IMPOSIBLE: Action Button + Logo en derecha
// ✅ CORRECTO: Action Button tiene prioridad sobre Logo

// ❌ IMPOSIBLE: Dos logos en la misma pantalla
// ✅ CORRECTO: Logo solo aparece una vez
```

## 📊 Matriz de Combinaciones

| showBackButton | showLogo | rightAction | Izquierda | Centro | Derecha |
|----------------|----------|-------------|-----------|--------|---------|
| `false`        | `false`  | `null`      | Vacío     | Título | Vacío   |
| `false`        | `true`   | `null`      | Logo      | Título | Vacío   |
| `true`         | `false`  | `null`      | Back      | Título | Vacío   |
| `true`         | `true`   | `null`      | Back      | Título | Logo    |
| `false`        | `false`  | `exists`    | Vacío     | Título | Action  |
| `false`        | `true`   | `exists`    | Logo      | Título | Action  |
| `true`         | `false`  | `exists`    | Back      | Título | Action  |
| `true`         | `true`   | `exists`    | Back      | Título | Action  |

## 🎯 Beneficios de la Lógica

### **1. Sin Colisiones:**
- ✅ **Nunca hay dos elementos** en la misma sección
- ✅ **Prioridades claras** y predecibles
- ✅ **Comportamiento consistente** en toda la app

### **2. Flexibilidad:**
- ✅ **Múltiples combinaciones** posibles
- ✅ **Fácil de usar** para desarrolladores
- ✅ **Escalable** para futuras necesidades

### **3. UX Consistente:**
- ✅ **Patrones predecibles** para el usuario
- ✅ **Navegación intuitiva**
- ✅ **Diseño coherente**

## 🔧 Casos de Uso Reales

### **1. Pantalla Principal:**
```typescript
<Header title="Professional Service" showLogo={true} />
// Resultado: [Logo] [Título] [Vacío]
```

### **2. Pantalla de Detalles:**
```typescript
<Header 
  title="Detalles del Profesional" 
  showBackButton={true}
  onBackPress={() => navigation.goBack()}
/>
// Resultado: [Back] [Título] [Vacío]
```

### **3. Pantalla de Edición:**
```typescript
<Header 
  title="Editar Perfil" 
  showBackButton={true}
  rightAction={{
    text: "Guardar",
    onPress: handleSave
  }}
  onBackPress={() => navigation.goBack()}
/>
// Resultado: [Back] [Título] [Action]
```

### **4. Pantalla con Filtros:**
```typescript
<Header 
  title="Buscar Profesionales" 
  showLogo={true}
  rightAction={{
    text: "Filtros",
    onPress: showFilters
  }}
/>
// Resultado: [Logo] [Título] [Action]
```

### **5. Pantalla de Configuración:**
```typescript
<Header title="Configuración" showLogo={false} />
// Resultado: [Vacío] [Título] [Vacío]
```

## ⚠️ Reglas Importantes

### **1. Prioridades Absolutas:**
- **Back Button** siempre va en la izquierda si existe
- **Action Button** siempre tiene prioridad en la derecha
- **Logo** se mueve a la derecha solo si hay Back Button

### **2. Combinaciones Válidas:**
- ✅ Back + Action (izquierda + derecha)
- ✅ Logo + Action (izquierda + derecha)
- ✅ Back + Logo (izquierda + derecha)
- ✅ Solo título (centro)

### **3. Combinaciones Imposibles:**
- ❌ Back + Logo en la misma sección
- ❌ Action + Logo en la misma sección
- ❌ Dos logos en la misma pantalla

## 🎯 Testing Checklist

### **Funcionalidad**
- [ ] **Back Button** aparece solo cuando `showBackButton={true}`
- [ ] **Logo** aparece en izquierda cuando no hay back
- [ ] **Logo** aparece en derecha cuando hay back
- [ ] **Action Button** tiene prioridad sobre logo en derecha
- [ ] **Título** siempre está centrado

### **Colisiones**
- [ ] **No hay superposición** de elementos
- [ ] **Cada sección** tiene máximo un elemento
- [ ] **Prioridades** se respetan correctamente
- [ ] **Layout** es estable en todas las combinaciones

### **UX**
- [ ] **Navegación** es intuitiva
- [ ] **Botones** son accesibles
- [ ] **Diseño** es consistente
- [ ] **Espaciado** es apropiado

---

**¡Header inteligente sin colisiones implementado!** 🧠
