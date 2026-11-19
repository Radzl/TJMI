# Prepara los tres modelos de Sketchfab para la escena (2026-11-19).
#
#   python -I scripts/modelos/preparar.py scripts/modelos <descargas> <salida>
#
# Necesita Python con numpy y Pillow; no es parte de la web ni de la CI.
# <descargas> lleva una carpeta por modelo con lo que da Sketchfab, que pide
# cuenta para descargar y por eso no está en el repositorio:
#   carretilla/carretilla.glb   «Warehouse Forklift Gameready», GLB con texturas de 1k
#   pale/pale.glb               «EPAL pallet», GLB con texturas de 1k
#   contenedor/contenedor.glb   «20ft Container», el GLB original (va dentro del zip)
# Deja en <salida> carretilla.glb, pale.glb y contenedor.glb, que son los que
# se copian a public/models. Qué hace con cada uno está en CLAUDE.md, «Los
# modelos de Sketchfab».
import sys, io, json, struct
sys.path.insert(0, sys.argv[1])
import numpy as np
from PIL import Image
from glb import leer, accesor, mallas_mundo

DESC, SALIDA = sys.argv[2], sys.argv[3]

# ---------------------------------------------------------------- utilidades

def linear(M):
    return M[:3, :3]

def transformar(pos, nor, M):
    p = (np.c_[pos.astype(np.float64), np.ones(len(pos))] @ M.T)[:, :3]
    n = None
    if nor is not None:
        N = np.linalg.inv(linear(M)).T
        n = nor.astype(np.float64) @ N.T
        n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    return p, n

def primitiva(j, binario, p, M):
    pos = accesor(j, binario, p['attributes']['POSITION'])
    nor = accesor(j, binario, p['attributes']['NORMAL']) if 'NORMAL' in p['attributes'] else None
    uv = accesor(j, binario, p['attributes']['TEXCOORD_0']).astype(np.float32) if 'TEXCOORD_0' in p['attributes'] else None
    idx = accesor(j, binario, p['indices']).ravel().astype(np.uint32)
    pos, nor = transformar(pos, nor, M)
    if np.linalg.det(linear(M)) < 0:
        t = idx.reshape(-1, 3); idx = t[:, [0, 2, 1]].ravel()
    return pos, nor, uv, idx

def jpeg(im, lado, calidad=86):
    im = im.convert('RGB').resize((lado, lado), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=calidad, optimize=True, progressive=False)
    return b.getvalue()

