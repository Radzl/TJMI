# Utilidades mínimas para leer y escribir GLB con numpy.
import json, struct
import numpy as np

COMP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

def leer(ruta):
    b = open(ruta, 'rb').read()
    n = struct.unpack_from('<I', b, 12)[0]
    j = json.loads(b[20:20 + n])
    off = 20 + n
    nb = struct.unpack_from('<I', b, off)[0]
    binario = b[off + 8: off + 8 + nb]
    return j, binario

def accesor(j, binario, i):
    a = j['accessors'][i]
    bv = j['bufferViews'][a['bufferView']]
    dt = np.dtype(COMP[a['componentType']])
    nc = NCOMP[a['type']]
    inicio = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    paso = bv.get('byteStride', dt.itemsize * nc)
    if paso == dt.itemsize * nc:
        datos = np.frombuffer(binario, dtype=dt, count=a['count'] * nc, offset=inicio).reshape(a['count'], nc)
    else:
        filas = [np.frombuffer(binario, dtype=dt, count=nc, offset=inicio + k * paso) for k in range(a['count'])]
        datos = np.array(filas)
    if a.get('normalized'):
        datos = datos.astype(np.float32) / np.iinfo(dt).max
    return datos.copy()

def matriz_nodo(nd):
    if 'matrix' in nd:
        return np.array(nd['matrix'], dtype=np.float64).reshape(4, 4).T
    t = np.array(nd.get('translation', [0, 0, 0]), dtype=np.float64)
    q = nd.get('rotation', [0, 0, 0, 1]); x, y, z, w = q
    s = np.array(nd.get('scale', [1, 1, 1]), dtype=np.float64)
    R = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                  [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                  [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
    M = np.eye(4); M[:3, :3] = R * s; M[:3, 3] = t
    return M

def mallas_mundo(j):
    """Devuelve [(indice_malla, matriz_mundo)] recorriendo la escena."""
    out = []
    escena = j['scenes'][j.get('scene', 0)]
    def bajar(ni, padre):
        nd = j['nodes'][ni]
        M = padre @ matriz_nodo(nd)
        if 'mesh' in nd: out.append((nd['mesh'], M))
        for h in nd.get('children', []): bajar(h, M)
    for r in escena['nodes']: bajar(r, np.eye(4))
    return out
