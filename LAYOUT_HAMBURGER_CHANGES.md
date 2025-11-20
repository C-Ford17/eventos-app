# Cambios para dashboard/layout.tsx - Hamburger Button

## PASO 1: Agregar import de Menu icon (línea 6)

Cambiar:
```tsx
import { Search, User } from 'lucide-react';
```

Por:
```tsx
import { Search, User, Menu } from 'lucide-react';
```

---

## PASO 2: Importar función toggleMobileSidebar (línea 3)

Cambiar:
```tsx
import Sidebar from '@/components/Sidebar';
```

Por:
```tsx
import Sidebar, { toggleMobileSidebar } from '@/components/Sidebar';
```

---

## PASO 3: Agregar botón hamburguesa en el header (línea ~38, ANTES del div que contiene "Bienvenido")

Agregar ANTES de `<div>` que contiene el h1 "Bienvenido":
```tsx
{/* Hamburger Menu - Mobile Only */}
<button
  onClick={toggleMobileSidebar}
  className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
  aria-label="Toggle menu"
>
  <Menu size={24} />
</button>
```

El header completo debería quedar así:
```tsx
<header className="flex justify-between items-center mb-8">
  {/* Hamburger Menu - Mobile Only */}
  <button
    onClick={toggleMobileSidebar}
    className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    aria-label="Toggle menu"
  >
    <Menu size={24} />
  </button>

  <div>
    <h1 className="text-2xl font-bold text-white">
      Bienvenido, <span className="text-blue-400">{user?.nombre?.split(' ')[0]}</span>
    </h1>
    <p className="text-gray-400 text-sm">
      {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>

  <div className="flex items-center gap-4">
    {/* ... resto del código ... */}
  </div>
</header>
```

---

## Resumen:
1. ✅ Import `Menu` icon
2. ✅ Import `toggleMobileSidebar` function
3. ✅ Add hamburger button (visible only on mobile)

El botón hamburguesa aparecerá solo en móvil y abrirá el sidebar con un slide-in desde la izquierda.