def imagen_de(j, binario, indice_textura):
    im = j['images'][j['textures'][indice_textura]['source']]
    bv = j['bufferViews'][im['bufferView']]
    datos = binario[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
    return Image.open(io.BytesIO(datos))

def escribir(ruta, mallas, materiales, imagenes, copyright):
    """mallas: [{name, material, pos, nor, uv|None, idx}]; imagenes: [bytes jpeg]."""
    partes, vistas, accesores = [], [], []
    largo = 0
    def añadir(datos, objetivo=None):
        nonlocal largo
        pad = (-largo) % 4
        if pad: partes.append(b'\0' * pad); largo += pad
        v = {'buffer': 0, 'byteOffset': largo, 'byteLength': len(datos)}
        if objetivo: v['target'] = objetivo
        vistas.append(v); partes.append(datos); largo += len(datos)
        return len(vistas) - 1
    def acc(arr, tipo, comp, objetivo, minmax=False):
        vista = añadir(arr.tobytes(), objetivo)
        a = {'bufferView': vista, 'componentType': comp, 'count': len(arr), 'type': tipo}
        if minmax:
            a['min'] = arr.min(0).astype(float).tolist(); a['max'] = arr.max(0).astype(float).tolist()
        accesores.append(a); return len(accesores) - 1
    jm, nodos = [], []
    for m in mallas:
        attrs = {'POSITION': acc(m['pos'].astype(np.float32), 'VEC3', 5126, 34962, True)}
        if m['nor'] is not None: attrs['NORMAL'] = acc(m['nor'].astype(np.float32), 'VEC3', 5126, 34962)
        if m['uv'] is not None: attrs['TEXCOORD_0'] = acc(m['uv'].astype(np.float32), 'VEC2', 5126, 34962)
        n = len(m['pos'])
        idx = m['idx'].astype(np.uint16 if n < 65536 else np.uint32)
        ia = acc(idx.reshape(-1, 1), 'SCALAR', 5123 if n < 65536 else 5125, 34963)
        accesores[ia]['count'] = len(idx)
        jm.append({'name': m['name'], 'primitives': [{'attributes': attrs, 'indices': ia, 'material': m['material']}]})
        nodos.append({'name': m['name'], 'mesh': len(jm) - 1})
    imgs = [{'bufferView': añadir(d), 'mimeType': 'image/jpeg'} for d in imagenes]
    j = {
        'asset': {'version': '2.0', 'generator': 'TJMI scripts preparar.py', 'copyright': copyright},
        'scene': 0, 'scenes': [{'nodes': list(range(len(nodos)))}], 'nodes': nodos, 'meshes': jm,
        'materials': materiales, 'accessors': accesores, 'bufferViews': vistas,
        'buffers': [{'byteLength': largo}],
    }
    if imgs:
        j['images'] = imgs
        j['samplers'] = [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]
        j['textures'] = [{'source': i, 'sampler': 0} for i in range(len(imgs))]
    binario = b''.join(partes); binario += b'\0' * ((-len(binario)) % 4)
    js = json.dumps(j, separators=(',', ':'), ensure_ascii=False).encode('utf8')
    js += b' ' * ((-len(js)) % 4)
    total = 12 + 8 + len(js) + 8 + len(binario)
    with open(ruta, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
        f.write(struct.pack('<II', len(binario), 0x004E4942)); f.write(binario)
    print(ruta.split('/')[-1], total, 'bytes')

def componentes(pos, idx):
    clave = np.round(pos, 5)
    _, unico = np.unique(clave, axis=0, return_inverse=True); unico = unico.ravel()
    padre = np.arange(unico.max() + 1)
    def raiz(a):
        while padre[a] != a:
            padre[a] = padre[padre[a]]; a = padre[a]
        return a
    t = idx.reshape(-1, 3)
    for a, b, c in t:
        ra, rb, rc = raiz(unico[a]), raiz(unico[b]), raiz(unico[c])
        padre[rb] = ra; padre[raiz(rc)] = ra
    comp_tri = np.array([raiz(unico[a]) for a in t[:, 0]])
    return comp_tri

# ---------------------------------------------------------------- carretilla

j, binario = leer(f'{DESC}/carretilla/carretilla.glb')
mi, M = mallas_mundo(j)[0]
prim = j['meshes'][mi]['primitives'][0]
pos, nor, uv, idx = primitiva(j, binario, prim, M)  # metros, frente hacia +Z

# Piezas sueltas: el carro con las horquillas, y la parte interior del mástil.
comp_tri = componentes(pos, idx)
tris = idx.reshape(-1, 3)
sube_carro = np.zeros(len(pos), bool)
sube_mastil = np.zeros(len(pos), bool)
for cid in np.unique(comp_tri):
    v = np.unique(tris[comp_tri == cid])
    mn, mx = pos[v].min(0), pos[v].max(0)
    if mn[2] >= 1.54:
        sube_carro[v] = True
    elif mn[2] >= 1.30 and mx[2] <= 1.53 and mx[1] >= 2.4:
        sube_mastil[v] = True

horquilla = sube_carro & (pos[:, 2] > 1.9)
cara_horquilla = pos[horquilla, 1].max()
PISO = 1.20                      # TRUCK.deckTop: donde va la base del lote
SUBE = PISO - cara_horquilla     # el carro y las horquillas
techo_carro = pos[sube_carro, 1].max() + SUBE
techo_mastil = pos[sube_mastil, 1].max()
SUBE_MASTIL = round(techo_carro - techo_mastil + 0.04, 3)
pos[sube_carro, 1] += SUBE
pos[sube_mastil, 1] += SUBE_MASTIL
print(f'carretilla: cara de horquilla {cara_horquilla:.3f} -> sube {SUBE:.3f}; mástil interior +{SUBE_MASTIL}')
print('  vértices del carro', int(sube_carro.sum()), 'del mástil', int(sube_mastil.sum()))

# A la convención de la escena: mira a +X, origen en la punta de las horquillas
# y a ras de suelo, centrada a lo ancho.
caja_min, caja_max = pos.min(0), pos.max(0)
punta = caja_max[2]; suelo = caja_min[1]; centro_x = (caja_min[0] + caja_max[0]) / 2
G = np.eye(4)
G[:3, :3] = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]]   # +Z -> +X (giro de +90° en Y)
G[:3, 3] = G[:3, :3] @ -np.array([centro_x, suelo, punta])
pos, nor = transformar(pos, nor, G)
print('  caja final', pos.min(0).round(3), pos.max(0).round(3))
sel = (pos[:, 0] < -2.0) & (pos[:, 0] > -3.4)
print('  techo protector', pos[sel, 1].max().round(3))

