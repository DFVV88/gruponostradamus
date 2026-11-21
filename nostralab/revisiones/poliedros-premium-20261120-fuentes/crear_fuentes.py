from pathlib import Path
import json, itertools, math
import numpy as np
from scipy.spatial import ConvexHull

root=Path(__file__).resolve().parent
src=root/'fuentes'; src.mkdir(exist_ok=True)
plugin=Path('C:/Users/ferna/.codex/plugins/cache/created-by-me-remote/nostralab/1.20.0')
spec={'id':'poliedros-regulares-v41','code':'GEO · 3D','course':'Matemática','academic_title':'Poliedros regulares convexos','title_lines':['¿POR QUÉ','SOLO','CINCO?'],'title_sizes':[78,112,108],'title_baselines':[258,360,462],'title_x':55,'title_max_width':530,'model':'Caras regulares congruentes; igual número q de caras por vértice; q >= 3; q(p-2)180/p < 360','conditions':'Poliedros regulares convexos. (p,q) = (3,3),(4,3),(3,4),(5,3),(3,5).','authorization':'Usuario: PROCEDE, 2026-11-20; corregir y publicar pareja conservando HTML e ID.'}
(src/'contenido.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
phi=(1+math.sqrt(5))/2
sg=(-1,1)
tet=-np.array([(1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)],float)
cube=np.array(list(itertools.product(sg,repeat=3)),float)
octa=np.vstack([np.eye(3),-np.eye(3)])
ico=np.array([(0,a,b*phi) for a in sg for b in sg]+[(a,b*phi,0) for a in sg for b in sg]+[(b*phi,0,a) for a in sg for b in sg])
dod=np.array(list(itertools.product(sg,repeat=3))+[(0,a/phi,b*phi) for a in sg for b in sg]+[(a/phi,b*phi,0) for a in sg for b in sg]+[(b*phi,0,a/phi) for a in sg for b in sg])
ax,ay=.35,.55
rx=np.array([[1,0,0],[0,math.cos(ax),-math.sin(ax)],[0,math.sin(ax),math.cos(ax)]])
ry=np.array([[math.cos(ay),0,math.sin(ay)],[0,1,0],[-math.sin(ay),0,math.cos(ay)]])
rot=rx@ry
lines=[]; checks=[]
solids=[('TETRAEDRO',tet,4,6,3,710,236,65),('HEXAEDRO',cube,6,12,4,925,236,67),('OCTAEDRO',octa,8,12,3,1140,236,69),('DODECAEDRO',dod,12,30,5,795,439,88),('ICOSAEDRO',ico,20,30,3,1060,439,88)]
for name,vertices,nfaces,nedges,nsides,cx,cy,radius in solids:
    hull=ConvexHull(vertices); groups={}
    for tri,eq in zip(hull.simplices,hull.equations):
        key=tuple(np.round(eq,7)); groups.setdefault(key,set()).update(map(int,tri))
    assert len(groups)==nfaces
    faces=[]; edges=set()
    for eq,indices in groups.items():
        ids=list(indices); assert len(ids)==nsides
        normal=np.array(eq[:3]); center=vertices[ids].mean(axis=0)
        u=vertices[ids[0]]-center;u/=np.linalg.norm(u);v=np.cross(normal,u)
        ids.sort(key=lambda i:math.atan2(np.dot(vertices[i]-center,v),np.dot(vertices[i]-center,u)))
        for a,b in zip(ids,ids[1:]+ids[:1]):edges.add(tuple(sorted((a,b))))
        faces.append((ids,normal))
    lengths=[np.linalg.norm(vertices[a]-vertices[b]) for a,b in edges]
    assert len(edges)==nedges and max(lengths)-min(lengths)<1e-6
    assert len(vertices)-len(edges)+len(faces)==2
    points=vertices@rot.T; points*=radius/max(np.linalg.norm(p) for p in points)
    visible=[(ids,normal@rot.T) for ids,normal in faces if (normal@rot.T)[2]>.0001]
    visible.sort(key=lambda it:points[it[0],2].mean())
    lines.append(r'\begin{scope}[shift={('+f'{cx},{cy}'+')}]')
    lines.append(r'\fill[Cyan,opacity=.07] (0,0) circle[radius='+str(radius*1.15)+'];')
    # Occluded edges are omitted; the visible face network is mathematically exact.
    for ids,normal in visible:
        shade=int(20+52*max(0,float(np.dot(normal,np.array([-.3,.5,.8])/np.linalg.norm([-.3,.5,.8])))))
        path='--'.join(f'({points[i,0]:.3f},{-points[i,1]:.3f})' for i in ids)+'--cycle'
        lines.append(r'\path[fill=Cyan!'+str(shade)+r'!Deep,draw=Light!65!Cyan,line width=1.35bp,line join=round] '+path+';')
    lines.append(r'\end{scope}')
    ly=cy+radius+26
    lines.append(r'\node[text=Light,font=\bfseries\sz{20}] at ('+f'{cx},{ly}'+') {'+name+'};')
    lines.append(r'\node[text=Cyan,font=\sz{17}] at ('+f'{cx},{ly+25}'+') {'+str(nfaces)+' caras};')
    checks.append({'solid':name,'vertices':len(vertices),'edges':len(edges),'faces':len(faces),'sides_per_face':nsides,'equal_edges':True,'euler':2})
(src/'solidos.tex').write_text('\n'.join(lines),encoding='utf-8')
(root/'verificacion-geometrica.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
template=(plugin/'examples/portadas-premium/interferencia/plantilla.tex').read_text(encoding='utf-8')
template=template[:template.index('% Futuristic display')]
template=template.replace('{FÍSICA}','{MATEMÁTICA}').replace('{FIS-004}','{GEOMETRÍA · 3D}').replace('{SUPERPOSICIÓN E INTERFERENCIA}','{POLIEDROS REGULARES CONVEXOS}')
template+=r'''
\input{titular.tex}
\fill[Warm] (58,490) rectangle (63,552);
\node[anchor=north west,inner sep=0,text=Light,align=left,font=\sz{23}] at (81,486) {En cada vértice, los ángulos\\[5bp]deben sumar \textbf{menos de $360^\circ$.}};
\fill[black,opacity=.25] (60,581)--(516,581)--(516,614)--(498,632)--(60,632)--cycle;
\shade[top color=Cyan!90!Light,bottom color=Teal!75!Cyan] (55,575)--(510,575)--(510,608)--(490,626)--(55,626)--cycle;
\draw[Light!65!Cyan,line width=.9bp] (55,625)--(55,575)--(510,575);
\node[anchor=west,text=Deep,font=\bfseries\sz{22}] at (73,601) {EXPLORA LOS CINCO};
\draw[Deep,line width=2bp,-{Latex[length=9bp]}] (465,601)--(489,601);
\node[text=Light,font=\sz{18}] at (925,146) {CINCO SÓLIDOS · UNA CONDICIÓN};
\input{solidos.tex}
\draw[Teal!70,line width=.8bp] (655,590)--(1200,590);
\node[text=Warm,font=\bfseries\sz{24}] at (925,619) {Caras regulares · Cierre convexo};
\draw[Teal!60,line width=.8bp] (55,655)--(1225,655);
\node[anchor=west,text=Light,font=\bfseries\sz{15}] at (55,688) {GRUPO NOSTRADAMUS};
\node[anchor=east,text=Light,font=\sz{15}] at (1225,688) {GIRA · COMPARA · DESPLIEGA};
\end{scope}\end{tikzpicture}\end{document}
'''
# The diagram coordinates retain equal x/y scale in both formats.
# Adaptation uses an isotropic drawing scope around each solid center, preserving geometry.
solidtext=(src/'solidos.tex').read_text(encoding='utf-8')
solidtext=solidtext.replace(r'\begin{scope}[shift={',r'\begin{scope}[shift={')
solidtext=solidtext.replace(')}]',')},y=@K@bp]')
# Included files are not token-expanded by the compiler: use a macro defined by the master.
solidtext=solidtext.replace('@K@',r'\hscale ')
(src/'solidos.tex').write_text(solidtext,encoding='utf-8')
template=template.replace('·',r'\textperiodcentered{}')
template=template.replace(r'\begin{document}',r'\def\hscale{@K@}'+ '\n'+r'\begin{document}')
(src/'plantilla.tex').write_text(template,encoding='utf-8')
print(src)
