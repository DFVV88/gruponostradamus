from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np,cv2,math,json
root=Path(__file__).resolve().parents[2]
out=root/"preview/collage-hero/output";out.mkdir(parents=True,exist_ok=True)
back=[("2022-1","1"),("2023-1","21"),("2024-1","47"),("2025-1","17"),("2026-1","21"),("2022-2","12"),("2023-2","36"),("2024-2","55"),("2025-2","26")]
front=[("2026-2","13"),("2025-1","3"),("2024-1","41"),("2023-2","33"),("2022-2","16"),("2024-2","5"),("2025-2","1"),("2026-2","4")]
W,H=2000,800
yy,xx=np.mgrid[0:H,0:W];t=xx/W;v=yy/H
a=np.stack((5+7*t+3*v,30+48*t+9*v,45+57*t+9*v),axis=2).astype(float)
g=np.exp(-(((t-.55)/.5)**2+((v-.40)/.65)**2)*1.9)
a[:,:,1]+=43*g;a[:,:,2]+=51*g
dst=Image.fromarray(np.uint8(np.clip(a,0,255)),"RGB").convert("RGBA")
dec=Image.new("RGBA",(W,H));draw=ImageDraw.Draw(dec)
draw.polygon([(0,0),(500,0),(0,570)],fill=(22,186,196,38))
draw.polygon([(200,0),(410,0),(0,630),(0,420)],fill=(8,206,219,26))
draw.polygon([(1700,0),(W,0),(W,390)],fill=(24,215,211,30))
draw.line([(0,115),(175,0)],fill=(245,193,78,175),width=5)
draw.line([(W,610),(1800,H)],fill=(242,198,96,170),width=5)
dst.alpha_composite(dec)
cascade=cv2.CascadeClassifier(cv2.data.haarcascades+"haarcascade_frontalface_default.xml")
if cascade.empty():raise ValueError("Face cascade unavailable")
notes=[]
def paste(year,num,x,y,diam,i,front=False):
 p=root/"assets/img/cachimbos"/year/("cachimbo"+num+".png")
 src=Image.open(p).convert("RGB");gray=cv2.cvtColor(np.asarray(src),cv2.COLOR_RGB2GRAY)
 ratio=min(1.,680/max(src.size));small=cv2.resize(gray,None,fx=ratio,fy=ratio) if ratio<1 else gray
 found=cascade.detectMultiScale(small,1.07,4,minSize=(25,25))
 hits=[tuple(float(q)/ratio for q in h) for h in found]
 if hits:
  bx,by,bw,bh=max(hits,key=lambda h:h[2]*h[3]*(1-.35*abs(h[0]+h[2]/2-src.width/2)/(src.width/2)))
 else:bx,by,bw,bh=src.width*.35,src.height*.20,src.width*.28,src.width*.28
 side=min(min(src.size),max(bw*2.40,bh*2.34))
 cx=bx+bw/2;cy=by+bh*.80
 left=max(0,min(src.width-side,cx-side/2))
 top=max(0,min(src.height-side,cy-side*.47))
 face=src.crop((int(left),int(top),int(left+side),int(top+side))).resize((diam,diam),Image.Resampling.LANCZOS)
 pad=15;n=diam+pad*2
 plate=Image.new("RGBA",(n,n));dr=ImageDraw.Draw(plate)
 ring=(247,199,93,255) if i%4==0 else (84,222,233,255)
 dr.ellipse((2,2,n-3,n-3),fill=(2,29,38,255),outline=ring,width=5)
 mask=Image.new("L",(diam,diam));ImageDraw.Draw(mask).ellipse((0,0,diam-1,diam-1),fill=255)
 plate.paste(face,(pad,pad),mask)
 ox=int(x-n/2);oy=int(y-n/2)
 shadow=Image.new("RGBA",plate.size,(0,0,0,0));shadow.putalpha(plate.getchannel("A").filter(ImageFilter.GaussianBlur(22)))
 dst.alpha_composite(shadow,(ox+3,oy+12));dst.alpha_composite(plate,(ox,oy))
 notes.append({"periodo":year,"archivo":str(p.relative_to(root)),"rostro_detectado":len(hits)>0})
for i,((y,n),x) in enumerate(zip(back,np.linspace(145,1855,len(back)))):paste(y,n,int(x),230+17*(i%2),280,i)
for i,((y,n),x) in enumerate(zip(front,np.linspace(155,1845,len(front)))):paste(y,n,int(x),577+12*(i%2),350,i,True)
result=dst.convert("RGB")
result.save(out/"Collage_Hero_Cachimbos_2022_a_2026_Sin_Texto.png",optimize=True)
result.save(out/"Collage_Hero_Cachimbos_2022_a_2026_Sin_Texto.jpg",quality=94,optimize=True)
(out/"fuentes.json").write_text(json.dumps(notes,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"count":len(notes),"years":sorted(set(x["periodo"][:4] for x in notes)),"detected":sum(x["rostro_detectado"] for x in notes)},ensure_ascii=False))