# Texturas: se tapan las letras («SQUIRE», la «S» y «SJT-9» dos veces) y se
# bajan a 512 / 256. La de especular se va con su extensión.
mat = j['materials'][prim['material']]
pbr = mat['pbrMetallicRoughness']
color = np.array(imagen_de(j, binario, pbr['baseColorTexture']['index']).convert('RGB')).astype(np.uint8)
def tapar(x0, y0, x1, y1, muestra):
    sx0, sy0, sx1, sy1 = muestra
    c = np.median(color[sy0:sy1, sx0:sx1].reshape(-1, 3), axis=0)
    color[y0:y1, x0:x1] = c.astype(np.uint8)
tapar(45, 201, 84, 220, (95, 193, 150, 200))       # SJT-9, arriba a la izquierda
tapar(84, 391, 113, 423, (68, 395, 84, 420))      # la S
tapar(430, 554, 518, 572, (440, 544, 510, 552))   # SQUIRE
color[431:467, 803:823] = color[431:467, 783:803]  # SJT-9 vertical: parche de al lado
im_color = Image.fromarray(color)
im_color.save(f'{SALIDA}/carretilla-color-tapada.png')
im_mr = imagen_de(j, binario, pbr['metallicRoughnessTexture']['index'])
escribir(f'{SALIDA}/carretilla.glb',
         [{'name': 'carretilla', 'material': 0, 'pos': pos, 'nor': nor, 'uv': uv, 'idx': idx}],
         [{'name': 'carretilla', 'pbrMetallicRoughness': {
             'baseColorTexture': {'index': 0}, 'metallicRoughnessTexture': {'index': 1},
             'metallicFactor': pbr.get('metallicFactor', 1), 'roughnessFactor': pbr.get('roughnessFactor', 1)}}],
         [jpeg(im_color, 512), jpeg(im_mr, 256)],
         '«Warehouse Forklift Gameready» de Kamran Mughal, CC BY 4.0, sketchfab.com/3d-models/warehouse-forklift-gameready-94e21059f00c4e989c6403ada034516e. Modificado: letras quitadas, horquillas y mástil elevados, texturas reducidas.')

# ---------------------------------------------------------------- palé

PALE = {'largo': 1.2, 'alto': 0.14, 'fondo': 0.85}   # PALLET en Pallets.tsx
j, binario = leer(f'{DESC}/pale/pale.glb')
madera = None
for mi, M in mallas_mundo(j):
    p = j['meshes'][mi]['primitives'][0]
    if j['materials'][p['material']]['name'] == 'Material.001':   # la madera; la otra son los clavos
        madera = (p, M)
