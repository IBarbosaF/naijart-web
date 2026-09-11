/**
 * Versión de los ficheros de traducción (public/i18n/*.json).
 *
 * Angular pone un hash en el nombre de los bundles JS, así que al cambiar
 * cambia la URL y el navegador se ve obligado a descargarlos. Los JSON de
 * i18n viven en public/ y se copian tal cual: misma URL siempre. GitHub
 * Pages los sirve con `Cache-Control: max-age=600`, de modo que un visitante
 * que vuelva puede seguir viendo traducciones antiguas — y, como el idioma
 * de reserva es el español, las claves que falten en su copia cacheada se
 * mostrarán en castellano aunque haya elegido inglés o francés.
 *
 * Este valor se añade como `?v=` a la URL, de forma que al subirlo el
 * navegador descarta la copia guardada.
 *
 * >>> SUBE ESTE NÚMERO CADA VEZ QUE CAMBIES UN FICHERO DE public/i18n/ <<<
 */
export const I18N_VERSION = '4';
