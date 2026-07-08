---
title: '9 Pasos para una Auditoría técnica de SEO'
excerpt: 'Hablamos mucho de SEO off-page. Construir, administrar y auditar enlaces es un aspecto crítico del SEO, y cada vez es más difícil.'
publishedAt: 2018-03-25
readingMinutes: 14
categories:
  - 'SEO'
tags: []
cover: ./imagenes/pasos-auditoria-seo/cover-analytics-2618277_1280.jpg
coverAlt: 'auditoria-seo'
author: 'Diseño Web Valencia'
---

Hablamos mucho de SEO off-page. Construir, administrar y auditar enlaces es un aspecto crítico del SEO, y cada vez es más difícil. El SEO Onpage también es un tema de especial relevancia, especialmente ahora que Google está cambiando cada vez más a la búsqueda semántica, y las tácticas de la vieja escuela relativas a incluir todas las keywords y sus sinónimos en una página no parecen funcionar tan bien como solían hacerlo.

Sin duda son aspectos muy importantes de SEO, pero hay una cosa que tendemos a olvidar. La parte técnica del proceso es igual de importante; de hecho, si no consigues que la base técnica de tu sitio web funcione, tus otros esfuerzos de SEO podrían no tener ningún resultado en absoluto.

En este artículo vamos a ver los aspectos principales del SEO técnico que te ayudarán a maximizar la usabilidad, el rastreo en los motores de búsqueda, la indexación y, en última instancia, las clasificaciones.. En esta [**auditoría** SEO](https://www.prositiosweb.com/pasos-previos-auditoria-seo/) revisamos todos estos aspectos  con la ayuda de la herramienta Website Auditor de SEO PowerSuite.

## 1.-Sitemap: Revisa el mapa de tu sitio.

Sabes muy bien lo importante que es tu sitemap. Le dice a los motores de búsqueda acerca de la estructura de su sitio y les permite descubrir nuevo contenido. Si aún no tienes un sitemap, deberías crear uno ahora mismo. Puedes hacerlo en **WebSite Auditor** simplemente iniciando un proyecto para tu sitio, saltando al dashboard de Páginas, y pulsando el botón Sitemap.

A medida que revises el mapa del sitio, asegúrate que:

- **Limpio**. Mantén tu sitemap libre de errores, redirecciones y URL bloqueadas para su indexación; de lo contrario, corres el riesgo de que los motores de búsqueda ignoren el mapa de sitio como si no existiera.
- **Al día**. Asegúrate de que el mapa de tu sitio se actualice cada vez que se añada o se elimine contenido, lo que ayudará a los motores de búsqueda a descubrir rápidamente nuevos contenidos.
- **Conciso**. Google no rastreará más de 50.000 URL. Lo ideal sería que lo mantuvieras mucho más corto para asegurarte de que tus páginas más importantes sean rastreadas más a menudo. Los experimentos muestran que los mapas de sitio más cortos resultan en rastreos más efectivos.
- **Registrado en la consola de búsqueda.** Informe a Google sobre el mapa de su sitio. Puede enviarla manualmente a la Consola de búsqueda de Google o especificar su ubicación en cualquier lugar del archivo robots.txt de la siguiente forma: *Mapa del sitio: https://yourdomain.com/sitemap.xml*

![auditoria-seo](./imagenes/pasos-auditoria-seo/auditoria-de-posicionamiento-SEO.png)

## 2\. Comprueba la indexación de tu web.

Pasemos a las páginas de tu sitio que están indexadas por los motores de búsqueda. Para comprobar esto rápidamente, enciende WebSite Auditor, crea un proyecto para tu sitio y ve a Domain Strength.

Lo ideal es que este número se acerque al número total de páginas de tu sitio, (que puedes ver en *Estructura del sitio > Páginas en su proyecto* de WebSite Auditor) menos las que has restringido deliberadamente de indexar. Si hay una diferencia más grande de lo que esperabas, tendrás que revisar las páginas no permitidas. Lo que nos lleva a…

## 3\. Asegúrate de que todos los recursos importantes puedan rastrearse.

Podrías estar tentado a simplemente mirar a través de robots.txt para asegurarte de que sus páginas importantes son rastreables. Pero en realidad, el archivo robots.txt es sólo una de las formas de restringir la indexación de las páginas. ¿Qué hay de la metaetiqueta noindex, o páginas huérfanas que no están vinculadas internamente? ¿Qué hay de los archivos JavaScript y CSS que podrían ser críticos para la visualización de tu página? Para realizar una comprobación completa de la capacidad de rastreo, deberás utilizar un rastreador SEO.

**Encuentra páginas y recursos restringidos para su indexación**. Con WebSite Auditor, puedes obtener rápidamente una lista completa de todas las páginas y recursos bloqueados. Para ello, abre tu proyecto WebSite Auditor, ve a Site Structure > Site Audit y haz clic en *Resources restricted from indexing.*

Si se supone que alguno de los recursos de la lista no está bloqueado, consulta la columna Instrucciones de los robots para ver dónde se encontró la instrucción **Disallow** y así poder repararla rápidamente.

**Busca páginas huérfanas**. Las páginas huérfanas son páginas que existen en tu sitio pero no están vinculadas internamente. Esto significa que si los motores de búsqueda los descubren, es probable que los rastreen con muy poca frecuencia. Para comprobar si hay páginas huérfanas en su sitio, reconstruye tu proyecto de auditor de sitio web yendo a *Estructura del sitio > Páginas* y pulsando el botón *Reconstruir proyecto*. En el paso 2 de la reconstrucción, marca la casilla *Buscar páginas huérfanas* y continúa con la reconstrucción.

Una vez completada la reconstrucción, podrás ver fácilmente las páginas huérfanas por **la etiqueta Orphan page.**

**Nota**: Si tu sitio está construido usando AJAX, o depende de JavaScript para generar su contenido, necesitarás **habilitar el rastreo renderizado** en WebSite Auditor mientras creas o reconstruyes un proyecto. Para ello, en el Paso 2 de la creación/reconstrucción del proyecto, cambia a Opciones avanzadas y marca la casilla *Ejecutar JavaScript*.

## 4\. Amplía el balance de rastreo (crawl budget).

El balance de rastreo es el número de páginas de un sitio que los motores de búsqueda rastrean durante un período de tiempo determinado. El balance de rastreo no es un factor de clasificación per se, pero determina con qué frecuencia se rastrean las páginas importantes de tu sitio. Puedes hacerte una idea de cuál es tu presupuesto diario de rastreo en la Consola de búsqueda de Google en *Rastreo > Estadísticas de rastreo.*

Una vez que sepas cuál es tu balance de rastreo, debes estar preguntándose cómo puedes sacarle el máximo provecho.

**Limpia el contenido duplicado.** Las páginas duplicadas son una de las razones más comunes por las que el balance de rastreo se pierde. Para obtener una pista sobre las páginas duplicadas de tu sitio, consulta la sección On-page en el panel de control de auditoría del sitio WebSite Auditor’s Site Audit. Las páginas con etiquetas de título y metadescripción duplicadas probablemente tengan contenido duplicado (de lo contrario, deberías reescribir esos títulos).

Por cada página duplicada de la que puedas deshacerte, hazlo. Si tienes que mantener la página, al menos asegúrate de bloquearla de los robots de los motores de búsqueda. En términos de presupuesto de rastreo, las URLs canónicas no son de mucha ayuda: los motores de búsqueda todavía rastrearán las páginas duplicadas y desperdiciarán una unidad de tu balance de rastreo cada vez.

**Restringir la indexación de páginas sin valor SEO**. Piensa en qué páginas de tu sitio no tendrán sentido en los resultados de búsqueda: política de privacidad, términos y condiciones, antiguas promociones, etc. Todos estos son buenos candidatos restringir su indexación.

 **Añade parámetros de URL en la Consola de búsqueda de Google**. De forma predeterminada, Google puede rastrear la misma página con determinados parámetros de URL y sin ellos por separado, como si fueran dos páginas diferentes. Por eso es útil añadir los parámetros de URL que estás utilizando a la Consola de Búsqueda de Google, lo que permitirá a Google saber que se trata de la misma página y hará que el rastreo sea más eficaz.

**Ocúpate de los enlaces rotos**. Cuando un robot de búsqueda llega a una página 4XX/5XX, una unidad de tu balance de rastreo se desperdicia. Es por eso que es importante encontrar y arreglar todos los enlaces rotos en tu sitio. Puedes obtener una lista completa de los mismos en el panel de control de auditoría del sitio WebSite Auditor’s Site Audit en la sección Enlaces, haciendo clic en Enlaces rotos.

**Arreglar las cadenas de redireccionamiento**. Cada redireccionamiento que los robots del motor de búsqueda siguen, es un desperdicio de una unidad de tu balance de rastreo. Además, si hay un número irrazonable de redirecciones 301 y 302 en tu sitio, en algún momento las arañas de búsqueda dejarán de seguir los redireccionamientos, y la página de destino puede no ser rastreada.

Puedes obtener una lista completa de páginas con redirecciones en WebSite Auditor, junto con una lista de cadenas de redirección que se encuentran en tu sitio. Sólo tienes que ir al panel de control de Auditoría de sitios y buscar las Páginas con redirecciones 302, Páginas con redirecciones 301 y Páginas con largas cadenas de redirecciones.

## 5\. Haz una auditoría de los enlaces internos.

Una estructura lógica y poco profunda del sitio es importante para los usuarios y los robots de los motores de búsqueda; además, los enlaces internos ayudan a distribuir el poder de clasificación entre tus páginas de manera más eficiente.

A medida que auditas sus enlaces internos, estas son las cosas que debes comprobar.

**Profundidad de clic**. Asegúrate de que las páginas importantes de tu sitio no estén a más de 3 clics de distancia de la página principal. Para comprobar la profundidad de clic de tus páginas, enciende WebSite Auditor una vez más y ve a *Estructura del sitio > Páginas*. A continuación, ordena las URL por profundidad de clic en orden descendente haciendo clic dos veces en el encabezado de la columna.

**Enlaces rotos.** Como ya he mencionado, los enlaces rotos desperdician tu balance de rastreo. Es importante recordar que aparte de las etiquetas , los enlaces rotos pueden ocultarse en las etiquetas , las cabeceras HTTP y los sitemaps. Para obtener una lista completa de todos los recursos con un código de respuesta 4xx/5xx, lo mejor es consultar los recursos de tu sitio en el panel de control de WebSite Auditor’s All Resources. Haz clic en Recursos internos y ordena la lista por código de estado HTTP (haciendo clic en la columna del encabezado). Ahora, haz clic en cualquiera de los recursos rotos para ver dónde se esconden los enlaces.

**Páginas huérfanas**. Estas páginas no están vinculadas a otras páginas de tu sitio – y por lo tanto son difíciles de encontrar para los visitantes y los motores de búsqueda. Para comprobar si hay páginas huérfanas en tu sitio, reconstruye tu proyecto de auditor de sitio web yendo a *Estructura del sitio > Páginas* y pulsando el botón *Reconstruir proyecto*. En el paso 2 de la reconstrucción, marca la casilla *Buscar páginas huérfanas* y continúe con la reconstrucción. Cuando la reconstrucción esté completa, podrás ver fácilmente las páginas huérfanas por la etiqueta *Orphan page*.

## 6\. Comprueba el contenido HTTPS.

Google comenzó a utilizar HTTPS como señal de clasificación en 2014; desde entonces, las migraciones HTTPS se han vuelto cada vez más comunes. Hoy en día, más del 50% de los resultados de búsqueda de la página 1 de Google utilizan HTTPS.

Si tu sitio ya está utilizando HTTPS, es importante comprobar los problemas HTTPS comunes como parte de las auditorías de tu sitio. En particular, recuerda verificar:

**Contenido mixto**. Los problemas de contenido mixto surgen cuando una página segura carga parte de su contenido (imágenes, vídeos, scripts, archivos CSS) sobre una conexión HTTP no segura. Esto debilita la seguridad de la página y puede impedir que los navegadores carguen el contenido no seguro, o incluso toda la página. Para comprobar si tu sitio tiene problemas de contenido mixto, abre tu proyecto WebSite Auditor y ve a *Site Audit*. Localiza las páginas HTTPS con el factor de problemas de contenido mixto (en Codificación y factores técnicos). Haz clic en él para ver la lista de páginas con contenido mixto, si lo hay.

**Canónicos, enlaces y redirecciones**. Lo ideal es que todos los enlaces de tu sitio HTTPS, así como los redireccionamientos y canónicos, apunten directamente a las páginas HTTPS. Incluso si tienes implementados correctamente los redireccionamientos HTTP a HTTPS en todo el sitio, no querrás que los usuarios pasen por redireccionamientos innecesarios – esto hará que tu sitio parezca mucho más lento de lo que es. Estos redireccionamientos también pueden ser un problema para rastrear, ya que perderás un poco de tu balance de rastreo cada vez que un bot de un motor de búsqueda seleccione un redireccionamiento.

Para obtener una lista completa de todos los recursos que no son HTTPS en tu sitio, ve al panel de control de WebSite Auditor’s All Resources. Haz clic en HTML en Recursos internos y ordena la lista por URL (haciendo clic en la columna del encabezado). De esta manera, deberías poder ver las páginas HTTP primero. Para cada página HTTP que encuentres, consulta la lista *Encontrado en páginas* en la parte inferior de la pantalla para obtener una lista completa de las páginas que enlazan con la página HTTP que está examinando. Aquí también verás dónde se encontró el enlace para que puedas arreglar las cosas rápidamente.

Si tu sitio aún no se ha convertido en HTTPS, es posible que desees considerar una migración HTTPS.

## 7\. Prueba y mejora la velocidad de la página.

Google espera que las páginas se carguen en dos segundos o menos y ha confirmado oficialmente que la velocidad es una señal de ranking. La velocidad también tiene un impacto masivo en el UX: las páginas más lentas tienen tasas de rebote más altas y tasas de conversión más bajas.

La velocidad de la página no es sólo una de las principales prioridades de Google desde 2017, sino también su señal de clasificación. Para comprobar si tus páginas superan la prueba de velocidad de Google, abre el proyecto WebSite Auditor y ve a *Análisis de contenido*. Haz clic en Agregar página, especifica la URL que deseas probar e introduce las palabras clave de destino. En un momento, tu página será analizada en términos de optimización de una página y SEO técnico. Cambia a Factores técnicos y desplázate a la sección Velocidad de página (Escritorio) de los factores de una página para ver si se ha encontrado algún problema.

Si tu página no supera algunos de los aspectos de la prueba, verás los detalles y las recomendaciones sobre cómo corregirlos en la vista de la derecha.

## 8\. Comprueba como se ve tu web en el movíl e incluso [haz tu web AMP](/blog/deshabilitar-amp-wordpress).

Google ha estado experimentando con la indexación de primero móvil durante un tiempo, y están planeando lanzarlo finalmente a principios del próximo año. Un “índice de móvil primero” significa que Google indexará las versiones móviles de los sitios web en lugar de la versión de escritorio. Esto significa literalmente que la versión móvil de tus páginas determinará cómo deben clasificarse tanto en los resultados de búsqueda de móviles como en los de escritorio.

Aquí están las cosas más importantes a tener en cuenta al auditar tu sitio móvil.

**Comprueba si tus páginas son amigables con los móviles**. La prueba para móviles de Google incluye una selección de criterios de usabilidad, como la configuración de las ventanas de visualización, el uso de plugins y el tamaño del texto y de los elementos en los que se puede hacer clic. También es importante recordar que la compatibilidad móvil se evalúa en función de la página, por lo que deberá comprobar cada una de sus páginas de destino por separado, una por una. Puedes realizar la comprobación rápidamente en WebSite Auditor: la prueba para móviles de Google se incorpora directamente en la herramienta. En tu proyecto, ve al módulo Análisis de contenido, selecciona la página que deseas analizar e introduce las palabras clave de destino. Una vez finalizado el análisis, consulta la sección *Usabilidad de la página (Móvil)* para ver si se han encontrado errores o advertencias.

**Realiza auditorías exhaustivas de tu sitio móvil**. El hecho de que todas las páginas importantes superen la prueba de Google para móviles es un buen comienzo, pero aún queda mucho por analizar. Una auditoría completa de tu sitio móvil es una excelente forma de asegurarse de que todas sus páginas y recursos importantes son accesibles para Googlebot y están libres de errores.

Para realizar una auditoría exhaustiva de sitios web móviles, deberás ejecutar un rastreo de sitios con **agente de usuario personalizado y configuración de robots.txt**. En tu proyecto WebSite Auditor, ve al panel de control de Páginas y haz clic en el botón *Reconstruir proyecto*. En el paso 2, asegúrate de que la casilla *Seguir instrucciones robots.txt* esté marcada; en el menú desplegable junto a ella, selecciona *Googlebot-Mobile*. Justo debajo, marca la casilla *Rastrear* como un agente de usuario específico. En el menú desplegable de la derecha, selecciona el segundo agente de usuario de la lista:

Es el agente de usuario que utiliza Google para rastrear las versiones móviles de las páginas. En un momento, la herramienta llevará a cabo una auditoría completa de tu sitio web móvil. Recuerda que cualquier problema de SEO que encuentre puede afectar por igual a su escritorio y los rankings móviles, así que mira a través de los factores tradicionales de SEO como cadenas de redirección, enlaces rotos, páginas pesadas, títulos duplicados o vacíos y meta descripciones, etc.

## 9\. Pide a los motores de búsqueda que vuelvan a rastrear tu sitio.

Con los 8 pasos anteriores, estoy seguro de que has identificado algunos problemas en tu sitio que necesitan reparación. Una vez que los hayas arreglado, puedes pedir explícitamente a Google que vuelva a rastrear tus páginas para asegurarte de que los cambios se tengan en cuenta inmediatamente.

Todo lo que tienes que hacer es acceder a la Consola de Búsqueda de Google e ir a *Rastreo > Obtener como Google*. Introduce la URL de la página que deseas que se vuelva a rastrear (o deja el campo en blanco si deseas que Google rastree la página principal) y haz clic en *Obtener.*

Ten en cuenta que la obtención debe tener un estado completo, parcial o redirigido para que puedas enviar la página al índice de Google (de lo contrario, verás una lista de problemas que Google ha encontrado en tu sitio y tendrás que solucionarlos y volver a utilizar la herramienta Obtención como herramienta de Google). Si Googlebot puede recuperar tu página con éxito, haz clic en el botón *Enviar a índice* para animar a Google a volver a rastrearla.

Puedes enviar la URL exacta que deseas volver a rastrear (hasta 500 URL por semana) o la URL y todas las páginas vinculadas desde ella (hasta 10 por mes). Si eliges esta última opción, Google utilizará esta URL como punto de partida para indexar el contenido de tu sitio y seguirá los enlaces internos para rastrear el resto de las páginas. Google no garantiza la indexación de todas las páginas de tu sitio, pero si el sitio es bastante pequeño, lo más probable es que lo haga.

(También hay una opción similar en las Herramientas para webmasters de Google Bing. Simplemente localiza la sección *Configurar Mi Sitio* en el panel de control y haz clic en Enviar URL. Rellena la URL que necesitas re-indexar, y Bing la rastreará en minutos.
