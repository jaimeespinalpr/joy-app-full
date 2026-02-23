# Joy App Full

App educativa web para ninos con:

- registro/login de estudiante (apodo + contrasena)
- seleccion por materias
- Matematicas > Multiplicacion (v1 funcional)
- guardado de resultados en Firebase (Auth + Firestore)

## Stack

- React + Vite
- Firebase Authentication
- Cloud Firestore
- Lucide React
- CSS custom (estilo moderno y colorido)

## Requisitos

- Node.js 20+
- Proyecto Firebase con:
  - `Authentication > Email/Password` activado
  - `Firestore Database` creado (modo prueba para empezar)

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Build para Hostinger

```bash
npm run build
```

Sube el contenido de `dist/` a `public_html` en Hostinger.

## Notas de Firebase

- El estudiante escribe `apodo + contrasena`
- Internamente el apodo se transforma en un email tecnico para Firebase Auth
- Los resultados se guardan en `students/{uid}/results`

## Proximos pasos sugeridos

- Suma
- Resta
- Problemas verbales
- Nuevas materias (Lectura, Lenguaje, etc.)
- Reglas de Firestore para produccion