p, M = madera
pos, nor, uv, idx = primitiva(j, binario, p, M)
mn, mx = pos.min(0), pos.max(0); t = mx - mn
# El largo del modelo va en Z: se gira para que vaya en X y se ajusta a las
# medidas del palé de la escena, con la base en y = 0 y centrado.
G = np.eye(4)
G[:3, :3] = [[0, 0, 1], [0, 1, 0], [-1, 0, 0]]
pos, nor = transformar(pos, nor, G)
mn, mx = pos.min(0), pos.max(0); t = mx - mn
S = np.diag([PALE['largo'] / t[0], PALE['alto'] / t[1], PALE['fondo'] / t[2], 1.0])
T = np.eye(4); T[:3, 3] = -np.array([(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2])
pos, nor = transformar(pos, nor, S @ T)
print('palé: escala', np.diag(S)[:3].round(4), 'caja', pos.min(0).round(3), pos.max(0).round(3))
mat = j['materials'][p['material']]
im = imagen_de(j, binario, mat['pbrMetallicRoughness']['baseColorTexture']['index']).convert('RGB')
a = np.array(im).astype(np.float64)
objetivo = np.array([0xb0, 0x8d, 0x63], float)   # WOOD de Pallets.tsx: pino de palé nuevo
a *= objetivo / a.reshape(-1, 3).mean(0)
im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
escribir(f'{SALIDA}/pale.glb',
         [{'name': 'pale', 'material': 0, 'pos': pos, 'nor': nor, 'uv': uv, 'idx': idx}],
         [{'name': 'madera', 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0,
                                                      'roughnessFactor': 0.85}}],
         [jpeg(im, 512, 84)],
         '«EPAL pallet» de ChoboiAssets, CC BY 4.0, sketchfab.com/3d-models/epal-pallet-1afaf577cf0e42dfbd6dd4a0bd7ab87c. Modificado: sin clavos, a medida y textura aclarada y reducida.')

# ---------------------------------------------------------------- contenedor

CONT = {'largo': 6.06, 'alto': 1.28 * 6.06 / 3.16, 'ancho': 1.34 * 6.06 / 3.16}   # CONTAINER de antes
j, binario = leer(f'{DESC}/contenedor/contenedor.glb')
nombres = {'Material.001': 'chapa', 'Material': 'herrajes', 'Material.002': 'cierres'}
grupos = {}
todas = []
for mi, M in mallas_mundo(j):
    for p in j['meshes'][mi]['primitives']:
        pos, nor, _, idx = primitiva(j, binario, p, M)
        nombre = nombres[j['materials'][p['material']]['name']]
        grupos.setdefault(nombre, []).append((pos, nor, idx))
        todas.append(pos)
allp = np.vstack(todas); mn, mx = allp.min(0), allp.max(0); t = mx - mn
S = np.diag([CONT['largo'] / t[0], CONT['alto'] / t[1], CONT['ancho'] / t[2], 1.0])
T = np.eye(4); T[:3, 3] = -(mn + mx) / 2
mallas, materiales = [], []
originales = {m['name']: m for m in j['materials']}
for k, nombre in enumerate(['chapa', 'herrajes', 'cierres']):
    P, N, I, base = [], [], [], 0
    for pos, nor, idx in grupos[nombre]:
        pos, nor = transformar(pos, nor, S @ T)
        P.append(pos); N.append(nor); I.append(idx + base); base += len(pos)
    mallas.append({'name': nombre, 'material': k, 'pos': np.vstack(P), 'nor': np.vstack(N), 'uv': None,
                   'idx': np.concatenate(I)})
    orig = originales[[o for o, n in nombres.items() if n == nombre][0]]['pbrMetallicRoughness']
    materiales.append({'name': nombre, 'pbrMetallicRoughness': {
        'baseColorFactor': orig['baseColorFactor'], 'metallicFactor': orig.get('metallicFactor', 1),
        'roughnessFactor': orig.get('roughnessFactor', 1)}})
print('contenedor: escala', np.diag(S)[:3].round(4), 'caja', np.vstack([m['pos'] for m in mallas]).min(0).round(3),
      np.vstack([m['pos'] for m in mallas]).max(0).round(3))
escribir(f'{SALIDA}/contenedor.glb', mallas, materiales, [],
         '«20ft Container» de Europhil, CC BY 4.0, sketchfab.com/3d-models/20ft-container-07c7df70eebd40ec8321060029482358. Modificado: piezas fundidas por material y a medida.')
