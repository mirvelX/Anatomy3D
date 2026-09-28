"""Reproduce draft face masks from the original, unmodified BodyParts3D OBJ files.

Regions were chosen after multi-view inspection in source millimetres. These are
coarse teaching regions, NOT expert-validated anatomical segmentation. Unassigned
faces stay in 'unsegmented'; never synthesize small features absent from the source.
"""
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'bodyparts3d'
ASSETS = {
    'C1': ('FJ3176', 'BP8831', 'FMA12519'),
    'C2': ('FJ3177', 'BP8459', 'FMA12520'),
    'C3': ('FJ3161', 'BP9108', 'FMA12521'),
    'L2': ('FJ3159', 'BP8995', 'FMA13073'),
    'L3': ('FJ3162', 'BP8227', 'FMA13074'),
    'L4': ('FJ3165', 'BP8133', 'FMA13075'),
}

def region(level, p):
    x, y, z = p; x = abs(x)
    if level == 'C1':
        if y < -79 and x < 14: return 'antArch'
        if y > -60 and x < 25: return 'postArch'
        if x > 25: return 'atlasTrans'
        if 10 < x < 25 and -79 <= y <= -60: return 'mass'
    if level == 'C2':
        if z > 1465 and x < 7 and y < -69: return 'dens'
        if y < -72 and z < 1454 and x < 17: return 'body'
        if y > -50 and x < 8: return 'spinous'
        if x > 21 and -69 < y < -56: return 'transverse'
    if level == 'L3':
        if y < -79: return 'body'
        if y > -54 and x < 8: return 'spinous'
        if x > 22 and -79 < y < -59: return 'transverse'
    return 'unsegmented'

manifest = {
    'version': 1, 'dataset': 'BodyParts3D 4.0 / IS-A / obj_99',
    'retrieved': '2026-09-28',
    'archiveUrl': 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip',
    'archiveBytes': 142903898,
    'license': 'CC-BY-SA-2.1-JP',
    'licenseUrl': 'https://creativecommons.org/licenses/by-sa/2.1/jp/',
    'attribution': 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan',
    'licenseDecision': 'Use the license embedded in each OBJ. The archive license page was updated to CC BY 4.0 on 2025-02-27; this pilot conservatively retains the asset-level ShareAlike license and notices.',
    'licenseEvidence': 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html',
    'units': 'mm', 'coordinates': 'Original shared whole-body coordinates; X lateral, Y posterior, Z superior. No independent bone rescaling or alignment.',
    'changes': 'Original OBJ bytes unchanged. Separate draft face-index masks; display-only common axis transform, translation, uniform scale and smooth shading. No generated anatomy or textures.',
    'segmentationStatus': 'draft-regions-not-expert-validated',
    'anatomySource': {'title': 'კაციტაძე · ადამიანის ანატომია · I ტომი (2017)', 'printedPages': [29,40], 'pdfPages': [30,41]},
    'assets': {},
}
for level,(file_id,bp,fma) in ASSETS.items():
    raw=(OUT/(file_id+'.obj')).read_bytes()
    vertices=[]; faces=[]
    for line in raw.decode().splitlines():
        fields=line.split()
        if not fields: continue
        if fields[0]=='v': vertices.append(list(map(float,fields[1:4])))
        if fields[0]=='f':
            face=[int(s.split('/')[0])-1 for s in fields[1:]]
            assert len(face)==3
            faces.append(face)
    groups={}
    for i,face in enumerate(faces):
        center=[sum(vertices[j][axis] for j in face)/3 for axis in range(3)]
        key=region(level,center)
        groups.setdefault(key,[]).append(i)
    # A coarse ROI can catch a disconnected fragment from an adjacent feature.
    # Keep only the main component (two for paired regions); return fragments to
    # the explicitly unsegmented remainder, without deleting any source face.
    for key,indices in list(groups.items()):
        if key == 'unsegmented': continue
        vertex_faces={}
        # OBJ may duplicate vertex indices at a seam. Connectivity is spatial;
        # do not mistake an anterior surface for an isolated stray triangle.
        vertex_key=lambda v: tuple(round(n,3) for n in vertices[v])
        for i in indices:
            for v in faces[i]: vertex_faces.setdefault(vertex_key(v),set()).add(i)
        unseen=set(indices); components=[]
        while unseen:
            pending=[unseen.pop()]; component=[]
            while pending:
                i=pending.pop(); component.append(i)
                adjacent=set().union(*(vertex_faces[vertex_key(v)] for v in faces[i])) & unseen
                unseen.difference_update(adjacent); pending.extend(adjacent)
            components.append(component)
        components.sort(key=len,reverse=True)
        keep=2 if key in ['mass','atlasTrans','transverse'] else 1
        groups[key]=sorted(i for c in components[:keep] for i in c)
        groups['unsegmented'].extend(i for c in components[keep:] for i in c)
    groups['unsegmented'].sort()
    mask={'sourceSha256': hashlib.sha256(raw).hexdigest(), 'status': manifest['segmentationStatus'], 'groups':groups}
    (OUT/(level+'.regions.json')).write_bytes((json.dumps(mask,separators=(',',':'))+'\n').encode())
    manifest['assets'][level]={
        'file':file_id+'.obj','fileId':file_id,'representationId':bp,'conceptId':fma,
        'sha256':mask['sourceSha256'],'bytes':len(raw),'vertices':len(vertices),'triangles':len(faces),
        'mask':level+'.regions.json','maskSha256':hashlib.sha256((OUT/(level+'.regions.json')).read_bytes()).hexdigest(),
        'sourceBoundsMm':[[min(v[a] for v in vertices) for a in range(3)],[max(v[a] for v in vertices) for a in range(3)]],
        'role':'pilot' if level in ['C1','C2','L3'] else 'neighbor-only',
        'regions':{k:len(v) for k,v in groups.items()},
        'bookPages':[31,32] if level in ['C1','C2','C3'] else [32,33],
        'clinicalValidation':False,
    }
(OUT/'manifest.json').write_bytes((json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print('Prepared six unchanged meshes and draft masks.')
