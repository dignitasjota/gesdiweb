# Diseño legacy — backup del rediseño anterior

> Snapshot del sistema de diseño que existía antes del rediseño "Claude Design"
> de mayo 2026. Conservado por si necesitamos revertir o consultar el estado
> previo.

**Fecha del backup:** 2026-05-12
**Motivo:** rediseño completo siguiendo nueva propuesta (Space Grotesk +
Instrument Serif + estética "Suiza moderna con narrativa").

## Cómo restaurar el diseño anterior

```sh
cp -r web/_design-legacy/styles web/src/
cp -r web/_design-legacy/components web/src/
cp -r web/_design-legacy/layouts web/src/
```

Las dependencias (Bricolage Grotesque, Inter) seguirán en `package.json` mientras
no se hayan eliminado.

## Cómo eliminar este backup definitivamente

```sh
rm -rf web/_design-legacy
```

Hacer cuando el rediseño esté validado en producción y no haya intención de
volver.

## Contenido

- `styles/globals.css` — tokens, fuentes y reset del diseño anterior
- `components/` — Header, Footer, Hero, Marker, Button, secciones de home, etc.
- `layouts/` — BaseLayout y LegalLayout
