import Constants from 'expo-constants';

export async function buscarActualizacion() {
  const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
  const repo = extra.githubRepo;
  const actual = Number(extra.buildNumber) || 0;

  if (!repo || !actual) return null;

  const respuesta = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!respuesta.ok) return null;

  const datos = await respuesta.json();
  const coincidencia = /build-(\d+)/.exec(datos.tag_name || '');
  if (!coincidencia) return null;

  const ultima = Number(coincidencia[1]);
  if (ultima <= actual) return null;

  const apk = (datos.assets || []).find((a) => /\.apk$/i.test(a.name));
  return {
    build: ultima,
    nombre: datos.name || `Build ${ultima}`,
    url: apk ? apk.browser_download_url : datos.html_url,
  };
}
