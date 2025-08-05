// supabase/seed.sql
/**
 * @file seed.sql
 * @description Script de inicialización para el entorno de desarrollo local.
 *              NOTA ARQUITECTÓNICA: Este archivo se mantiene por compatibilidad con
 *              la CLI de Supabase, pero está INTENCIONALMENTE VACÍO.
 *
 *              Este proyecto opera bajo una filosofía "Remote-First". No se utiliza
 *              una base de datos local. La inicialización y el reseteo de la base
 *              de datos de PRUEBAS se gestiona exclusivamente a través de la función
 *              RPC `reset_for_tests()`, invocada por el script `pnpm query:all --seed`.
 *
 * @version 3.0.0 (Remote-First Canonical)
 * @author L.I.A Legacy
 */

-- No se requiere ninguna acción de seeding local. El onboarding de nuevos usuarios
-- en cualquier entorno es manejado automáticamente por el trigger de base de datos
-- `on_auth_user_created`.