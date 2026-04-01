import { pool } from "../src/app/lib/db";

async function fixTriggers() {
  const client = await pool.connect();
  try {
    console.log("Mise à jour des triggers pour supporter les noms d'utilisateurs personnalisés...");

    // 1. S'assurer que la table audit_compte existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_compte (
        id SERIAL PRIMARY KEY,
        type_action VARCHAR(50),
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        num_compte INTEGER,
        nomclient VARCHAR(100),
        solde_ancien DECIMAL,
        solde_nouveau DECIMAL,
        utilisateur VARCHAR(100)
      );
    `);

    // 2. Créer ou remplacer la fonction du trigger
    // Elle utilise current_setting('app.current_user', true) qui récupère la variable de session
    // Si elle n'est pas définie, elle retombe sur session_user (ex: postgres)
    await client.query(`
      CREATE OR REPLACE FUNCTION audit_compte_trigger_fn()
      RETURNS TRIGGER AS $$
      DECLARE
          v_user VARCHAR(100);
      BEGIN
          -- Récupérer l'utilisateur de l'application via une variable de session
          -- Le second paramètre 'true' évite une erreur si la variable n'est pas encore définie
          v_user := COALESCE(NULLIF(current_setting('app.current_user', true), ''), session_user);

          IF (TG_OP = 'INSERT') THEN
              INSERT INTO audit_compte (type_action, num_compte, nomclient, solde_nouveau, utilisateur)
              VALUES ('INSERTION', NEW.num_compte, NEW.nomclient, NEW.solde, v_user);
          ELSIF (TG_OP = 'UPDATE') THEN
              INSERT INTO audit_compte (type_action, num_compte, nomclient, solde_ancien, solde_nouveau, utilisateur)
              VALUES ('MODIFICATION', NEW.num_compte, NEW.nomclient, OLD.solde, NEW.solde, v_user);
          ELSIF (TG_OP = 'DELETE') THEN
              INSERT INTO audit_compte (type_action, num_compte, nomclient, solde_ancien, utilisateur)
              VALUES ('SUPPRESSION', OLD.num_compte, OLD.nomclient, OLD.solde, v_user);
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 3. S'assurer que le trigger est lié à la table compte
    // On le supprime et on le recrée pour être sûr qu'il utilise la nouvelle fonction
    await client.query(`
      DROP TRIGGER IF EXISTS trg_audit_compte ON compte;
      CREATE TRIGGER trg_audit_compte
      AFTER INSERT OR UPDATE OR DELETE ON compte
      FOR EACH ROW EXECUTE FUNCTION audit_compte_trigger_fn();
    `);

    console.log("Succès ! La base de données est maintenant prête à enregistrer les vrais pseudos.");
  } catch (err) {
    console.error("Erreur lors de la mise à jour des triggers :", err);
  } finally {
    client.release();
    pool.end();
  }
}

fixTriggers();
