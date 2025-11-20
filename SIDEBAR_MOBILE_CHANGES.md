# Cambios para Sidebar.tsx - Mobile Menu Toggle

## PASO 1: Agregar estado para mobile menu (línea ~23)

Cambiar:
```tsx
const [isCollapsed, setIsCollapsed] = useState(true);
```

Por:
```tsx
const [isCollapsed, setIsCollapsed] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

---

## PASO 2: Modificar el return (línea ~79)

Cambiar:
```tsx
return (
    <aside
        className={`hidden md:block fixed left-0 top-0 h-screen bg-[#0a0a0a]/95 border-r border-white/10 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-72'
            }`}
    >
```

Por:
```tsx
return (
    <>
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        
        {/* Sidebar */}
        <aside
            className={`
                fixed left-0 top-0 h-screen 
                bg-[#0a0a0a]/95 border-r border-white/10 
                transition-all duration-300 z-50
                ${isCollapsed ? 'w-20' : 'w-72'}
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
        >
```

---

## PASO 3: Cerrar el fragment al final (línea ~160, antes del último `}`)

Cambiar:
```tsx
            </div>
        </aside>
    );
}
```

Por:
```tsx
            </div>
        </aside>
    </>
);
}
```

---

## PASO 4: Exportar función para abrir el menú (agregar después de la línea 22, antes de `export default`)

Agregar ANTES de `export default function Sidebar()`:
```tsx
// Variable global para controlar el sidebar desde fuera
let toggleMobileSidebarFn: (() => void) | null = null;

export function toggleMobileSidebar() {
    if (toggleMobileSidebarFn) {
        toggleMobileSidebarFn();
    }
}
```

---

## PASO 5: Registrar la función toggle (agregar después de los useEffect, línea ~33)

Agregar después del segundo `useEffect`:
```tsx
useEffect(() => {
    toggleMobileSidebarFn = () => setIsMobileMenuOpen(prev => !prev);
    return () => {
        toggleMobileSidebarFn = null;
    };
}, []);
```

---

## Resumen de cambios:
1. ✅ Agregar estado `isMobileMenuOpen`
2. ✅ Cambiar `isCollapsed` default a `false`
3. ✅ Agregar backdrop para móvil
4. ✅ Cambiar clases del sidebar para slide-in en móvil
5. ✅ Cerrar fragment
6. ✅ Exportar función `toggleMobileSidebar`
7. ✅ Registrar función en useEffect

Esto permitirá que el sidebar se deslice desde la izquierda en móvil cuando se llame a `toggleMobileSidebar()`.
