//todos aquellos archivos que nuestra aplicación utilice
const STATIC = 'staticv2';
const INMUTABLE = 'inmutablev1';
const DYNAMIC = 'dynamicv1';

const APP_SHELL = [
    //la raiz hace referencia al index.html
    '/',
    'index.html',
    'js/app.js',
    'img/alfredito.jpg',
    'css/styles.css',
    'img/kenia.jpg',
    './pages/offline.html'
];

const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', (e) => {
    console.log('Instalado');
    const staticCache = caches.open(STATIC).then((cache) => {
        cache.addAll(APP_SHELL);
    });

    const inmutableCache = caches.open(INMUTABLE).then((cache) => {
        cache.addAll(APP_SHELL_INMUTABLE);
    });
    e.waitUntil(Promise.all([staticCache, inmutableCache]));

    //hace la función de recargar el sw sin necesidad de hacerlo manual
    //e.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('Activado');
});

self.addEventListener('fetch', (e) => {
     //console.log(e.request);

     //PRÁCTICA 16-10-2023
     const source = new Promise((resolve, reject) => {
        let flag = false;
        const failsOnce = () => {
            if (flag) {
                //Si falló una vez aquí vamos a poner la lógica para controlarlo
                if (/\.(png|jpg)/i.test(e.request.url)) {
                    resolve(caches.match('/img/not-found.png'));
                }
                if (e.request.url.includes('page2.html')) {
                    resolve(caches.match('pages/offline.html'));
                }
            } else {
                flag = true;
            }
        };
        fetch(e.request).then(resFetch => {
            resFetch.ok ? resolve(resFetch): failsOnce();
        }).catch(failsOnce);
        caches.match(e.request).then(sourceCache => {
            sourceCache.ok ? resolve(sourceCache): failsOnce();
        }).catch(failsOnce);
    });
    e.respondWith(source);

    // if(e.request.url.includes('alfredito.jpg'))
    // e.respondWith(fetch('img/joan.jpg'));
    // else
    // e.respondWith(fetch(e.request));

    //Estrategias del caché

    //1. Cache only
    //e.respondWith(caches.match(e.request));

    //2. Cache with network fallback
    //siempre busca en caché y si no encuentra va al internet
    // const source = (caches.match(e.request).then(res => {
    //     if (res) return res;
    //     return fetch(e.request).then(resFetch => {
    //         caches.open(DYNAMIC).then(cache => {
    //             cache.put(e.request, resFetch);
    //         });
    //         return resFetch.clone();
    //     });
    // }));
    // e.respondWith(source);

    //3. Network with cache fallback
    //siempre busca en internet y si no encuentra va al caché
    // const source = fetch(e.request).then(res => {
    //     if (!res) throw Error("NotFound");
    //     caches.open(DYNAMIC).then(cache => {
    //         cache.put(e.request, res);
    //     });
    //     return res.clone();
    // }).catch((err) => {
    //     return caches.match(e.request);
    // });
    // e.respondWith(source);

    //4. Cache with network update
    //Primero todo lo devuelve del caché y una vez devuelto, actualiza el recurso
    //Se utiliza cuando nuestra app tenga un rendimiento crítico, cuando nuestro hardware este muy lento
    //Desventaja: siempre se queda un paso atrás
    // const source = caches.open(STATIC).then(cache => {
    //     fetch(e.request).then(resFetch => {
    //         cache.put(e.request, resFetch);
    //     });
    //     return caches.match(e.request);
    // });
    // e.respondWith(source);

    //5. Cache and network race
    //El que conteste primero es el que se va a ejecutar
    // const source = new Promise((resolve, reject) => {
    //     let flag = false;
    //     const failsOnce = () => {
    //         if (flag) {
    //             //Si falló una vez aquí vamos a poner la lógica para controlarlo
    //             if (/\.(png|jpg)/i.test(e.request.url)) {
    //                 resolve(caches.match('/img/not-found.png'));
    //             } else {
    //                 reject('SourceNotFound');
    //             }
    //         } else {
    //             flag = true;
    //         }
    //     };
    //     fetch(e.request).then(resFetch => {
    //         resFetch.ok ? resolve(resFetch): failsOnce();
    //     }).catch(failsOnce);
    //     caches.match(e.request).then(sourceCache => {
    //         sourceCache.ok ? resolve(sourceCache): failsOnce();
    //     }).catch(failsOnce);
    // });
    // e.respondWith(source);
});
