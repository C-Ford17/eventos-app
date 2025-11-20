# Auto-cerrar Sidebar en Móvil al Seleccionar Opción

## Cambio en Sidebar.tsx (línea ~143-165)

Busca el `<Link>` dentro del `sidebarOptions.map()` y agrega `onClick`:

**ANTES:**
```tsx
<Link
    key={option.href}
    href={option.href}
    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
>
```

**DESPUÉS:**
```tsx
<Link
    key={option.href}
    href={option.href}
    onClick={() => setIsMobileMenuOpen(false)}
    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
>
```

---

## También para el link de Configuración (línea ~178)

**ANTES:**
```tsx
<Link
    href="/dashboard/configuracion"
    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'justify-center' : ''}`}
>
```

**DESPUÉS:**
```tsx
<Link
    href="/dashboard/configuracion"
    onClick={() => setIsMobileMenuOpen(false)}
    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'justify-center' : ''}`}
>
```

---

## Resumen:
Solo agrega `onClick={() => setIsMobileMenuOpen(false)}` a:
1. ✅ Todos los Links de navegación (dentro del map)
2. ✅ El Link de Configuración en el footer

Esto cerrará el sidebar automáticamente al hacer click en cualquier opción (solo afecta móvil, en desktop no hace nada visible).
