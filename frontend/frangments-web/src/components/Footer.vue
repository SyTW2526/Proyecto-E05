<!-- Footer.vue -->
<template>
  <footer class="app-footer">
    <p>© {{ new Date().getFullYear() }} Fragments — Todos los derechos reservados.</p>
    <p>Iván Pérez Rodríguez - Manuel David Gómez Alonso - Daniel Díaz Marrero</p>
  </footer>
</template>

<style scoped>
.app-footer {
  background: rgba(15, 23, 42, 0.9);   /* Oscuro elegante */
  color: #e5e7eb;
  text-align: center;
  padding: 22px 12px;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  margin-top: auto;   /* Esto hace que se pegue abajo sin dejar huecos */
  width: 100%;
}
</style>

